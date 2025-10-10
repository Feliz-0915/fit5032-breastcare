<template>
  <div>
    <NavBar />
    <main class="py-4">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>
