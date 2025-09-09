import { ref } from 'vue'

const RATINGS_KEY = 'app_ratings_v1'

function readAll() {
  try {
    const obj = JSON.parse(localStorage.getItem(RATINGS_KEY))
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}
function writeAll(obj) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(obj || {}))
}

const state = ref(readAll())

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === RATINGS_KEY) state.value = readAll()
  })
}

export function useRatings() {
  function getAspect(aspectId) {
    if (!state.value[aspectId]) {
      state.value[aspectId] = { byUser: {}, total: 0, count: 0 }
      writeAll(state.value)
    }
    return state.value[aspectId]
  }

  function getUserRating(aspectId, userId) {
    const a = getAspect(aspectId)
    return a.byUser[userId] ?? 0
  }

  function getAverage(aspectId) {
    const a = getAspect(aspectId)
    return a.count === 0 ? 0 : a.total / a.count
  }

  function getCount(aspectId) {
    return getAspect(aspectId).count
  }

  function setRating(aspectId, userId, value) {
    const v = Math.max(1, Math.min(5, Math.round(value)))
    const a = getAspect(aspectId)
    const prev = a.byUser[userId]

    if (prev) {
      a.total -= prev
    } else {
      a.count += 1
    }
    a.byUser[userId] = v
    a.total += v

    writeAll(state.value)
  }

  return {
    state,
    getUserRating,
    getAverage,
    getCount,
    setRating,
  }
}
