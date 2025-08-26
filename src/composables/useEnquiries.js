// src/composables/useEnquiries.js
const LS_KEY = 'enquiriesV1'

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveAll(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr || []))
}

export function listEnquiries() {
  return loadAll()
}

export function hasEnquired(clinicId) {
  const id = String(clinicId)
  return loadAll().some((e) => String(e.clinicId) === id)
}

export function getEnquiriesByClinicId(clinicId) {
  const id = String(clinicId)
  return loadAll().filter((e) => String(e.clinicId) === id)
}

export function getLatestEnquiry(clinicId) {
  const list = getEnquiriesByClinicId(clinicId)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
}

export function addEnquiry(payload) {
  const arr = loadAll()
  const entry = {
    ...payload,
    clinicId: String(payload.clinicId),
    createdAt: new Date().toISOString(),
  }
  arr.push(entry)
  saveAll(arr)
  return entry
}

export function clearEnquiriesForClinic(clinicId) {
  const id = String(clinicId)
  const arr = loadAll().filter((e) => String(e.clinicId) !== id)
  saveAll(arr)
}
