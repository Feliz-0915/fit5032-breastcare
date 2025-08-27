<template>
  <div>
    <form @submit.prevent="addItem" class="d-flex gap-2 mb-2">
      <input v-model.trim="newItem" placeholder="Enter item..." class="form-control" />
      <button class="btn btn-primary">Add Item</button>
    </form>

    <ul class="list-unstyled">
      <li v-for="(item, idx) in items" :key="idx" class="d-flex align-items-center gap-2 mb-2">
        <span class="me-2">· {{ item }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="removeItem(idx)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const LS_KEY = 'quickListItems'

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const items = ref(read())

watch(
  items,
  (arr) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(arr ?? []))
    } catch {}
  },
  { deep: true },
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== LS_KEY) return
    try {
      items.value = e.newValue ? JSON.parse(e.newValue) : []
    } catch {
      items.value = []
    }
  })
}

const newItem = ref('')
function addItem() {
  if (!newItem.value) return
  items.value.push(newItem.value)
  newItem.value = ''
}
function removeItem(i) {
  items.value.splice(i, 1)
}
</script>
