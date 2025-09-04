<template>
  <div>
    <nav class="navbar navbar-light bg-light">
      <div class="container d-flex justify-content-between">
        <NavBar />
        <AuthStatus />
      </div>
    </nav>

    <main class="py-4">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import AuthStatus from './components/AuthStatus.vue'
</script>
