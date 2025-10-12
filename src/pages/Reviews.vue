<template>
  <main id="main" class="container py-5" style="max-width: 720px">
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
            <StarRating
              :model-value="displayAvg"
              @update:modelValue="noop"
              aria-label="Average rating stars"
              tabindex="0"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <h6 class="mb-3">Your rating</h6>
        <div v-if="user">
          <StarRating
            v-model="my"
            aria-label="Rate your app experience from 1 to 5 stars"
            tabindex="0"
          />
          <button
            class="btn btn-primary btn-sm ms-3"
            @click="save"
            :disabled="saving"
            aria-label="Save your rating"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
        <div v-else>
          <p class="mb-2">You must be logged in to rate.</p>
          <RouterLink
            class="btn btn-outline-primary btn-sm"
            :to="{ name: 'login', query: { redirect: '/reviews' } }"
            aria-label="Login to rate"
            >Login</RouterLink
          >
          <RouterLink
            class="btn btn-primary btn-sm ms-2"
            :to="{ name: 'register', query: { redirect: '/reviews' } }"
            aria-label="Register to rate"
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
            v-model.trim="newComment"
            class="form-control"
            rows="3"
            placeholder="Write your comment here..."
            maxlength="300"
            aria-describedby="commentHelp"
          ></textarea>
          <small id="commentHelp" class="text-muted">Maximum 300 characters.</small>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <small class="text-muted">{{ newComment.length }}/300</small>
            <button
              class="btn btn-success btn-sm"
              @click="postComment"
              :disabled="!canPost || posting"
              aria-label="Post comment"
            >
              {{ posting ? 'Posting…' : 'Post Comment' }}
            </button>
          </div>
          <div v-if="commentError" class="text-danger mt-2" aria-live="assertive">
            {{ commentError }}
          </div>
        </div>
        <div v-else>
          <p class="mb-2">You must be logged in to comment.</p>
        </div>

        <hr class="my-3" />

        <div v-if="commentsSorted.length === 0" class="text-muted" aria-live="polite">
          No comments yet.
        </div>

        <ul class="list-unstyled m-0">
          <li v-for="c in commentsSorted" :key="c.id" class="py-3 border-bottom">
            <div class="d-flex justify-content-between align-items-start">
              <div class="me-3 flex-grow-1">
                <div class="fw-semibold">
                  {{ c.authorEmail }}
                  <span class="text-muted fw-normal ms-2" style="font-size: 0.9rem">
                    · {{ formatDate(c.updatedAt || c.createdAt)
                    }}<span v-if="c.updatedAt"> (edited)</span>
                  </span>
                </div>

                <div v-if="editingId === c.id" class="mt-2">
                  <textarea
                    v-model.trim="editText"
                    class="form-control"
                    rows="3"
                    maxlength="300"
                  ></textarea>
                  <div class="d-flex gap-2 mt-2">
                    <button
                      class="btn btn-primary btn-sm"
                      @click="saveEdit(c)"
                      :disabled="savingEdit"
                      aria-label="Save comment edit"
                    >
                      {{ savingEdit ? 'Saving…' : 'Save' }}
                    </button>
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      @click="cancelEdit"
                      aria-label="Cancel comment edit"
                    >
                      Cancel
                    </button>
                  </div>
                  <div v-if="editError" class="text-danger mt-2" aria-live="assertive">
                    {{ editError }}
                  </div>
                </div>

                <p v-else class="mb-0 mt-2" v-text="c.text"></p>
              </div>

              <div v-if="canManage(c)" class="d-flex gap-2">
                <button
                  class="btn btn-outline-secondary btn-sm"
                  @click="startEdit(c)"
                  aria-label="Edit comment"
                >
                  Edit
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(c.id)"
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watchEffect, onMounted, watch } from 'vue'
import StarRating from '../components/StarRating.vue'
import { useAuth } from '../auth/useAuth'
import { useRatings } from '../data/useRatings'

