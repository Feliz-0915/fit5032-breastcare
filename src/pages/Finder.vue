<script setup>
import { reactive, computed, watch, nextTick, onMounted, ref } from 'vue'
import clinics from '../data/clinics.json'
import SavedFilters from '../components/SavedFilters.vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

const LS_KEY = 'finderFilters'

function readLS() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY))
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

const filters = reactive(readLS() ?? { suburb: '', minRating: 0, sortBy: 'clinicName' })
watch(filters, (v) => localStorage.setItem(LS_KEY, JSON.stringify(v)), { deep: true })

const filtered = computed(() => {
  const list = clinics.filter((c) => {
    const searchTerm = filters.suburb?.toLowerCase() || ''
    return (
      (!filters.suburb ||
        c.suburb?.toLowerCase().includes(searchTerm) ||
        c.clinicName?.toLowerCase().includes(searchTerm)) &&
      (!filters.minRating || c.rating >= filters.minRating)
    )
  })
  return list
    .sort((a, b) => {
      const va = String(a[filters.sortBy]).toLowerCase()
      const vb = String(b[filters.sortBy]).toLowerCase()
      return va.localeCompare(vb)
    })
    .slice(0, 8)
})

function resetFilters() {
  filters.suburb = ''
  filters.minRating = 0
  filters.sortBy = 'clinicName'
  localStorage.removeItem(LS_KEY)
}

function loadSaved(f) {
  filters.suburb = f.suburb || ''
  filters.minRating = f.minRating || 0
  filters.sortBy = f.sortBy || 'clinicName'
}

let mapInstance = null
const selectedClinic = ref(null)
const nearestClinic = ref(null)

function flyToClinic(clinic) {
  if (!mapInstance || !clinic.longitude || !clinic.latitude) return
  mapInstance.flyTo({ center: [clinic.longitude, clinic.latitude], zoom: 14, essential: true })
  selectedClinic.value = clinic
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

onMounted(async () => {
  await nextTick()
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

  mapInstance = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [144.9631, -37.8136],
    zoom: 9,
  })

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    placeholder: 'Search Melbourne clinics...',
  })
  mapInstance.addControl(geocoder)

  mapInstance.on('load', () => {
    mapInstance.addSource('clinics', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: clinics.map((c) => ({
          type: 'Feature',
          properties: {
            name: c.clinicName,
            suburb: c.suburb,
            rating: c.rating,
            contact: c.contact,
          },
          geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
        })),
      },
    })

    mapInstance.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (error, image) => {
        if (error) throw error
        if (!mapInstance.hasImage('clinic-icon')) mapInstance.addImage('clinic-icon', image)

        mapInstance.addLayer({
          id: 'clinic-points',
          type: 'symbol',
          source: 'clinics',
          layout: {
            'icon-image': 'clinic-icon',
            'icon-size': 0.8,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-offset': [0, 1.4],
            'text-anchor': 'top',
            'text-size': 12,
          },
          paint: {
            'text-color': '#0055ff',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          },
        })
      },
    )

    mapInstance.on('click', 'clinic-points', (e) => {
      const props = e.features[0].properties
      selectedClinic.value = {
        clinicName: props.name,
        suburb: props.suburb,
        rating: props.rating,
        contact: props.contact,
      }
    })

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLng = pos.coords.longitude
          const userLat = pos.coords.latitude

          mapInstance.addSource('user-location', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [userLng, userLat] },
                  properties: { title: 'You are here' },
                },
              ],
            },
          })

          mapInstance.addLayer({
            id: 'user-point',
            type: 'circle',
            source: 'user-location',
            paint: {
              'circle-radius': 8,
              'circle-color': '#ff0000',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            },
          })

          let minDist = Infinity
          let nearest = null
          clinics.forEach((c) => {
            if (c.latitude && c.longitude) {
              const dist = calcDistance(userLat, userLng, c.latitude, c.longitude)
              if (dist < minDist) {
                minDist = dist
                nearest = c
              }
            }
          })
          if (nearest) nearestClinic.value = nearest

          mapInstance.flyTo({ center: [userLng, userLat], zoom: 12 })
        },
        (err) => console.warn('Geolocation failed:', err),
        { enableHighAccuracy: true },
      )
    }
  })
})
</script>

<template>
  <section id="main">
    <h2 class="h4 mb-3">Clinic Finder</h2>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label" for="suburbInput">Suburb / Clinic name</label>
        <input
          id="suburbInput"
          v-model.trim="filters.suburb"
          class="form-control"
          placeholder="Search by suburb or clinic name"
        />
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="minRating">Min Rating</label>
        <select id="minRating" v-model.number="filters.minRating" class="form-select">
          <option :value="0">All</option>
          <option :value="4.5">4.5+</option>
          <option :value="4.7">4.7+</option>
          <option :value="4.9">4.9+</option>
        </select>
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="sortBy">Sort by</label>
        <select id="sortBy" v-model="filters.sortBy" class="form-select">
          <option value="clinicName">Clinic Name</option>
          <option value="suburb">Suburb</option>
        </select>
      </div>

      <div class="col-12 col-md-auto ms-auto text-end">
        <button class="btn btn-outline-secondary" @click="resetFilters" aria-label="Reset filters">
          Reset filters
        </button>
      </div>
    </div>

    <div class="list-group mb-4">
      <div
        v-for="c in filtered"
        :key="c.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ c.clinicName }}</strong> - {{ c.suburb }} ({{ c.rating }})<br />
          <small class="text-muted">Contact: {{ c.contact }}</small>
        </div>
        <button
          class="btn btn-primary btn-sm"
          @click="flyToClinic(c)"
          :aria-label="`Locate ${c.clinicName} on map`"
        >
          Locate
        </button>
      </div>
      <div v-if="filtered.length === 0" class="text-muted px-2 py-3">
        No results found. Try different filters.
      </div>
    </div>

    <div
      id="map"
      class="map-container position-relative"
      role="application"
      aria-label="Interactive map showing clinic locations in Melbourne"
      tabindex="0"
    >
      <div v-if="selectedClinic" class="info-card" aria-live="polite">
        <b>{{ selectedClinic.clinicName }}</b
        ><br />
        {{ selectedClinic.suburb }}<br />
        ⭐ Rating: {{ selectedClinic.rating }}<br />
        ☎ {{ selectedClinic.contact }}<br />
        <a
          :href="`https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.clinicName},${selectedClinic.suburb}`"
          target="_blank"
          aria-label="Open route in Google Maps"
        >
          🚗 Open Route in Google Maps
        </a>
      </div>
    </div>

    <div v-if="nearestClinic" class="alert alert-info mt-3" aria-live="polite">
      🧭 Nearest clinic: <strong>{{ nearestClinic.clinicName }}</strong>
    </div>

    <SavedFilters :current="filters" @load="loadSaved" />
  </section>
</template>

<style>
.map-container {
  width: 100%;
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.info-card {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  font-size: 13px;
  width: 220px;
  line-height: 1.5;
}
:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}
</style>
