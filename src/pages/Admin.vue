<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import clinics from '../data/clinics.json'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const totalClinics = clinics.length
const avgRating = computed(() => {
  if (!clinics.length) return 0
  const sum = clinics.reduce((acc, c) => acc + (c.rating || 0), 0)
  return (sum / clinics.length).toFixed(1)
})

function exportToCSV(data, filename = 'clinics_admin.csv') {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  for (const row of data) {
    const values = headers.map((h) => JSON.stringify(row[h] ?? ''))
    csvRows.push(values.join(','))
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportToPDF(elementId, filename = 'clinics_admin.pdf') {
  const element = document.getElementById(elementId)
  const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)
}

const exportAllToPDF = async () => {
  const hidden = document.getElementById('hiddenExport')
  hidden.style.display = 'block'
  await nextTick()
  await exportToPDF('hiddenExport', 'clinics_admin.pdf')
  hidden.style.display = 'none'
}
</script>

<template>
  <section id="main" class="container py-4">
    <h2 class="h4 mb-3">Admin Dashboard</h2>
    <p class="text-muted mb-4">
      Only users with the <span class="text-danger">admin</span> role can access this page.
    </p>

    <div class="row mb-4 g-3">
      <div class="col-md-4">
        <div class="card border-primary shadow-sm">
          <div class="card-body text-center">
            <h5 class="card-title">Total Clinics</h5>
            <p class="display-6 fw-bold text-primary">{{ totalClinics }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-success shadow-sm">
          <div class="card-body text-center">
            <h5 class="card-title">Average Rating</h5>
            <p class="display-6 fw-bold text-success">{{ avgRating }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-secondary shadow-sm">
          <div class="card-body text-center">
            <h5 class="card-title">Data Formats Supported</h5>
            <p class="fw-bold">CSV / PDF</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div
        class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
      >
        <span>Clinic Data Management</span>
        <div>
          <button class="btn btn-light btn-sm me-2" @click="exportToCSV(clinics)">
            Export CSV
          </button>
          <button class="btn btn-warning btn-sm" @click="exportAllToPDF">Export PDF</button>
        </div>
      </div>
      <div class="card-body p-0">
        <div id="exportTable" class="table-responsive">
          <table class="table table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th>Clinic Name</th>
                <th>Suburb</th>
                <th>Rating</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clinics" :key="c.id">
                <td>{{ c.clinicName }}</td>
                <td>{{ c.suburb }}</td>
                <td>{{ c.rating }}</td>
                <td>{{ c.contact }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header bg-secondary text-white">Future Modules</div>
      <div class="card-body">
        <ul>
          <li>Review Management (moderate user reviews & ratings)</li>
          <li>User Management (add / remove users)</li>
        </ul>
      </div>
    </div>

    <div id="hiddenExport" style="display: none">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Clinic Name</th>
            <th>Suburb</th>
            <th>Rating</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clinics" :key="c.id">
            <td>{{ c.clinicName }}</td>
            <td>{{ c.suburb }}</td>
            <td>{{ c.rating }}</td>
            <td>{{ c.contact }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style>
.card {
  border-radius: 10px;
}
.card-header {
  font-weight: 600;
}
.table th,
.table td {
  vertical-align: middle;
}
</style>
