<script setup>
import { reactive, computed, onMounted } from 'vue'
const LS_KEY = 'userFormV1'

const form = reactive({ name: '', email: '', age: null, agree: false })
const errors = reactive({ name: '', email: '', age: '', agree: '' })

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
  if (saved) Object.assign(form, saved)
})

const nameValid = computed(() => form.name.trim().length > 0)
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || ''))
const ageValid = computed(() => Number(form.age) >= 18 && Number(form.age) <= 39)
const agreeValid = computed(() => !!form.agree)
const allValid = computed(
  () => nameValid.value && emailValid.value && ageValid.value && agreeValid.value,
)

function blur(field) {
  if (field === 'name') errors.name = nameValid.value ? '' : 'Name is required.'
  if (field === 'email') errors.email = emailValid.value ? '' : 'Enter a valid email.'
  if (field === 'age') errors.age = ageValid.value ? '' : 'Age must be 18–39.'
}
function changeAgree() {
  errors.agree = agreeValid.value ? '' : 'Please agree to continue.'
}
function submit() {
  blur('name')
  blur('email')
  blur('age')
  changeAgree()
  if (!allValid.value) return
  localStorage.setItem(LS_KEY, JSON.stringify(form)) // HINT: 持久化
  alert('Submitted! (data saved to localStorage)')
}
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Sample Form (Validations)</h2>
    <form @submit.prevent="submit" novalidate class="row g-3">
      <div class="col-md-6">
        <label for="name" class="form-label">Name</label>
        <input
          id="name"
          v-model.trim="form.name"
          class="form-control"
          :class="errors.name && 'is-invalid'"
          @blur="blur('name')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.name }}</div>
      </div>
      <div class="col-md-6">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          class="form-control"
          :class="errors.email && 'is-invalid'"
          @blur="blur('email')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.email }}</div>
      </div>
      <div class="col-md-4">
        <label for="age" class="form-label">Age (18–39)</label>
        <input
          id="age"
          type="number"
          v-model.number="form.age"
          class="form-control"
          :class="errors.age && 'is-invalid'"
          @blur="blur('age')"
        />
        <div class="invalid-feedback" aria-live="polite">{{ errors.age }}</div>
      </div>
      <div class="col-12 form-check mt-3">
        <input
          id="agree"
          type="checkbox"
          v-model="form.agree"
          class="form-check-input"
          :class="errors.agree && 'is-invalid'"
          @change="changeAgree"
        />
        <label for="agree" class="form-check-label">I agree to the terms</label>
        <div class="invalid-feedback" aria-live="polite">{{ errors.agree }}</div>
      </div>
      <div class="col-12">
        <button class="btn btn-primary" :disabled="!allValid">Submit</button>
      </div>
    </form>
  </section>
</template>
