import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue')
const SelfCheck = () => import('../pages/SelfCheck.vue')
const Finder = () => import('../pages/Finder.vue')
const UserForm = () => import('../components/UserForm.vue')
const NotFound = () => import('../pages/NotFound.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/selfcheck', component: SelfCheck },
    { path: '/finder', component: Finder },
    { path: '/form', component: UserForm },
    { path: '/:pathMatch(.*)*', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
