<template>
  <section class="text-center">
    <h1 class="display-6 fw-bold mb-3">BreastCare App (V1)</h1>
    <p class="text-muted mb-4">Vue 3 + Bootstrap · BR A/B/C demo</p>

    <!-- feature navigation -->
    <div class="d-flex gap-2 justify-content-center mb-3">
      <RouterLink class="btn btn-outline-primary" to="/selfcheck">Self-check Guide</RouterLink>
      <RouterLink class="btn btn-outline-primary" to="/finder">Screening Finder</RouterLink>
      <RouterLink class="btn btn-primary" to="/form">Try the Form</RouterLink>
    </div>
  </section>
</template>

<script setup></script>