const ASPECT_ID = 'app_experience'
const COMMENTS_KEY = 'reviews_comments_v1'

const { user } = useAuth()
const { getAverage, getCount, getUserRating, setRating } = useRatings()

const my = ref(0)
const avg = ref(0)
const count = ref(0)
const saving = ref(false)
const displayAvg = computed(() => Math.round(avg.value))

watchEffect(() => {
  avg.value = getAverage(ASPECT_ID)
  count.value = getCount(ASPECT_ID)
  if (user) {
    my.value = getUserRating(ASPECT_ID, user.id)
  } else {
    my.value = 0
  }
})

function save() {
  if (!user || !my.value) return
  saving.value = true
  setRating(ASPECT_ID, user.id, my.value)
  avg.value = getAverage(ASPECT_ID)
  count.value = getCount(ASPECT_ID)
  saving.value = false
}

function noop() {}

const comments = ref([])
const newComment = ref('')
const posting = ref(false)
const commentError = ref('')
const editingId = ref(null)
const editText = ref('')
const savingEdit = ref(false)
const editError = ref('')

function isUnsafe(input) {
  const htmlOrScript = /<\s*\/?\s*\w+[^>]*>|<\s*script|on\w+\s*=|javascript:/i
  const sqlish = /('|--|;|\/\*|\bunion\b|\bselect\b|\bdrop\b|\bor\b\s*1\s*=\s*1)/i
  return htmlOrScript.test(input) || sqlish.test(input)
}

function sanitize(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const canPost = computed(() => {
  const t = newComment.value.trim()
  if (t.length === 0 || t.length > 300) return false
  if (isUnsafe(t)) return false
  return true
})

function postComment() {
  commentError.value = ''
  const trimmed = newComment.value.trim()
  if (trimmed.length === 0) {
    commentError.value = 'Comment is required.'
    return
  }
  if (trimmed.length > 300) {
    commentError.value = 'Comment is too long (max 300 chars).'
    return
  }
  if (isUnsafe(trimmed)) {
    commentError.value = 'Invalid input detected.'
    return
  }
  posting.value = true
  const safe = sanitize(trimmed)
  comments.value.unshift({
    id: crypto.randomUUID(),
    authorId: user?.id ?? '',
    authorEmail: user?.email ?? 'Anonymous',
    text: safe,
    createdAt: Date.now(),
    updatedAt: null,
  })
  newComment.value = ''
  posting.value = false
}

function canManage(c) {
  if (!user) return false
  if (user.role === 'admin') return true
  return c.authorId === user.id
}

function startEdit(c) {
  if (!canManage(c)) return
  editingId.value = c.id
  editText.value = decodeForEdit(c.text)
  editError.value = ''
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
  savingEdit.value = false
  editError.value = ''
}

function decodeForEdit(safeHtml) {
  return safeHtml
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
}

function saveEdit(c) {
  editError.value = ''
  const t = editText.value.trim()
  if (t.length === 0) {
    editError.value = 'Comment cannot be empty.'
    return
  }
  if (t.length > 300) {
    editError.value = 'Comment is too long (max 300 chars).'
    return
  }
  if (isUnsafe(t)) {
    editError.value = 'Invalid input detected.'
    return
  }
  savingEdit.value = true
  const idx = comments.value.findIndex((x) => x.id === c.id)
  if (idx !== -1) {
    comments.value[idx] = {
      ...comments.value[idx],
      text: sanitize(t),
      updatedAt: Date.now(),
    }
  }
  savingEdit.value = false
  cancelEdit()
}

function remove(id) {
  const idx = comments.value.findIndex((x) => x.id === id)
  if (idx !== -1) comments.value.splice(idx, 1)
}

const commentsSorted = computed(() =>
  [...comments.value].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
)

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ''
  }
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) comments.value = parsed
    }
  } catch {}
})

watch(
  comments,
  (v) => {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(v))
    } catch {}
  },
  { deep: true },
)
</script>

<style scoped>
:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}
</style>
