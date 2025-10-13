<template>
  <div class="container py-4">
    <h2 class="mb-3 fw-bold text-primary">Appointment Booking</h2>

    <div class="mb-3 card p-3 shadow-sm">
      <input
        v-model="newEvent.title"
        type="text"
        class="form-control mb-3"
        placeholder="Enter appointment title"
      />
      <input v-model="newEvent.date" type="date" class="form-control mb-3" />

      <div class="d-flex align-items-center mb-3">
        <label class="time-label me-2">Start Time</label>
        <select v-model="newEvent.startTime" class="form-select time-select">
          <option disabled value="">Select start time</option>
          <option v-for="t in timeSlots" :key="'start-' + t">{{ t }}</option>
        </select>
      </div>

      <button class="btn btn-primary w-100" @click="bookSlot" :disabled="!user">
        Book Appointment (1 hour)
      </button>

      <div v-if="!user" class="alert alert-warning mt-2 text-center">
        Please login to make an appointment.
      </div>
      <div v-if="errorMsg" class="alert alert-danger mt-2 text-center">{{ errorMsg }}</div>
    </div>

    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/auth/useAuth.js'
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/auth/useAuth.js'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const router = useRouter()
const { user } = useAuth()
const userRole = ref('user')
const events = ref([])
const newEvent = ref({ title: '', date: '', startTime: '' })
const errorMsg = ref('')

const timeSlots = []
for (let h = 8; h < 20; h++) {
  const hour = String(h).padStart(2, '0')
  timeSlots.push(`${hour}:00`)
  timeSlots.push(`${hour}:30`)
}

const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  allDaySlot: false,
  slotDuration: '00:30:00',
  nowIndicator: true,
  height: 'auto',
  expandRows: true,
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  eventOverlap: false,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridWeek,timeGridDay',
  },
  displayEventTime: true,
  events: events,
  eventClick: async (info) => {
    if (!user.value) {
      alert('Please login to delete appointments.')
      return
    }
    const currentUser = user.value.email
    const eventOwner = info.event.extendedProps.createdBy

    if (
      currentUser !== eventOwner &&
      userRole.value !== 'admin' &&
      currentUser !== 'admin@demo.local'
    ) {
      alert('You can only delete your own appointments.')
      return
    }

    const confirmDelete = confirm(`Delete this appointment?\n${info.event.title}`)
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, 'appointments', info.event.id))
      info.event.remove()
      alert('Appointment deleted successfully.')
    } catch (err) {
      console.error(err)
      alert('Failed to delete appointment.')
    }
  },
  eventDidMount(info) {
    const tooltip = document.createElement('div')
    tooltip.className = 'custom-tooltip'
    tooltip.innerHTML = `<b>${info.event.title}</b><br>${formatTime(info.event.start)} - ${formatTime(info.event.end)}<br><i>${info.event.extendedProps.createdBy}</i>`
    document.body.appendChild(tooltip)
    info.el.addEventListener('mouseenter', (e) => {
      tooltip.style.display = 'block'
      tooltip.style.left = e.pageX + 10 + 'px'
      tooltip.style.top = e.pageY + 10 + 'px'
    })
    info.el.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 10 + 'px'
      tooltip.style.top = e.pageY + 10 + 'px'
    })
    info.el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none'
    })
  },
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short',
  },
  dayHeaderFormat: { weekday: 'short', day: 'numeric', month: 'short' },
})

const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const fetchUserRole = async () => {
  if (!user.value) return
  try {
    const userDoc = await getDoc(doc(db, 'users', user.value.uid))
    if (userDoc.exists()) {
      userRole.value = userDoc.data().role || 'user'
    }
  } catch (err) {
    console.error('Error fetching user role:', err)
  }
}

const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'appointments'))
  const currentEmail = user.value?.email
  events.value = querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    const isMine = currentEmail && data.createdBy === currentEmail

    return {
      id: docSnap.id,
      title: data.title,
      start: data.start.seconds ? new Date(data.start.seconds * 1000) : data.start,
      end: data.end.seconds ? new Date(data.end.seconds * 1000) : data.end,
      createdBy: data.createdBy,
      backgroundColor: isMine ? 'rgba(0, 128, 0, 0.6)' : 'rgba(0, 43, 128, 0.3)',
      borderColor: isMine ? '#006400' : '#002b80',
      textColor: isMine ? 'white' : '#002b80',
    }
  })
}

const checkConflict = async (start, end) => {
  const querySnapshot = await getDocs(collection(db, 'appointments'))
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return querySnapshot.docs.some((doc) => {
    const d = doc.data()
    const s = new Date(d.start.seconds * 1000).getTime()
    const e = new Date(d.end.seconds * 1000).getTime()
    return startTime < e && endTime > s
  })
}

const bookSlot = async () => {
  if (!user.value) {
    alert('Please login to make an appointment.')
    router.push('/login')
    return
  }
  errorMsg.value = ''
  const { title, date, startTime } = newEvent.value
  if (!title || !date || !startTime) {
    errorMsg.value = 'Please fill all fields'
    return
  }
  const start = new Date(`${date}T${startTime}:00`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const conflict = await checkConflict(start, end)
  if (conflict) {
    errorMsg.value = 'Time slot already booked!'
    return
  }
  try {
    const ev = { title, start, end, createdBy: user.value?.email || 'Anonymous' }
    const docRef = await addDoc(collection(db, 'appointments'), ev)
    events.value.push({
      ...ev,
      id: docRef.id,
      backgroundColor: 'rgba(0, 128, 0, 0.6)',
      borderColor: '#006400',
      textColor: 'white',
    })
    newEvent.value = { title: '', date: '', startTime: '' }
    errorMsg.value = ''
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Failed to save appointment. Please try again.'
  }
}

onMounted(async () => {
  if (user.value) {
    await fetchUserRole()
    await fetchEvents()
  }
})
</script>

<style scoped>
.container {
  max-width: 900px;
}
.card {
  border-left: 5px solid #002b80;
  border-radius: 8px;
  background-color: #f8f9ff;
}
.time-label {
  width: 110px;
  font-weight: 600;
  color: #002b80;
}
.time-select {
  max-width: 200px;
  font-size: 0.9rem;
}
.calendar-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 10px;
}
.fc .fc-event {
  border-radius: 6px !important;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 43, 128, 0.15);
  transition: all 0.2s ease;
}
.fc .fc-event:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 43, 128, 0.3);
}
.fc .fc-timegrid-slot {
  height: 55px;
  border-color: #f0f0f0;
}
.fc .fc-toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #002b80;
}
.fc .fc-button-primary {
  background-color: #002b80;
  border: none;
  font-weight: 600;
}
.fc .fc-button-primary:hover {
  background-color: #003399;
}
.custom-tooltip {
  position: absolute;
  background: rgba(0, 43, 128, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.2;
  pointer-events: none;
  z-index: 9999;
  display: none;
}
</style>
