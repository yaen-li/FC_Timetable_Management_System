import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Profile', name: 'Profile', component: ProfileView },
  { path: '/Dashboard', name: 'Dashboard', component: DashboardView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
