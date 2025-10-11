<template>
  <div class="container text-center mt-5">
    <h2>Cloud Function Demo</h2>

    <div class="mt-4">
      <button class="btn btn-primary m-2" @click="getClinicCount">Get Clinic Count</button>
      <button class="btn btn-success m-2" @click="getAverageRating">Get Average Rating</button>
    </div>

    <div class="mt-4">
      <p v-if="loading">Loading...</p>
      <p v-if="error" class="text-danger">{{ error }}</p>
      <p v-if="count !== null">Total Clinics: {{ count }}</p>
      <p v-if="average !== null">Average Rating: {{ average }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      count: null,
      average: null,
      loading: false,
      error: null,
    }
  },
  methods: {
    async getClinicCount() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(
          'https://australia-southeast1-fit5032-breastcare.cloudfunctions.net/getClinicCount',
        )
        this.count = res.data.count
      } catch (err) {
        this.error = 'Failed to fetch clinic count'
      } finally {
        this.loading = false
      }
    },
    async getAverageRating() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(
          'https://australia-southeast1-fit5032-breastcare.cloudfunctions.net/getAverageRating',
        )
        this.average = res.data.average
      } catch (err) {
        this.error = 'Failed to fetch rating'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
