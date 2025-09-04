<template>
  <main class="container py-5" style="max-width: 480px">
    <h2 class="mb-4">Register</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label">Name (optional)</label>
        <input v-model.trim="name" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model.trim="email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
        <div class="form-text">At least 8 chars, include upper/lower/digit.</div>
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
import { useRouter } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    router.replace('/')
  } catch (e) {
    error.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
