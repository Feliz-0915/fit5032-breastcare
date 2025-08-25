<script setup>
import { ref, onMounted } from 'vue'
import stepsJson from '../data/self-check-steps.json'

const steps = ref([])
onMounted(() => {
  steps.value = stepsJson
})
</script>

<template>
  <div class="row g-3">
    <div class="col-12 col-md-6 col-xl-4" v-for="s in steps" :key="s.id">
      <div class="card h-100">
        <img
          v-if="s.img"
          :src="s.img"
          :alt="s.title"
          class="card-img-top img-fluid"
          loading="lazy"
        />
        <div class="card-body">
          <h5 class="card-title">{{ s.title }}</h5>
          <p class="card-text text-muted">{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
