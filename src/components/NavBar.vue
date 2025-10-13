<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary w-100" role="navigation">
    <a href="#main" class="skip-link" tabindex="0">Skip to main content</a>
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <RouterLink class="navbar-brand fw-bold text-white me-4" to="/">BreastCare</RouterLink>
        <ul class="navbar-nav">
          <li class="nav-item" v-for="link in navLinks" :key="link.to">
            <RouterLink class="nav-link" :to="link.to" tabindex="0">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="d-flex align-items-center">
        <template v-if="user">
          <span class="me-3 text-white small">{{ user.email }}</span>
          <button class="btn btn-sm btn-light text-primary" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink class="btn btn-sm btn-outline-light me-2" to="/login" tabindex="0">
            Login
          </RouterLink>
          <RouterLink class="btn btn-sm btn-light text-primary" to="/register" tabindex="0">
            Register
          </RouterLink>
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

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Self Check', to: '/selfcheck' },
  { label: 'Finder', to: '/finder' },
  { label: 'Appointment', to: '/appointment' },
  { label: 'Form', to: '/form' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Admin', to: '/admin' },
  { label: 'Email', to: '/email' },
  { label: 'Table', to: '/table' },
  { label: 'Cloud API', to: '/api' },
]
</script>

<style scoped>
.navbar.bg-primary {
  background-color: #002b80 !important;
}

.nav-link.router-link-active {
  font-weight: 600;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #ffffff;
  color: #000000;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s;
}
.skip-link:focus {
  top: 0;
  outline: 2px solid #000;
}

.btn-light.text-primary {
  color: #002b80 !important;
  font-weight: 600;
}

:focus-visible {
  outline: 3px solid #002b80;
  outline-offset: 2px;
}

.navbar {
  width: 100%;
  margin: 0;
  padding-left: 0;
  padding-right: 0;
}
</style>
