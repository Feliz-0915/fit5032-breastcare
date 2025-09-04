<template>
  <main class="container py-5" style="max-width: 480px">
    <h2 class="mb-4">Login</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model.trim="email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>
      <button class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Login' }}
      </button>
      <p class="text-muted mt-3 mb-0">
        No account?
        <router-link to="/register">Create one</router-link>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login({ email: email.value, password: password.value })
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } catch (e) {
    error.value = e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
