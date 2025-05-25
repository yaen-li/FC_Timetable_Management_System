import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TimetableView from '@/views/TimetableView.vue'
import MoreView from '@/views/MoreView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Profile', name: 'Profile', component: ProfileView },
  { path: '/Dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/Timetable', name: 'Timetable', component: TimetableView },
  
  { path: '/More', name: 'More', component: MoreView },
  
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
