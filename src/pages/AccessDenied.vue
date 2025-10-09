<template>
  <main class="container py-5" style="max-width: 600px; text-align: center">
    <div class="card shadow-sm border-0">
      <div class="card-body p-5">
        <h2 class="text-danger fw-bold mb-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Access Denied
        </h2>

        <p class="text-muted mb-4">
          You do not have permission to view this page.<br />
          Please login with an authorized account to continue.
        </p>

        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-primary" @click="goToAdminLogin">Go to Admin Login</button>

          <RouterLink to="/" class="btn btn-outline-secondary"> Back to Home </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const goToAdminLogin = () => {
  console.log(' goToAdminLogin pressed')
  router.push({ path: '/login', query: { mode: 'admin' } })
}
</script>

<style scoped>
.card {
  border-radius: 1rem;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
}

.text-danger {
  color: #dc3545 !important;
}
</style>
