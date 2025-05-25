<template>
  <div class="relative min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />

    <!-- Main content -->
    <div class="flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 bg-white shadow">
        <button @click="sidebarOpen = true" class="p-2">
          <!-- Hamburger Icon -->
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img :src="userData.avatar" alt="Avatar" class="object-cover h-full w-full"
               onerror="this.style.display='none'" />
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 sm:p-6 bg-white flex-1 overflow-auto">
        <!-- Welcome Header -->
        <div class="mb-4">
          <h2 class="text-lg font-medium text-orange-500">
            Welcome, {{ userData.full_name }}
          </h2>
          <h3 class="text-gray-700 font-medium">Dashboard</h3>
        </div>

        <!-- Profile Card -->
        <div class="bg-white rounded-lg border p-4 mb-6 flex items-center">
          <div class="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-300">
            <img :src="userData.avatar" alt="User Avatar" class="object-cover h-full w-full"
                 onerror="this.style.display='none'" />
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
          <p class="text-sm text-center text-gray-600">
            {{ electivesCount }} {{ electivesCount === 1 ? 'Elective' : 'Electives' }}
          </p>
        </div>

        <!-- Today's Classes -->
        <div class="mb-6">
          <h3 class="font-medium mb-3">Today's Classes</h3>
          <div v-if="todayClasses.length">
            <div
              v-for="(cls, idx) in todayClasses"
              :key="idx"
              :class="['rounded-lg p-4 mb-3', getClassStatusColor(cls.status)]"
            >
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-gray-600">{{ cls.time }}</p>
                  <p class="font-medium">{{ cls.subject }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs italic">{{ cls.venue }}</p>
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
          <div v-if="upcomingClasses.length">
            <div
              v-for="(cls, idx) in upcomingClasses"
              :key="idx"
              class="bg-purple-100 rounded-lg p-4 mb-3"
            >
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-gray-600">{{ cls.day }} {{ cls.time }}</p>
                  <p class="font-medium">{{ cls.subject }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs italic">{{ cls.venue }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-gray-500 py-2">No upcoming classes</p>
        </div>

        <!-- Announcement -->
        <div class="bg-blue-900 text-white rounded-lg p-4">
          <h3 class="font-medium mb-2 flex items-center">
            <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1
                   1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10
                   18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
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
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'ProfileView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'

    const userData = ref({
      full_name: '',
      login_name: '',
      description: '',
      avatar: '@/assets/user-avatar.jpg'
    })
    const courseCount = ref(0)
    const electivesCount = ref(0)
    const todayClasses = ref([])
    const upcomingClasses = ref([])

    const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'}
    const now = new Date()
    const todayNum = now.getDay()             // 1=Sun…7=Sat
    const todayKey = hariMap[todayNum]
    const currentHour = now.getHours() + now.getMinutes()/60

    async function fetchJSON(params) {
      const url = `${TTMS_API}?${new URLSearchParams(params)}`
      const res = await fetch(url)
      return res.json()
    }

    async function loadDashboard() {
      // 1) load userData
      const session = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
      if (!session.login_name) return
      Object.assign(userData.value, {
        full_name: session.full_name,
        login_name: session.login_name,
        description: session.description,
        avatar: session.avatar || userData.value.avatar
      })

      // 2) fetch current session
      const [ses] = await fetchJSON({ entity: 'sesisemester' })
      const { sesi, semester } = ses

      // 3) enrolled subjects
      const subs = await fetchJSON({ entity: 'pelajar_subjek', no_matrik: session.login_name })
      const enrolled = subs.filter(s =>
        String(s.sesi) === String(sesi) &&
        String(s.semester) === String(semester)
      )
      courseCount.value = enrolled.length
      electivesCount.value = enrolled.filter(s => s.kod_subjek.startsWith('U')).length

      // 4) fetch all timetable entries
      const all = []
      for (let s of enrolled) {
        const list = await fetchJSON({
          entity: 'jadual_subjek',
          sesi, semester,
          kod_subjek: s.kod_subjek,
          seksyen: s.seksyen
        })
        list.forEach(item => {
          const dayNum = item.hari
          const day    = hariMap[dayNum]
          const slot   = item.masa / 1
          const time   = `${slot}:00 - ${slot}:50`
          all.push({
            dayNum, day, time,
            subject: s.kod_subjek,
            venue: item.ruang.nama_ruang_singkatan,
            status:
              dayNum === todayNum
                ? (slot <= currentHour ? 'Attended' : 'Ongoing')
                : ''
          })
        })
      }

      // 5) split today's vs upcoming
      todayClasses.value = all.filter(e => e.dayNum === todayNum)
      upcomingClasses.value = all
        .filter(e => e.dayNum > todayNum)
        .sort((a,b) => a.dayNum - b.dayNum || a.time.localeCompare(b.time))
    }

    function getClassStatusColor(status) {
      switch(status.toLowerCase()) {
        case 'ongoing':  return 'bg-red-100'
        case 'attended': return 'bg-green-100'
        default:         return 'bg-purple-100'
      }
    }

    onMounted(loadDashboard)
    const sidebarOpen = ref(false)

    return {
      userData, courseCount, electivesCount,
      todayClasses, upcomingClasses,
      getClassStatusColor,
      sidebarOpen
    }
  }
}
</script>

<style scoped>
/* (retain your existing styles) */
</style>


<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #ffffff;
}
</style>