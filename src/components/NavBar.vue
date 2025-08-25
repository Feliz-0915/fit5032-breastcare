<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">BreastCare</RouterLink>

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
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/selfcheck">Self Check</RouterLink>
          </li>
          <li class="nav-item"><RouterLink class="nav-link" to="/finder">Finder</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/form">Form</RouterLink></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
