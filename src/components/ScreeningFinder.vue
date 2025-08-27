<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import clinics from '../data/clinics.json'

const postcode = ref('')
const freeOnly = ref(false)
const sortBy = ref('name') // name | postcode

// Guard to avoid writing defaults back to LS during reset
const isResetting = ref(false)

// Read last filters from Local Storage (HINT Requirement)
onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('finderFilters') || '{}')
  postcode.value = saved.postcode || ''
  freeOnly.value = !!saved.freeOnly
  sortBy.value = saved.sortBy || 'name'
})

// Persist screening conditions (skip when resetting)
watch(
  [postcode, freeOnly, sortBy],
  () => {
    if (isResetting.value) return
    localStorage.setItem(
      'finderFilters',
      JSON.stringify({
        postcode: postcode.value,
        freeOnly: freeOnly.value,
        sortBy: sortBy.value,
      }),
    )
  },
  { flush: 'post' },
)

// Reset filters + clear Local Storage
function resetFilters() {
  isResetting.value = true
  postcode.value = ''
  freeOnly.value = false
  sortBy.value = 'name'
  localStorage.removeItem('finderFilters')
  // release the guard on the next frame so watch won't immediately write defaults back
  requestAnimationFrame(() => {
    isResetting.value = false
  })
}

const filtered = computed(() => {
  const list = clinics.filter(
    (c) => (!postcode.value || c.postcode.includes(postcode.value)) && (!freeOnly.value || c.free),
  )
  return list.sort((a, b) => String(a[sortBy.value]).localeCompare(String(b[sortBy.value])))
})
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Screening Finder</h2>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label" for="pc">Postcode</label>
        <input id="pc" v-model.trim="postcode" class="form-control" placeholder="e.g., 3000" />
      </div>
      <div class="col-6 col-md-3 form-check mt-4">
        <input id="free" type="checkbox" v-model="freeOnly" class="form-check-input" />
        <label for="free" class="form-check-label">Free only</label>
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label" for="sort">Sort by</label>
        <select id="sort" v-model="sortBy" class="form-select">
          <option value="name">Name</option>
          <option value="postcode">Postcode</option>
        </select>
      </div>

      <!-- Reset button -->
      <div class="col-12 col-md-auto ms-auto text-end">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="resetFilters"
          title="Clear filters and local storage"
        >
          Reset filters
        </button>
      </div>
    </div>

    <div class="list-group">
      <div v-for="c in filtered" :key="c.id" class="list-group-item">
        <strong>{{ c.name }}</strong> - {{ c.postcode }} ({{ c.free ? 'Free' : 'Paid' }})
      </div>
      <div v-if="filtered.length === 0" class="text-muted px-2 py-3">
        No results. Try a different postcode.
      </div>
    </div>
  </section>
</template>
