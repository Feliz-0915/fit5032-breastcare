<template>
  <div class="p-4 card shadow-sm">
    <h3 class="fw-bold mb-3 text-primary">User and Appointment Statistics</h3>
    <canvas id="statsChart"></canvas>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { Chart } from 'chart.js/auto'

const db = getFirestore()

onMounted(async () => {
  const userSnap = await getDocs(collection(db, 'users'))
  const appointSnap = await getDocs(collection(db, 'appointments'))

  const totalUsers = userSnap.size
  const totalAppointments = appointSnap.size

  const appointmentDates = {}
  appointSnap.forEach((doc) => {
    const data = doc.data()
    const date = data.date
    if (date) appointmentDates[date] = (appointmentDates[date] || 0) + 1
  })

  const labels = Object.keys(appointmentDates).sort()
  const data = Object.values(appointmentDates)

  const ctx = document.getElementById('statsChart')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Appointments per Day',
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Total Users: ${totalUsers} | Total Appointments: ${totalAppointments}`,
        },
      },
    },
  })
})
</script>

<style scoped>
.card {
  max-width: 700px;
  margin: auto;
}
</style>
