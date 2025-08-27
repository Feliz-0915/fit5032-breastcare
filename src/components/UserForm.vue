<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import clinics from '../data/clinics.json' // Dynamic data (B.2)
const LS_KEY = 'enquiriesV1'

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function saveAll(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr || []))
}
function latestForClinic(id) {
  const list = loadAll().filter((e) => String(e.clinicId) === String(id))
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
}
function clearForClinic(id) {
  const arr = loadAll().filter((e) => String(e.clinicId) !== String(id))
  saveAll(arr)
}

// ------- Form data -------
const form = reactive({
  clinicId: '', // Choosing a clinic
  name: '',
  contactType: 'email', // 'email' | 'phone'
  contact: '',
  preferredTime: '', // 'Morning' | 'Afternoon' | 'Evening'
  preferredDate: '', // Optional: YYYYY-MM-DD (not earlier than today)
  message: '',
  consent: false,
})

const errors = reactive({
  clinicId: '',
  name: '',
  contact: '',
  preferredTime: '',
  preferredDate: '',
  message: '',
  consent: '',
})

// ------- Calibration rules (B.1 Multiple)-------
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
const phoneOk = (v) => /^\+?\d{8,15}$/.test((v || '').replace(/\s+/g, ''))
const minLen = (v, n) => (v || '').trim().length >= n
const todayStr = new Date().toISOString().slice(0, 10)

const clinicValid = computed(() => !!form.clinicId)
const nameValid = computed(() => minLen(form.name, 1))
const contactValid = computed(() =>
  form.contactType === 'email' ? emailOk(form.contact) : phoneOk(form.contact),
)
const timeValid = computed(() => !!form.preferredTime)
const dateValid = computed(() => !form.preferredDate || form.preferredDate >= todayStr)
const msgValid = computed(() => minLen(form.message, 20))
const agreeValid = computed(() => !!form.consent)

const allValid = computed(
  () =>
    clinicValid.value &&
    nameValid.value &&
    contactValid.value &&
    timeValid.value &&
    dateValid.value &&
    msgValid.value &&
    agreeValid.value,
)

function v(field) {
  if (field === 'clinicId') errors.clinicId = clinicValid.value ? '' : 'Please choose a clinic.'
  if (field === 'name') errors.name = nameValid.value ? '' : 'Name is required.'
  if (field === 'contact')
    errors.contact = contactValid.value
      ? ''
      : form.contactType === 'email'
        ? 'Enter a valid email.'
        : 'Enter a valid phone (8-15 digits).'
  if (field === 'preferredTime')
    errors.preferredTime = timeValid.value ? '' : 'Please choose a preferred time.'
  if (field === 'preferredDate')
    errors.preferredDate = dateValid.value ? '' : `Date cannot be earlier than ${todayStr}.`
  if (field === 'message')
    errors.message = msgValid.value ? '' : 'Message must be at least 20 characters.'
  if (field === 'consent') errors.consent = agreeValid.value ? '' : 'Consent is required.'
}

