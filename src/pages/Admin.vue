<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getFirestore, collection, onSnapshot } from 'firebase/firestore'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Chart } from 'chart.js/auto'

const db = getFirestore()
const clinics = ref([])
const users = ref([])
const appointments = ref([])

const totalClinics = computed(() => clinics.value.length)
const totalUsers = computed(() => users.value.length)
const totalAppointments = computed(() => appointments.value.length)

const avgRating = computed(() => {
  if (!clinics.value.length) return 0
  const sum = clinics.value.reduce((acc, c) => acc + (c.rating || 0), 0)
  return (sum / clinics.value.length).toFixed(1)
})

onMounted(() => {
  onSnapshot(collection(db, 'clinics'), (snap) => {
    clinics.value = snap.docs.map((d) => d.data())
    drawCharts()
  })
  onSnapshot(collection(db, 'users'), (snap) => {
    users.value = snap.docs.map((d) => d.data())
    drawCharts()
  })
  onSnapshot(collection(db, 'appointments'), (snap) => {
    appointments.value = snap.docs.map((d) => d.data())
  })
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

let suburbChart = null
let ratingChart = null
let roleChart = null

function drawCharts() {
  const suburbs = {}
  const ratings = { Low: 0, Medium: 0, High: 0 }
  const roles = {}

  clinics.value.forEach((c) => {
    if (c.suburb) suburbs[c.suburb] = (suburbs[c.suburb] || 0) + 1
    if (c.rating <= 3) ratings.Low++
    else if (c.rating <= 4) ratings.Medium++
    else ratings.High++
  })

  users.value.forEach((u) => {
    const role = u.role || 'unknown'
    roles[role] = (roles[role] || 0) + 1
  })

  const suburbLabels = Object.keys(suburbs)
  const suburbData = Object.values(suburbs)
  const ratingLabels = Object.keys(ratings)
  const ratingData = Object.values(ratings)
  const roleLabels = Object.keys(roles)
  const roleData = Object.values(roles)

  const ctx1 = document.getElementById('clinicChart')
  const ctx2 = document.getElementById('ratingChart')
  const ctx3 = document.getElementById('roleChart')

  if (suburbChart) suburbChart.destroy()
  if (ratingChart) ratingChart.destroy()
  if (roleChart) roleChart.destroy()

  suburbChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: suburbLabels,
      datasets: [
        {
          label: 'Clinics per Suburb',
          data: suburbData,
          backgroundColor: 'rgba(54,162,235,0.5)',
          borderColor: 'rgb(54,162,235)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Clinic Distribution by Suburb' } },
      scales: { y: { beginAtZero: true } },
    },
  })

  ratingChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ratingLabels,
      datasets: [{ data: ratingData, backgroundColor: ['#ff6b6b', '#feca57', '#1dd1a1'] }],
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Clinic Rating Distribution' } },
    },
  })

  roleChart = new Chart(ctx3, {
    type: 'doughnut',
    data: {
      labels: roleLabels,
      datasets: [{ data: roleData, backgroundColor: ['#48dbfb', '#5f27cd', '#ff9f43', '#10ac84'] }],
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'User Type Distribution' } },
    },
  })
}
</script>

<template>
  <section id="main" class="container py-4">
    <h2 class="h4 mb-3">Admin Dashboard</h2>
    <p class="text-muted mb-4">
      Only users with the <span class="text-danger">admin</span> role can access this page.
    </p>

    <div class="row mb-4 g-3">
      <div
        class="col-md-3"
        v-for="card in [
          { title: 'Total Clinics', value: totalClinics, color: 'primary' },
          { title: 'Average Rating', value: avgRating, color: 'success' },
          { title: 'Total Users', value: totalUsers, color: 'info' },
          { title: 'Total Appointments', value: totalAppointments, color: 'warning' },
        ]"
        :key="card.title"
      >
        <div :class="`card border-${card.color} shadow-sm`">
          <div class="card-body text-center">
            <h5 class="card-title">{{ card.title }}</h5>
            <p :class="`display-6 fw-bold text-${card.color}`">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4 g-3">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white fw-bold">Clinic Distribution</div>
          <div class="card-body">
            <canvas id="clinicChart" height="120"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white fw-bold">Rating Overview</div>
          <div class="card-body">
            <canvas id="ratingChart" height="120"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white fw-bold">User Types</div>
          <div class="card-body">
            <canvas id="roleChart" height="120"></canvas>
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
