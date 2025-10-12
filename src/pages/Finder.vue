<script setup>
import { reactive, computed, watch, nextTick, onMounted } from 'vue'
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

watch(
  filters,
  (v) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(v))
    } catch {}
  },
  { deep: true },
)

const filtered = computed(() => {
  const list = clinics.filter((c) => {
    const searchTerm = filters.suburb.toLowerCase()
    return (
      (!filters.suburb ||
        c.suburb.toLowerCase().includes(searchTerm) ||
        c.clinicName.toLowerCase().includes(searchTerm)) &&
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
  try {
    localStorage.removeItem(LS_KEY)
  } catch {}
}

function loadSaved(f) {
  filters.suburb = f.suburb || ''
  filters.minRating = f.minRating || 0
  filters.sortBy = f.sortBy || 'clinicName'
}

let mapInstance = null
let userMarker = null

function flyToClinic(clinic) {
  if (!mapInstance || !clinic.longitude || !clinic.latitude) return
  mapInstance.flyTo({
    center: [clinic.longitude, clinic.latitude],
    zoom: 14,
    essential: true,
  })
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
          geometry: {
            type: 'Point',
            coordinates: [c.longitude, c.latitude],
          },
        })),
      },
    })

    mapInstance.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (error, image) => {
        if (error) throw error
        if (!mapInstance.hasImage('clinic-icon')) {
          mapInstance.addImage('clinic-icon', image)
        }

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
      const coords = e.features[0].geometry.coordinates.slice()
      const props = e.features[0].properties
      new mapboxgl.Popup()
        .setLngLat(coords)
        .setHTML(
          `<b>${props.name}</b><br>${props.suburb}<br>Rating: ${props.rating}<br>Contact: ${props.contact}`,
        )
        .addTo(mapInstance)
    })

    mapInstance.on('mouseenter', 'clinic-points', () => {
      mapInstance.getCanvas().style.cursor = 'pointer'
    })
    mapInstance.on('mouseleave', 'clinic-points', () => {
      mapInstance.getCanvas().style.cursor = ''
    })

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLng = pos.coords.longitude
          const userLat = pos.coords.latitude

          const userGeoJSON = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [userLng, userLat] },
                properties: { title: 'You are here' },
              },
            ],
          }

          mapInstance.addSource('user-location', { type: 'geojson', data: userGeoJSON })

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

          mapInstance.flyTo({ center: [userLng, userLat], zoom: 12 })
        },
        (err) => {
          console.warn('Geolocation not allowed or failed:', err)
        },
        { enableHighAccuracy: true },
      )
    }
  })
})
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Clinic Finder</h2>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label" for="search">Suburb</label>
        <input
          id="search"
          v-model.trim="filters.suburb"
          class="form-control"
          placeholder="Search by suburb or clinic name"
        />
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="rating">Min Rating</label>
        <select id="rating" v-model.number="filters.minRating" class="form-select">
          <option :value="0">All</option>
          <option :value="4.5">4.5+</option>
          <option :value="4.7">4.7+</option>
          <option :value="4.9">4.9+</option>
        </select>
      </div>

      <div class="col-6 col-md-3">
        <label class="form-label" for="sort">Sort by</label>
        <select id="sort" v-model="filters.sortBy" class="form-select">
          <option value="clinicName">Clinic Name</option>
          <option value="suburb">Suburb</option>
        </select>
      </div>

      <div class="col-12 col-md-auto ms-auto text-end">
        <button type="button" class="btn btn-outline-secondary" @click="resetFilters">
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
          <strong>{{ c.clinicName }}</strong> - {{ c.suburb }} ({{ c.rating }})
          <br />
          <small class="text-muted">Contact: {{ c.contact }}</small>
        </div>
        <button class="btn btn-primary btn-sm" @click="flyToClinic(c)">Locate</button>
      </div>
      <div v-if="filtered.length === 0" class="text-muted px-2 py-3">
        No results found. Try different filters.
      </div>
    </div>

    <div id="map" class="map-container mb-4"></div>

    <SavedFilters :current="filters" @load="loadSaved" />
  </section>
</template>

<style>
.map-container {
  width: 100%;
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
}
</style>
