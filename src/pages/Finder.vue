<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
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

const filters = reactive(readLS() ?? { postcode: '', freeOnly: false, sortBy: 'name' })

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
      (!filters.postcode || String(c.postcode).includes(String(filters.postcode))) &&
      (!filters.freeOnly || c.free),
  )
  return list.sort((a, b) => String(a[filters.sortBy]).localeCompare(String(b[filters.sortBy])))
})

function resetFilters() {
  filters.postcode = ''
  filters.freeOnly = false
  filters.sortBy = 'name'
  try {
    localStorage.removeItem(LS_KEY)
  } catch {}
}

function loadSaved(f) {
  filters.postcode = f.postcode || ''
  filters.freeOnly = !!f.freeOnly
  filters.sortBy = f.sortBy || 'name'
}

onMounted(() => {})
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Screening Finder</h2>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label" for="pc">Postcode</label>
        <input
          id="pc"
          v-model.trim="filters.postcode"
          class="form-control"
          placeholder="e.g., 3000"
        />
      </div>

      <div class="col-6 col-md-3 form-check mt-4">
        <input id="free" type="checkbox" v-model="filters.freeOnly" class="form-check-input" />
        <label for="free" class="form-check-label">Free only</label>
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="sort">Sort by</label>
        <select id="sort" v-model="filters.sortBy" class="form-select">
          <option value="name">Name</option>
          <option value="postcode">Postcode</option>
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
        <strong>{{ c.name }}</strong> - {{ c.postcode }} ({{ c.free ? 'Free' : 'Paid' }})
      </div>
      <div v-if="filtered.length === 0" class="text-muted px-2 py-3">
        No results. Try a different postcode.
      </div>
    </div>

    <SavedFilters :current="filters" @load="loadSaved" />
  </section>
</template>
