<template>
  <div>
    <h5 class="mb-2">Saved Filters</h5>

    <div class="d-flex gap-2 mb-3">
      <input v-model.trim="label" placeholder="Label this filter..." class="form-control" />
      <button class="btn btn-sm btn-primary" @click="saveWithLabel" :disabled="!label">Save</button>
      <button class="btn btn-sm btn-outline-primary" @click="quickSave" :disabled="isDuplicate">
        Quick Save
      </button>
    </div>

    <div v-if="items.length === 0" class="text-muted">No saved filters.</div>
    <ul v-else class="list-group">
      <li
        v-for="(f, idx) in itemsSorted"
        :key="f.createdAt + ':' + idx"
        class="list-group-item d-flex justify-content-between align-items-center gap-2 flex-wrap"
      >
        <div class="small">
          <strong>{{ f.label || 'Untitled' }}</strong>
          - {{ f.postcode || 'Any postcode' }}, {{ f.freeOnly ? 'Free only' : 'All' }}, sort:
          {{ f.sortBy }} · {{ new Date(f.createdAt).toLocaleString() }}
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" @click="$emit('load', pickFields(f))">
            Load
          </button>
          <button class="btn btn-sm btn-outline-danger" @click="remove(idx)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ current: { type: Object, required: true } })
const emit = defineEmits(['load'])

const LS_KEY = 'finderSavedFiltersV2'

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
function write(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr))
  } catch {}
}

const items = ref(read())
watch(items, write, { deep: true })

const itemsSorted = computed(() =>
  [...items.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
)

function pickFields(x) {
  return { postcode: x.postcode || '', freeOnly: !!x.freeOnly, sortBy: x.sortBy || 'name' }
}
function eq(a, b) {
  return (
    String(a.postcode || '') === String(b.postcode || '') &&
    !!a.freeOnly === !!b.freeOnly &&
    String(a.sortBy || '') === String(b.sortBy || '')
  )
}

const isDuplicate = computed(() => {
  const curr = pickFields(props.current)
  return items.value.some((it) => eq(it, curr))
})

function makeAutoLabel() {
  const p = props.current.postcode || 'Any'
  const f = props.current.freeOnly ? 'Free only' : 'All'
  const s = props.current.sortBy || 'name'
  return `${p} - ${p}, ${f}, sort: ${s}`
}

const label = ref('')

function save(payload) {
  const existIdx = items.value.findIndex((it) => eq(it, payload))
  if (existIdx !== -1) items.value.splice(existIdx, 1)
  items.value.push(payload)
}

function saveWithLabel() {
  const payload = {
    label: label.value,
    ...pickFields(props.current),
    createdAt: new Date().toISOString(),
  }
  save(payload)
  label.value = ''
}

function quickSave() {
  const payload = {
    label: makeAutoLabel(),
    ...pickFields(props.current),
    createdAt: new Date().toISOString(),
  }
  save(payload)
}

function remove(idx) {
  items.value.splice(idx, 1)
}
</script>
