import { ref, computed, watch } from 'vue'

const USERS_KEY = 'app_users_v1'
const SESSION_KEY = 'app_session_v1'

function strToBuf(str) {
  return new TextEncoder().encode(str)
}
function bufToHex(buffer) {
  const bytes = new Uint8Array(buffer)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function hexToBuf(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((h) => parseInt(h, 16)))
}
function rndBytes(len = 16) {
  const a = new Uint8Array(len)
  crypto.getRandomValues(a)
  return a
}
async function pbkdf2(password, saltUint8, iterations = 100000, hash = 'SHA-256', length = 32) {
  const keyMaterial = await crypto.subtle.importKey('raw', strToBuf(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltUint8, iterations, hash },
    keyMaterial,
    length * 8,
  )
  return new Uint8Array(bits)
}

function readUsers() {
  try {
    const arr = JSON.parse(localStorage.getItem(USERS_KEY))
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function saveUsers(arr) {
  localStorage.setItem(USERS_KEY, JSON.stringify(arr ?? []))
}
function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY))
    return s && s.userId ? s : null
  } catch {
    return null
  }
}
function saveSession(s) {
  if (!s) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

const users = ref(readUsers())
const session = ref(readSession())
let listenersBound = false

export function useAuth() {
  const currentUser = computed(() => {
    if (!session.value) return null
    return users.value.find((u) => u.id === session.value.userId) ?? null
  })
  const isAuthenticated = computed(() => !!currentUser.value)

  function hasRole(...roles) {
    const u = currentUser.value
    if (!u) return false
    return roles.includes(u.role)
  }
  function requireRoles(allowed) {
    const u = currentUser.value
    if (!u) return false
    if (!allowed || !allowed.length) return true
    return allowed.includes(u.role)
  }

  if (!listenersBound && typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === USERS_KEY) users.value = readUsers()
      if (e.key === SESSION_KEY) session.value = readSession()
    })
    listenersBound = true
  }

  function ensureEmailUnique(email) {
    const exists = users.value.some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('Email already registered')
  }
  function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) throw new Error('Invalid email format')
  }
  function validatePassword(pw) {
    const okLen = pw.length >= 8
    const hasUpper = /[A-Z]/.test(pw)
    const hasLower = /[a-z]/.test(pw)
    const hasDigit = /\d/.test(pw)
    if (!(okLen && hasUpper && hasLower && hasDigit)) {
      throw new Error('Password must be ≥8 chars and include upper, lower, and a digit')
    }
  }

  async function register({ email, password, name, role = 'user' }) {
    validateEmailFormat(email)
    ensureEmailUnique(email)
    validatePassword(password)

    const salt = rndBytes(16)
    const hashBytes = await pbkdf2(password, salt)

    const user = {
      id: crypto.randomUUID(),
      email: email.trim(),
      name: (name ?? '').trim() || email.split('@')[0],
      role,
      salt: bufToHex(salt),
      hash: bufToHex(hashBytes),
      createdAt: new Date().toISOString(),
    }
    users.value = [...users.value, user]
    saveUsers(users.value)

    const token = bufToHex(rndBytes(16))
    session.value = { userId: user.id, token, loggedAt: Date.now() }
    saveSession(session.value)

    return user
  }

  async function login({ email, password }) {
    const user = users.value.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) throw new Error('Invalid email or password')

    const salt = hexToBuf(user.salt)
    const hashBytes = await pbkdf2(password, salt)
    const computed = bufToHex(hashBytes)
    if (computed !== user.hash) throw new Error('Invalid email or password')

    const token = bufToHex(rndBytes(16))
    session.value = { userId: user.id, token, loggedAt: Date.now() }
    saveSession(session.value)
    return user
  }

  function logout() {
    session.value = null
    saveSession(null)
  }

  watch(users, (v) => saveUsers(v), { deep: true })

  return {
    users,
    currentUser,
    isAuthenticated,
    hasRole,
    requireRoles,
    register,
    login,
    logout,
  }
}
