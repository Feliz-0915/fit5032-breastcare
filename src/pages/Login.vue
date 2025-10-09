<template>
  <main class="container py-5" style="max-width: 480px">
    <h2 class="mb-4 text-center" :key="modeKey">{{ isAdminMode ? 'Admin Login' : 'Login' }}</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="onEmailLogin" class="mb-4">
      <input v-model="email" type="email" class="form-control mb-2" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        class="form-control mb-3"
        placeholder="Password"
        required
      />
      <button class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Signing in…' : isAdminMode ? 'Login as Admin' : 'Login with Email' }}
      </button>
    </form>

    <button
      class="btn btn-outline-secondary w-100 mb-3"
      @click="toggleAdminMode"
      :disabled="loading"
    >
      {{ isAdminMode ? 'Back to User Login' : 'Admin Entrance' }}
    </button>

    <button class="btn btn-outline-primary w-100 mb-4" @click="onGoogleLogin" :disabled="loading">
      {{ loading ? 'Connecting…' : 'Sign in with Google' }}
    </button>

    <p class="text-muted text-center">
      No account? <router-link to="/register">Create one</router-link>
    </p>

    <div v-if="user" class="text-center mt-3">
      <p>Welcome, {{ user.email }}</p>
      <button class="btn btn-secondary w-100" @click="logout">Logout</button>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../auth/useAuth.js'

const route = useRoute()
const router = useRouter()
const { user, loginWithGoogle, loginWithEmail, logout, loading } = useAuth()

const isAdminMode = ref(false)
const modeKey = ref(0)
const email = ref('')
const password = ref('')
const error = ref('')

const updateMode = () => {
  const isAdmin = route.query.mode === 'admin'
  if (isAdmin !== isAdminMode.value) {
    isAdminMode.value = isAdmin
    modeKey.value++
  }
}

onMounted(updateMode)
watch(() => route.fullPath, updateMode)

const onEmailLogin = async () => {
  error.value = ''
  try {
    await loginWithEmail(email.value, password.value)
    if (isAdminMode.value) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (e) {
    error.value = e.message
  }
}

const onGoogleLogin = async () => {
  error.value = ''
  try {
    await loginWithGoogle()
    if (isAdminMode.value) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (e) {
    error.value = e.message
  }
}

const toggleAdminMode = async () => {
  isAdminMode.value = !isAdminMode.value
  await nextTick()
  if (isAdminMode.value) {
    router.replace({ name: 'login', query: { mode: 'admin' } })
  } else {
    router.replace({ name: 'login' })
  }
}
</script>

<style scoped>
.container {
  text-align: center;
}
</style>
