import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Profile', name: 'Profile', component: ProfileView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
