<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">BreastCare</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/selfcheck">Self Check</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/finder">Finder</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/form">Form</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/reviews">Reviews</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/admin">Admin</RouterLink>
          </li>
        </ul>

        <div class="d-flex align-items-center">
          <template v-if="user">
            <span class="me-3 text-white small">{{ user.email }}</span>
            <button class="btn btn-sm btn-outline-light" @click="handleLogout">Logout</button>
          </template>

          <template v-else>
            <RouterLink class="btn btn-sm btn-outline-light me-2" to="/login">Login</RouterLink>
            <RouterLink class="btn btn-sm btn-light text-primary" to="/register"
              >Register</RouterLink
            >
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuth } from '../auth/useAuth.js'

const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  window.location.reload()
}
</script>

<style scoped>
.nav-link.router-link-active {
  font-weight: 600;
}
</style>
