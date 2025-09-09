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
        <ul class="navbar-nav ms-auto">
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
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.nav-link.router-link-active {
  font-weight: 600;
}
</style>
