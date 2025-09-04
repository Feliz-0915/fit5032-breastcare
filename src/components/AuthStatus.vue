<template>
  <div class="d-flex align-items-center gap-2">
    <template v-if="user">
      <span class="text-muted">Hi, {{ user.name }} ({{ user.email }})</span>
      <button class="btn btn-outline-secondary btn-sm" @click="onLogout">Logout</button>
      <router-link class="btn btn-outline-primary btn-sm" to="/protected">Protected</router-link>
    </template>
    <template v-else>
      <router-link class="btn btn-outline-primary btn-sm" to="/login">Login</router-link>
      <router-link class="btn btn-primary btn-sm" to="/register">Register</router-link>
    </template>
  </div>
</template>

<script setup>
import { useAuth } from '../auth/useAuth'
const { currentUser: user, logout } = useAuth()
function onLogout() {
  logout()
}
</script>
