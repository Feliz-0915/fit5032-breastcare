<template>
  <div class="container py-4">
    <h2 class="mb-3 text-primary">Send Email to All Users</h2>

    <form @submit.prevent="sendEmail" class="card p-3 shadow-sm">
      <div class="mb-3">
        <label class="form-label">Subject</label>
        <input
          v-model="subject"
          type="text"
          class="form-control"
          placeholder="Enter subject"
          required
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Message</label>
        <textarea v-model="message" class="form-control" rows="4" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Attachment (optional)</label>
        <input type="file" @change="handleFile" class="form-control" />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send to All Users' }}
      </button>

      <div v-if="status" class="alert mt-3" :class="statusClass">{{ status }}</div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return { subject: '', message: '', file: null, status: '', loading: false }
  },
  computed: {
    statusClass() {
      return this.status.startsWith('Email') ? 'alert-success' : 'alert-danger'
    },
  },
  methods: {
    handleFile(e) {
      this.file = e.target.files[0]
    },
    async sendEmail() {
      this.loading = true
      const formData = new FormData()
      formData.append('subject', this.subject)
      formData.append('message', this.message)
      if (this.file) formData.append('attachment', this.file)

      try {
        const res = await axios.post('http://localhost:3000/send-email', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        this.status = res.data || 'Email sent successfully'
      } catch (err) {
        this.status = 'Failed to send email'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>
