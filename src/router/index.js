import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const Home = () => import('../pages/Home.vue')
const SelfCheck = () => import('../pages/SelfCheck.vue')
const Finder = () => import('../pages/Finder.vue')
const UserForm = () => import('../components/UserForm.vue')
const NotFound = () => import('../pages/NotFound.vue')

import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Protected from '../pages/Protected.vue'
import Admin from '../pages/Admin.vue'
import AccessDenied from '../pages/AccessDenied.vue'
import Reviews from '../pages/Reviews.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/selfcheck', component: SelfCheck },
  { path: '/finder', component: Finder },
  { path: '/form', component: UserForm },

  { path: '/reviews', name: 'reviews', component: Reviews },

  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
  { path: '/protected', name: 'protected', component: Protected, meta: { requiresAuth: true } },

  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    meta: { requiresAuth: true, roles: ['admin'] },
  },

  { path: '/denied', name: 'denied', component: AccessDenied },

  { path: '/:pathMatch(.*)*', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const { isAuthenticated, requireRoles } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && to.meta.roles.length) {
    if (!requireRoles(to.meta.roles)) {
      return { name: 'denied' }
    }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'home' }
  }

  return true
})

export default router