watch(
  () => form.clinicId,
  (id) => {
    if (!id) return
    const latest = latestForClinic(id)
    if (latest) {
      form.name = latest.name
      form.contactType = latest.contactType
      form.contact = latest.contact
      form.preferredTime = latest.preferredTime
      form.preferredDate = latest.preferredDate || ''
      form.message = latest.message
      form.consent = true
    } else {
      form.name = ''
      form.contactType = 'email'
      form.contact = ''
      form.preferredTime = ''
      form.preferredDate = ''
      form.message = ''
      form.consent = false
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (clinics.length && !form.clinicId) form.clinicId = String(clinics[0].id)
})

// ------- Submit / Clear -------
function submit() {
  ;['clinicId', 'name', 'contact', 'preferredTime', 'preferredDate', 'message', 'consent'].forEach(
    v,
  )
  if (!allValid.value) return
  const arr = loadAll()
  arr.push({
    clinicId: String(form.clinicId),
    clinicName: clinics.find((c) => String(c.id) === String(form.clinicId))?.name || '',
    postcode: clinics.find((c) => String(c.id) === String(form.clinicId))?.postcode || '',
    name: form.name,
    contactType: form.contactType,
    contact: form.contact,
    preferredTime: form.preferredTime,
    preferredDate: form.preferredDate || null,
    message: form.message,
    createdAt: new Date().toISOString(),
  })
  saveAll(arr)
  alert('Enquiry saved locally (demo only).')
}

function clearSavedForSelectedClinic() {
  if (!form.clinicId) return
  clearForClinic(form.clinicId)
  // Empty forms at the same time (retain selected clinics)
  form.name = ''
  form.contactType = 'email'
  form.contact = ''
  form.preferredTime = ''
  form.preferredDate = ''
  form.message = ''
  form.consent = false
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  alert('Cleared saved enquiry for this clinic.')
}
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Clinic Enquiry (Demo)</h2>
    <p class="text-muted mb-3">
      Data is stored locally in your browser (Local Storage). No data is uploaded.
    </p>

    <form @submit.prevent="submit" novalidate class="row g-3">
      <!-- Clinic selection (from clinics.json) -->
      <div class="col-md-6">
        <label class="form-label" for="clinic">Clinic</label>
        <select
          id="clinic"
          class="form-select"
          v-model="form.clinicId"
          :class="errors.clinicId && 'is-invalid'"
          @blur="v('clinicId')"
        >
          <option value="" disabled>Choose a clinic</option>
          <option v-for="c in clinics" :key="c.id" :value="String(c.id)">
            {{ c.name }} ({{ c.postcode }})
          </option>
        </select>
        <div class="invalid-feedback" aria-live="polite">{{ errors.clinicId }}</div>
      </div>

      <div class="col-md-6">
        <label for="name" class="form-label">Name</label>
        <input
          id="name"
          class="form-control"
          v-model.trim="form.name"
          :class="errors.name && 'is-invalid'"
          @blur="v('name')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.name }}</div>
      </div>

      <!-- Contact type switching (dynamic calibration) -->
      <div class="col-md-6">
        <label class="form-label">Contact method</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              id="ctEmail"
              value="email"
              v-model="form.contactType"
            />
            <label class="form-check-label" for="ctEmail">Email</label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              id="ctPhone"
              value="phone"
              v-model="form.contactType"
            />
            <label class="form-check-label" for="ctPhone">Phone</label>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <label :for="form.contactType === 'email' ? 'email' : 'phone'" class="form-label">
          {{ form.contactType === 'email' ? 'Email address' : 'Phone number' }}
        </label>
        <input
          :id="form.contactType === 'email' ? 'email' : 'phone'"
          class="form-control"
          v-model.trim="form.contact"
          :placeholder="form.contactType === 'email' ? 'name@example.com' : '+61412345678'"
          :class="errors.contact && 'is-invalid'"
          @blur="v('contact')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.contact }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="time">Preferred time</label>
        <select
          id="time"
          class="form-select"
          v-model="form.preferredTime"
          :class="errors.preferredTime && 'is-invalid'"
          @blur="v('preferredTime')"
        >
          <option value="">Choose...</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
        <div class="invalid-feedback" aria-live="polite">{{ errors.preferredTime }}</div>
      </div>

      <div class="col-md-6">
        <label class="form-label" for="date">Preferred date (optional)</label>
        <input
          id="date"
          type="date"
          class="form-control"
          v-model="form.preferredDate"
          :class="errors.preferredDate && 'is-invalid'"
          @blur="v('preferredDate')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.preferredDate }}</div>
      </div>

      <div class="col-12">
        <label class="form-label" for="msg">Message (min 20 chars)</label>
        <textarea
          id="msg"
          rows="4"
          class="form-control"
          v-model.trim="form.message"
          :class="errors.message && 'is-invalid'"
          @blur="v('message')"
        ></textarea>
        <div class="invalid-feedback" aria-live="polite">{{ errors.message }}</div>
      </div>

      <div class="col-12 form-check">
        <input
          id="consent"
          type="checkbox"
          class="form-check-input"
          v-model="form.consent"
          :class="errors.consent && 'is-invalid'"
          @change="v('consent')"
        />
        <label for="consent" class="form-check-label">
          I understand this demo stores my enquiry locally in this browser.
        </label>
        <div class="invalid-feedback" aria-live="polite">{{ errors.consent }}</div>
      </div>

      <div class="col-12 d-flex flex-wrap gap-2">
        <button class="btn btn-primary" :disabled="!allValid">Submit enquiry</button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="clearSavedForSelectedClinic"
          :disabled="!form.clinicId"
        >
          Clear saved data for this clinic
        </button>
      </div>
    </form>
  </section>
</template>
