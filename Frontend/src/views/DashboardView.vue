<template>
    <div class="relative min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <Sidebar
        :open="sidebarOpen"
        @update:open="val => sidebarOpen = val"
      />
      
      <!-- Main content -->
      <div class="flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between p-4 bg-white shadow">
          <button @click="sidebarOpen = true" class="p-2">
            <!-- Hamburger Icon -->
            <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
          <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
            <img src="/src/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" onerror="this.style.display='none'"/>
          </div>
        </header>
        
        <!-- Dashboard Content -->
        <main class="p-4 sm:p-6 bg-white">
          <!-- Welcome Header -->
          <div class="mb-4">
            <h2 class="text-lg font-medium text-orange-500">Welcome, {{ userData.full_name }}</h2>
            <h3 class="text-gray-700 font-medium">Dashboard</h3>
          </div>
          
          <!-- Profile Card -->
          <div class="bg-white rounded-lg border p-4 mb-6 flex items-center">
            <div class="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-300">
              <img src="/src/assets/user-avatar.jpg" alt="User Avatar" class="object-cover h-full w-full" onerror="this.style.display='none'"/>
            </div>
            <div>
              <p class="font-medium">{{ userData.full_name }}</p>
              <p class="text-sm text-gray-500">{{ userData.description }}</p>
            </div>
          </div>
          
          <!-- Courses Summary -->
          <div class="bg-yellow-200 rounded-lg p-4 mb-6">
            <h3 class="text-center font-medium mb-2">Total Courses</h3>
            <p class="text-4xl font-bold text-center">{{ courseCount }}</p>
            <p class="text-sm text-center text-gray-600">{{ electivesCount }} {{ electivesCount === 1 ? 'Elective' : 'Electives' }}</p>
          </div>
          
          <!-- Today's Classes -->
          <div class="mb-6">
            <h3 class="font-medium mb-3">Today's Classes</h3>
            <div v-if="todayClasses.length > 0">
              <div v-for="(cls, index) in todayClasses" :key="index" 
                   :class="['rounded-lg p-4 mb-3', getClassStatusColor(cls.status)]">
                <div class="flex justify-between">
                  <div>
                    <p class="text-xs text-gray-600">CS {{ cls.code }}</p>
                    <p class="font-medium">{{ cls.name }}</p>
                    <p class="text-xs">SF {{ cls.sf }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">{{ cls.time }}</p>
                    <p class="text-xs italic">{{ cls.status }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-gray-500 py-2">No classes today</p>
          </div>
          
          <!-- Upcoming Classes -->
          <div class="mb-6">
            <h3 class="font-medium mb-3">Upcoming</h3>
            <div v-if="upcomingClasses.length > 0">
              <div v-for="(cls, index) in upcomingClasses" :key="index" 
                   class="bg-purple-100 rounded-lg p-4 mb-3">
                <div class="flex justify-between">
                  <div>
                    <p class="text-xs text-gray-600">CS {{ cls.code }}</p>
                    <p class="font-medium">{{ cls.name }}</p>
                    <p class="text-xs">SF {{ cls.sf }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium">{{ cls.time }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-gray-500 py-2">No upcoming classes</p>
          </div>
          
          <!-- Announcement -->
<div class="bg-blue-900 text-white rounded-lg p-4">
    <h3 class="font-medium mb-2 flex items-center">
      <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
      </svg>
      Announcement
    </h3>
    <p class="text-sm">
      Perhatian kepada semua pelajar UTM, 
      tutorial akhir sebelum peperiksaan akhir semester 
      akan dijalankan seperti yang telah dirancang.
      Pastikan anda hadir pada sesi tutorial untuk 
      persiapan peperiksaan akhir semester.
    </p>
  </div>
</main>
</div>
</div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
name: 'ProfileView',
components: { Sidebar },
data() {
return {
sidebarOpen: false,
isLoading: true,
userData: {
  full_name: '',
  login_name: '',
  description: '',
  session_id: '',
  email: '',
  role: ''
},
courseCount: '00',
isTeacher: false,
electivesCount: 0,
todayClasses: [],
upcomingClasses: []
}
},
methods: {
getClassStatusColor(status) {
if (!status) return 'bg-purple-100';

switch(status.toLowerCase()) {
  case 'ongoing':
    return 'bg-red-100';
  case 'attended':
    return 'bg-green-100';
  default:
    return 'bg-purple-100';
}
},
loadUserData() {
try {
  const session = localStorage.getItem('web.fc.utm.my_usersession');
  
  if (session) {
    try {
      const userData = JSON.parse(session);
      this.userData = {
  full_name: userData.full_name || '',
  login_name: userData.login_name || '',
  description: userData.description || this.getDefaultDescription(userData.role),
  session_id: userData.session_id || '',
  email: userData.email || '',
  role: userData.role || ''
};
      
      this.isTeacher = userData.role === 'teacher';
    } catch (e) {
      console.error('Error parsing session data:', e);
    }
  }
  
  // Load placeholder data for frontend development
  this.loadPlaceholderData();
} catch (error) {
  console.error('Error loading user data:', error);
} finally {
  this.isLoading = false;
}
},
getDefaultDescription(role) {
return role === 'teacher' ? 'Tenaga Pengajar UTM' : 'Pelajar FSKSM';
},
loadPlaceholderData() {
// These will be replaced with actual API calls later
this.courseCount = '05';
this.electivesCount = 2;

this.todayClasses = [
  { code: '101', name: 'Circuit Theory', sf: '13', time: '8:00 AM', status: 'Attended' },
  { code: '211', name: 'Discrete Math', sf: '19', time: '10:30 AM', status: 'Attended' }
];

this.upcomingClasses = [
  { code: '305', name: 'Introduction to Web Development', sf: '12', time: '1:00 PM' },
  { code: '401', name: 'Computer Architecture', sf: '20', time: '3:00 PM' }
];
},
async fetchFromLegacyAPI() {
// TODO: Implement actual API integration
console.log('This will be implemented for actual API calls');

try {
  // Example structure:
  // const response = await fetch('/api/user/courses');
  // const data = await response.json();
  // this.courseCount = data.courseCount;
  // this.electivesCount = data.electivesCount;
  // etc...
} catch (error) {
  console.error('API Error:', error);
  // You might want to set some error state here
}
}
},
mounted() {
this.loadUserData();
// Uncomment this when ready to integrate with actual API
// this.fetchFromLegacyAPI();
}
}
</script>
<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #ffffff;
}
</style>