<template>
  <main class="container py-5" style="max-width: 720px">
    <h2 class="mb-3">Reviews</h2>
    <p class="text-muted">Rate the overall app experience (1–5). See the aggregate score below.</p>

    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="card-title mb-1">App Experience</h5>
            <div class="text-muted">
              Average: <strong>{{ avg.toFixed(2) }}</strong> / 5
              <span class="ms-2">({{ count }} ratings)</span>
            </div>
          </div>
          <div>
            <StarRating :model-value="displayAvg" @update:modelValue="noop" />
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <h6 class="mb-3">Your rating</h6>

        <div v-if="user">
          <StarRating v-model="my" />
          <button class="btn btn-primary btn-sm ms-3" @click="save" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
        <div v-else>
          <p class="mb-2">You must be logged in to rate.</p>
          <RouterLink
            class="btn btn-outline-primary btn-sm"
            :to="{ name: 'login', query: { redirect: '/reviews' } }"
            >Login</RouterLink
          >
          <RouterLink
            class="btn btn-primary btn-sm ms-2"
            :to="{ name: 'register', query: { redirect: '/reviews' } }"
            >Register</RouterLink
          >
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h6 class="mb-3">Comments</h6>

        <div v-if="user">
          <textarea
            v-model="newComment"
            class="form-control mb-2"
            rows="2"
            placeholder="Write your comment here..."
          ></textarea>
          <button class="btn btn-success btn-sm" @click="addComment" :disabled="!newComment.trim()">
            Post Comment
          </button>
        </div>
        <div v-else>
          <p class="mb-2">You must be logged in to comment.</p>
        </div>

        <div v-if="comments.length" class="mt-3">
          <div v-for="(c, i) in comments" :key="i" class="border rounded p-2 mb-2">
            <strong>{{ c.author }}</strong
            >:
            <div class="mt-1">{{ c.text }}</div>
          </div>
        </div>
        <div v-else class="text-muted mt-3">No comments yet.</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import StarRating from '../components/StarRating.vue'
import { useAuth } from '../auth/useAuth'
import { useRatings } from '../data/useRatings'

const ASPECT_ID = 'app_experience'

const { currentUser } = useAuth()
const { getAverage, getCount, getUserRating, setRating } = useRatings()

const user = currentUser
const my = ref(0)
const avg = ref(0)
const count = ref(0)
const saving = ref(false)

const displayAvg = computed(() => Math.round(avg.value))

watchEffect(() => {
  avg.value = getAverage(ASPECT_ID)
  count.value = getCount(ASPECT_ID)
  if (user.value) {
    my.value = getUserRating(ASPECT_ID, user.value.id)
  } else {
    my.value = 0
  }
})

function save() {
  if (!user.value || !my.value) return
  saving.value = true
  setRating(ASPECT_ID, user.value.id, my.value)
  avg.value = getAverage(ASPECT_ID)
  count.value = getCount(ASPECT_ID)
  saving.value = false
}

function noop() {}

const comments = ref([])
const newComment = ref('')

function addComment() {
  if (!newComment.value.trim()) return
  comments.value.unshift({
    author: user.value?.email || 'Anonymous',
    text: newComment.value.trim(),
  })
  newComment.value = ''
}
</script>
