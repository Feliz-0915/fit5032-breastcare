<template>
  <div>
    <NavBar />

    <main id="main" class="py-4">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'

onMounted(() => {
  document.documentElement.lang = 'en'
})
</script>

<style>
:root {
  --theme-blue: #002b80;
}

body {
  background-color: #ffffff;
  color: #212529;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}

a,
a:visited {
  color: var(--theme-blue);
  text-decoration: none;
}

a:hover,
a:focus {
  color: #001f5c;
  text-decoration: underline;
}

.btn-primary {
  background-color: var(--theme-blue) !important;
  border-color: var(--theme-blue) !important;
  color: #fff !important;
}

.btn-outline-primary {
  color: var(--theme-blue) !important;
  border-color: var(--theme-blue) !important;
}

.btn-outline-primary:hover {
  background-color: var(--theme-blue) !important;
  color: #fff !important;
}

h1,
h2,
h3,
h4,
h5 {
  color: var(--theme-blue);
}

.table thead th {
  background-color: var(--theme-blue) !important;
  color: #fff !important;
}

:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

main {
  min-height: 80vh;
}

.container {
  max-width: 960px;
}

.navbar .btn-light {
  background-color: #ffffff !important;
  color: var(--theme-blue) !important;
  border: 1px solid var(--theme-blue) !important;
  font-weight: 600;
}

.navbar .btn-light:hover {
  background-color: var(--theme-blue) !important;
  color: #ffffff !important;
}

.navbar .btn-outline-light {
  color: #ffffff !important;
  border-color: #ffffff !important;
  font-weight: 600;
}

.navbar .btn-outline-light:hover {
  background-color: #ffffff !important;
  color: var(--theme-blue) !important;
}

.navbar-dark .nav-link {
  color: #ffffff !important;
  font-weight: 500;
}

.navbar-dark .nav-link:hover,
.navbar-dark .nav-link:focus {
  color: #ffcc00 !important;
  text-decoration: none;
}

.nav-link.router-link-active {
  color: #ffd700 !important;
  font-weight: 600;
}
</style>
