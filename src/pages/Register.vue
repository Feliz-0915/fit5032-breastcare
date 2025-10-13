<template>
  <main class="container py-5" style="max-width: 480px">
    <h2 class="mb-4">Register</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Name (optional)</label>
        <input v-model.trim="name" type="text" class="form-control" maxlength="40" />
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          v-model.trim="email"
          type="email"
          class="form-control"
          required
          autocomplete="email"
          pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        />
        <div class="form-text">Format: name@example.com</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <div class="input-group">
          <input
            :type="showPw ? 'text' : 'password'"
            v-model="password"
            class="form-control"
            required
            minlength="8"
          />
          <button type="button" class="btn btn-outline-secondary" @click="showPw = !showPw">
            {{ showPw ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div class="form-text">At least 8 chars, include upper/lower/digit.</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <div class="input-group">
          <input
            :type="showPw2 ? 'text' : 'password'"
            v-model="confirmPassword"
            class="form-control"
            required
            minlength="8"
          />
          <button type="button" class="btn btn-outline-secondary" @click="showPw2 = !showPw2">
            {{ showPw2 ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div class="form-text">Re-enter the same password.</div>
      </div>

      <button class="btn btn-success w-100" :disabled="loading">
        {{ loading ? 'Creating…' : 'Create account' }}
      </button>

      <p class="text-muted mt-3 mb-0">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

const router = useRouter()
const route = useRoute()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const showPw2 = ref(false)
const loading = ref(false)
const error = ref('')

function validate() {
  const errs = []
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errs.push('Invalid email')
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password.value))
    errs.push('Password must include upper, lower and digit')
  if (password.value !== confirmPassword.value) errs.push('Passwords do not match')
  if (name.value && name.value.length > 40) errs.push('Name too long')
  if (errs.length) {
    error.value = errs.join(' | ')
    return false
  }
  return true
}

async function onSubmit() {
  if (loading.value) return
  error.value = ''
  if (!validate()) return
  loading.value = true
  const auth = getAuth()
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value,
    )
    if (name.value) {
      await updateProfile(userCredential.user, { displayName: name.value.trim() })
    }
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/'
    router.replace(redirect)
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') error.value = 'Email already registered'
    else if (e.code === 'auth/weak-password') error.value = 'Password too weak'
    else error.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
