<script setup>
import { reactive, computed, watch } from 'vue'
import clinics from '../data/clinics.json'
import SavedFilters from '../components/SavedFilters.vue'

const LS_KEY = 'finderFilters'

function readLS() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY))
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

const filters = reactive(readLS() ?? { suburb: '', minRating: 0, sortBy: 'clinicName' })

watch(
  filters,
  (v) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(v))
    } catch {}
  },
  { deep: true },
)

const filtered = computed(() => {
  const list = clinics.filter(
    (c) =>
      (!filters.suburb || c.suburb.toLowerCase().includes(filters.suburb.toLowerCase())) &&
      (!filters.minRating || c.rating >= filters.minRating),
  )
  return list.sort((a, b) => {
    const va = String(a[filters.sortBy]).toLowerCase()
    const vb = String(b[filters.sortBy]).toLowerCase()
    return va.localeCompare(vb)
  })
})

function resetFilters() {
  filters.suburb = ''
  filters.minRating = 0
  filters.sortBy = 'clinicName'
  try {
    localStorage.removeItem(LS_KEY)
  } catch {}
}

function loadSaved(f) {
  filters.suburb = f.suburb || ''
  filters.minRating = f.minRating || 0
  filters.sortBy = f.sortBy || 'clinicName'
}
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Clinic Finder</h2>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label" for="suburb">Suburb</label>
        <input
          id="suburb"
          v-model.trim="filters.suburb"
          class="form-control"
          placeholder="e.g., Clayton"
        />
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="rating">Min Rating</label>
        <select id="rating" v-model.number="filters.minRating" class="form-select">
          <option :value="0">All</option>
          <option :value="4.5">4.5+</option>
          <option :value="4.7">4.7+</option>
          <option :value="4.9">4.9+</option>
        </select>
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="sort">Sort by</label>
        <select id="sort" v-model="filters.sortBy" class="form-select">
          <option value="clinicName">Clinic Name</option>
          <option value="suburb">Suburb</option>
        </select>
      </div>

      <div class="col-12 col-md-auto ms-auto text-end">
        <button type="button" class="btn btn-outline-secondary" @click="resetFilters">
          Reset filters
        </button>
      </div>
    </div>

    <div class="list-group mb-4">
      <div v-for="c in filtered" :key="c.id" class="list-group-item">
        <strong>{{ c.clinicName }}</strong> - {{ c.suburb }} ({{ c.rating }})
        <br />
        <small class="text-muted">Contact: {{ c.contact }}</small>
      </div>
      <div v-if="filtered.length === 0" class="text-muted px-2 py-3">
        No results found. Try different filters.
      </div>
    </div>

    <SavedFilters :current="filters" @load="loadSaved" />
  </section>
</template>
