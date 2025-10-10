<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary w-100">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <RouterLink class="navbar-brand fw-bold text-white me-4" to="/">BreastCare</RouterLink>
        <ul class="navbar-nav">
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
          <li class="nav-item">
            <RouterLink class="nav-link" to="/email">Email</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/table">Table</RouterLink>
          </li>
        </ul>
      </div>

      <div class="d-flex align-items-center">
        <template v-if="user">
          <span class="me-3 text-white small">{{ user.email }}</span>
          <button class="btn btn-sm btn-light text-primary" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink class="btn btn-sm btn-outline-light me-2" to="/login">Login</RouterLink>
          <RouterLink class="btn btn-sm btn-light text-primary" to="/register">Register</RouterLink>
        </template>
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
.navbar {
  width: 100%;
  margin: 0;
  padding-left: 0;
  padding-right: 0;
}
</style>
