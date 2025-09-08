<template>
  <main class="container py-5" style="max-width: 480px">
    <h2 class="mb-4">{{ isAdminMode ? 'Admin Login' : 'Login' }}</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <form @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model.trim="email" type="email" class="form-control" required />
        <div v-if="isAdminMode" class="form-text">
          Admin mode is ON. Please enter the admin password.
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>

      <button class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Signing in…' : isAdminMode ? 'Login as Admin' : 'Login' }}
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary w-100 mt-2"
        @click="enterAdminMode"
        :disabled="loading || isAdminMode"
      >
        Admin Entrance
      </button>

      <p class="text-muted mt-3 mb-0">
        No account? <router-link to="/register">Create one</router-link>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@demo.local'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin1234'

const router = useRouter()
const route = useRoute()
const { login, ensureSeedAdmin } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isAdminMode = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (e) {
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

async function enterAdminMode() {
  error.value = ''
  try {
    await ensureSeedAdmin(ADMIN_EMAIL, ADMIN_PASSWORD)
    isAdminMode.value = true
    email.value = ADMIN_EMAIL
  } catch (e) {
    error.value = e?.message || 'Failed to enter admin mode'
  }
}
</script>
