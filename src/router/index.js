import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import TablePage from '@/pages/TablePage.vue'

const Home = () => import('../pages/Home.vue')
const SelfCheck = () => import('@/pages/SelfCheck.vue')
const Finder = () => import('../pages/Finder.vue')
const UserForm = () => import('../components/UserForm.vue')
const Reviews = () => import('../pages/Reviews.vue')
const Login = () => import('../pages/Login.vue')
const Register = () => import('../pages/Register.vue')
const Admin = () => import('../pages/Admin.vue')
const AccessDenied = () => import('../pages/AccessDenied.vue')
const Protected = () => import('../pages/Protected.vue')
const NotFound = () => import('../pages/NotFound.vue')
const Email = () => import('../pages/Email.vue')
const ApiPage = () => import('../pages/ApiPage.vue')
const AppointmentBooking = () => import('../pages/AppointmentBooking.vue')

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/selfcheck', component: SelfCheck },
  { path: '/finder', component: Finder },
  { path: '/form', component: UserForm },
  { path: '/table', component: TablePage },
  {
    path: '/appointment',
    name: 'appointment',
    component: AppointmentBooking,
    meta: { requiresAuth: true },
  },
  { path: '/reviews', name: 'reviews', component: Reviews, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  { path: '/email', name: 'email', component: Email, meta: { requiresAdmin: true } },
  { path: '/api', name: 'api', component: ApiPage },
  { path: '/denied', name: 'denied', component: AccessDenied },
  { path: '/protected', component: Protected, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

function getCurrentUser() {
  return new Promise((resolve) => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

router.beforeEach(async (to) => {
  const user = await getCurrentUser()
  const email = user?.email || null

  if (to.meta.requiresAuth && !user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && user) {
    return { name: 'home' }
  }

  if (to.meta.requiresAdmin || to.meta.roles?.includes('admin')) {
    const isAdmin =
      email?.endsWith('@admin.com') || email === 'admin@demo.local' || email === 'abc@test.com'
    if (!isAdmin) {
      return { name: 'denied', replace: true }
    }
  }

  return true
})

export default router
