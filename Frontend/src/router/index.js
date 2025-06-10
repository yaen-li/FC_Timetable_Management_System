import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TimetableView from '@/views/TimetableView.vue'
import MoreView from '@/views/MoreView.vue'
import SubjectListView from '@/views/SubjectListView.vue'
import LecturerScheduleView from '@/views/LecturerScheduleView.vue'
import StudentsBySectionView from '@/views/StudentsBySectionView.vue'
import RoomAvailabilityView from '@/views/RoomAvailabilityView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Profile', name: 'Profile', component: ProfileView },
  { path: '/Dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/Timetable', name: 'Timetable', component: TimetableView },
  
  { path: '/More', name: 'More', component: MoreView },

  { path: '/subject-list', name: 'SubjectList', component: SubjectListView },
  { path: '/lecturer-schedule', name: 'LecturerSchedule', component: LecturerScheduleView },
  { path: '/students-by-section', name: 'StudentsBySection', component: StudentsBySectionView },
  { path: '/room-availability', name: 'RoomAvailability', component: RoomAvailabilityView }
  
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
