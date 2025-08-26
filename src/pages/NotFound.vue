<template>
  <div class="text-center py-5">
    <h2 class="h4 mb-2">Page not found</h2>
    <p class="text-muted mb-3">The page you requested does not exist.</p>
    <RouterLink class="btn btn-outline-primary" to="/">Back to Home</RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router'
</script>
