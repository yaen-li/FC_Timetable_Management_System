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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="text-xl font-semibold text-gray-800">My Timetable</h1>

        <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
          <img src="@/assets/user-avatar.jpg"
               alt="Avatar"
               class="object-cover h-full w-full"
               onerror="this.style.display='none'" />
        </div>
      </header>

      <!-- Timetable Content -->
      <main class="p-4 sm:p-6 bg-white flex-1 overflow-auto">
        <!-- Session/Semester Selection -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Select Academic Period</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label for="sessionSelect" class="block text-sm font-medium text-gray-700 mb-2">
                Academic Session
              </label>
              <select
                id="sessionSelect"
                v-model="selectedSession"
                @change="onSessionChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="loadingSessions"
              >
                <option value="">Select Session</option>
                <option
                  v-for="session in availableSessions"
                  :key="session.sesi"
                  :value="session.sesi"
                >
                  {{ session.sesi }} {{ session.sesi === currentSession ? '(Current)' : '' }}
                </option>
              </select>
            </div>
            
            <div>
              <label for="semesterSelect" class="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                id="semesterSelect"
                v-model="selectedSemester"
                @change="onSemesterChange"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="!selectedSession || loadingSemesters"
              >
                <option value="">Select Semester</option>
                <option
                  v-for="semester in availableSemesters"
                  :key="semester.semester"
                  :value="semester.semester"
                >
                  Semester {{ semester.semester }} {{ semester.semester === currentSemester && selectedSession === currentSession ? '(Current)' : '' }}
                </option>
              </select>
            </div>
            
            <div>
              <button
                @click="loadTimetableForPeriod"
                :disabled="!selectedSession || !selectedSemester || loading"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {{ loading ? 'Loading...' : 'Load Timetable' }}
              </button>
            </div>
          </div>
          
          <!-- Current Selection Display -->
          <div v-if="selectedSession && selectedSemester" class="mt-4 p-3 bg-blue-50 rounded-md">
            <p class="text-sm text-blue-800">
              <span class="font-medium">Viewing:</span> 
              Session {{ selectedSession }}, Semester {{ selectedSemester }}
              <span v-if="selectedSession === currentSession && selectedSemester === currentSemester" class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Current Period
              </span>
            </p>
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="flex justify-end mb-4">
          <button
            @click="viewMode = viewMode==='table' ? 'daily' : 'table'"
            class="px-4 py-2 rounded border hover:bg-gray-100 bg-blue-500 text-white font-medium shadow-md"
          >
            {{ viewMode === 'table' ? 'Switch to Daily View' : 'Switch to Grid View' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-8">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>

        <!-- No Timetable Message -->
        <div v-else-if="!hasTimetableData" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Timetable Found</h3>
          <p class="text-gray-500">
            {{ selectedSession && selectedSemester 
              ? `No classes found for Session ${selectedSession}, Semester ${selectedSemester}` 
              : 'Please select a session and semester to view timetable' }}
          </p>
        </div>

        <!-- GRID MODE -->
        <div v-else-if="viewMode === 'table'" class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 border-b">Time</th>
                <th
                  v-for="day in displayDays"
                  :key="day"
                  class="p-2 border-b text-center"
                >
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in timeSlots" :key="slot.key">
                <td class="p-2 border-b font-medium text-gray-700">{{ slot.label }}</td>
                <td
                  v-for="day in displayDays"
                  :key="day"
                  class="p-2 border-b text-center"
                >
                  <div v-if="timetable[day] && timetable[day][slot.key]" class="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div class="text-sm font-bold text-blue-600">
                      {{ timetable[day][slot.key].subject }}
                    </div>
                    <div class="text-xs italic text-green-600">
                      {{ timetable[day][slot.key].venue }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- DAILY MODE -->
        <div v-else class="space-y-4">
          <!-- Day selector -->
          <div class="flex items-center space-x-2 mb-4">
            <label for="daySelect" class="font-medium">Select Day:</label>
            <select
              id="daySelect"
              v-model="selectedDay"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option
                v-for="d in displayDays"
                :key="d"
                :value="d"
              >
                {{ d }}
              </option>
            </select>
          </div>

          <!-- Color-coded day banner -->
          <div
            class="p-3 rounded-lg text-center font-semibold"
            :class="dayColors[selectedDay]"
          >
            {{ selectedDay }}
          </div>

          <!-- List of classes for that day -->
          <div v-if="timetable[selectedDay] && Object.keys(timetable[selectedDay]).length > 0" class="space-y-3">
            <div
              v-for="(cls, slot) in timetable[selectedDay]"
              :key="slot"
              class="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div>
                <p class="text-sm text-gray-600 font-medium">{{ timeSlotsMap[slot] }}</p>
                <p class="font-semibold text-lg text-gray-800">{{ cls.subject }}</p>
                <p class="text-sm italic text-green-600 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ cls.venue }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <p class="text-gray-500">No classes scheduled for {{ selectedDay }}.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

export default {
name: 'TimetableView',
components: { Sidebar },
setup() {
  const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
  const loading = ref(false)
  const loadingSessions = ref(false)
  const loadingSemesters = ref(false)
  const timetable = ref({})
  const viewMode = ref('table')
  
  // Session and semester management
  const availableSessions = ref([])
  const availableSemesters = ref([])
  const selectedSession = ref('')
  const selectedSemester = ref('')
  const currentSession = ref('')
  const currentSemester = ref('')
  
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const displayDays = computed(() =>
    days.filter(d => ['MON','TUE','WED','THU','FRI'].includes(d))
  )
  const selectedDay = ref(displayDays.value[0])

  const hasTimetableData = computed(() => {
    return Object.keys(timetable.value).some(day => 
      timetable.value[day] && Object.keys(timetable.value[day]).length > 0
    )
  })

  const timeSlots = [
    { key: '1',  label: '8:00 - 8:50'  },
    { key: '2',  label: '8:00 - 8:50'  },
    { key: '3',  label: '9:00 - 9:50'  },
    { key: '4',  label: '10:00 - 10:50'},
    { key: '5',  label: '11:00 - 11:50'},
    { key: '6',  label: '12:00 - 12:50'},
    { key: '7',  label: '1:00 - 1:50'  },
    { key: '8',  label: '2:00 - 2:50'  },
    { key: '9',  label: '3:00 - 3:50'  },
    { key: '10', label: '4:00 - 4:50'  },
    { key: '11', label: '5:00 - 5:50'  },
  ]
  const timeSlotsMap = timeSlots.reduce((m,s) => { m[s.key]=s.label; return m }, {})

  const dayColors = {
    MON: 'bg-red-100 text-red-800 border border-red-200',
    TUE: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    WED: 'bg-green-100 text-green-800 border border-green-200',
    THU: 'bg-blue-100 text-blue-800 border border-blue-200',
    FRI: 'bg-purple-100 text-purple-800 border border-purple-200'
  }

  async function fetchJSON(params) {
    const url = `${TTMS_API}?${new URLSearchParams(params)}`
    console.log('[Timetable] Fetching:', url)
    const res = await fetch(url)
    const json = await res.json()
    console.log('[Timetable] Response for', params.entity, json)
    return json
  }

  async function loadCurrentPeriod() {
    try {
      // Check if session data is already cached (following SubjectListView pattern)
      const sessionCacheKey = 'current_session'
      const cachedSession = localStorage.getItem(sessionCacheKey)
      
      let sesData
      if (cachedSession) {
        sesData = JSON.parse(cachedSession)
        console.log('[Timetable] Using cached session data:', sesData)
      } else {
        // Fetch current session info and cache it
        const [sessionResponse] = await fetchJSON({ entity: 'sesisemester' })
        sesData = sessionResponse
        // Cache session data for other views to use
        localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
        console.log('[Timetable] Fetched and cached session data:', sesData)
      }
      
      currentSession.value = sesData.sesi
      currentSemester.value = sesData.semester
      selectedSession.value = currentSession.value
      selectedSemester.value = currentSemester.value
      
      console.log('[Timetable] Current period set:', currentSession.value, currentSemester.value)
    } catch (err) {
      console.error('[Timetable] Error loading current period:', err)
    }
  }

  async function loadAvailableSessions() {
    loadingSessions.value = true
    try {
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
      if (!loginData) return console.error('[Timetable] No login data')

      // Check if subjects data is already cached (following SubjectListView pattern)
      const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
      const cachedSubjects = localStorage.getItem(subjectsCacheKey)
      
      let subjects
      if (cachedSubjects) {
        subjects = JSON.parse(cachedSubjects)
        console.log('[Timetable] Using cached subjects data for sessions')
      } else {
        // Get all subjects for the student to determine available sessions
        subjects = await fetchJSON({
          entity: 'pelajar_subjek',
          no_matrik: loginData.login_name
        })
        // Cache subjects data for other views to use
        localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
        console.log('[Timetable] Fetched and cached subjects data for sessions')
      }

      // Extract unique sessions
      const sessions = [...new Set(subjects.map(s => s.sesi))].sort((a, b) => b - a)
      availableSessions.value = sessions.map(sesi => ({ sesi }))
      
      console.log('[Timetable] Available sessions:', availableSessions.value)
    } catch (err) {
      console.error('[Timetable] Error loading sessions:', err)
    } finally {
      loadingSessions.value = false
    }
  }

  async function loadAvailableSemesters() {
    if (!selectedSession.value) return
    
    loadingSemesters.value = true
    try {
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
      if (!loginData) return console.error('[Timetable] No login data')

      // Use cached subjects data if available
      const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
      const cachedSubjects = localStorage.getItem(subjectsCacheKey)
      
      let subjects
      if (cachedSubjects) {
        subjects = JSON.parse(cachedSubjects)
        console.log('[Timetable] Using cached subjects data for semesters')
      } else {
        subjects = await fetchJSON({
          entity: 'pelajar_subjek',
          no_matrik: loginData.login_name
        })
        localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
        console.log('[Timetable] Fetched and cached subjects data for semesters')
      }

      // Filter subjects by selected session and get unique semesters
      const semesters = [...new Set(
        subjects
          .filter(s => `${s.sesi}` === `${selectedSession.value}`)
          .map(s => s.semester)
      )].sort((a, b) => a - b)
      
      availableSemesters.value = semesters.map(semester => ({ semester }))
      
      console.log('[Timetable] Available semesters for session', selectedSession.value, ':', availableSemesters.value)
    } catch (err) {
      console.error('[Timetable] Error loading semesters:', err)
    } finally {
      loadingSemesters.value = false
    }
  }

  async function loadTimetableForPeriod() {
    if (!selectedSession.value || !selectedSemester.value) return
    
    console.log('[Timetable] Loading timetable for session:', selectedSession.value, 'semester:', selectedSemester.value)
    loading.value = true
    
    try {
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
      if (!loginData) return console.error('[Timetable] No login data')

      // Enhanced cache key following SubjectListView pattern
      const cacheKey = `timetable_${loginData.session_id}_${selectedSession.value}_${selectedSemester.value}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const cachedData = JSON.parse(cached)
        // Check if cache is still valid (less than 1 hour old)
        const cacheAge = Date.now() - (cachedData.timestamp || 0)
        const cacheMaxAge = 60 * 60 * 1000 // 1 hour
        
        if (cacheAge < cacheMaxAge) {
          timetable.value = cachedData.timetable || cachedData
          console.log('[Timetable] Loaded from cache (age:', Math.round(cacheAge / 1000 / 60), 'minutes)')
          loading.value = false
          return
        } else {
          console.log('[Timetable] Cache expired, fetching fresh data')
          localStorage.removeItem(cacheKey)
        }
      }

      // Use cached subjects data if available
      const subjectsCacheKey = `pelajar_subjek_${loginData.login_name}`
      const cachedSubjects = localStorage.getItem(subjectsCacheKey)
      
      let subjects
      if (cachedSubjects) {
        subjects = JSON.parse(cachedSubjects)
        console.log('[Timetable] Using cached subjects data for timetable')
      } else {
        subjects = await fetchJSON({
          entity: 'pelajar_subjek',
          no_matrik: loginData.login_name
        })
        localStorage.setItem(subjectsCacheKey, JSON.stringify(subjects))
        console.log('[Timetable] Fetched and cached subjects data for timetable')
      }

      const data = {}
      const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'}

      for (const subj of subjects) {
        if (`${subj.sesi}` === `${selectedSession.value}` && `${subj.semester}` === `${selectedSemester.value}`) {
          // Check if schedule is already cached (following SubjectListView pattern)
          const scheduleCacheKey = `jadual_${subj.sesi}_${subj.semester}_${subj.kod_subjek}_${subj.seksyen}`
          const cachedSchedule = localStorage.getItem(scheduleCacheKey)
          
          let list
          if (cachedSchedule) {
            // Parse cached schedule and convert to expected format
            const scheduleData = JSON.parse(cachedSchedule)
            list = scheduleData.map ? scheduleData : [] // Handle both formats
            console.log('[Timetable] Using cached schedule for', subj.kod_subjek)
          } else {
            list = await fetchJSON({
              entity: 'jadual_subjek',
              sesi: selectedSession.value,
              semester: selectedSemester.value,
              kod_subjek: subj.kod_subjek,
              seksyen: subj.seksyen
            })
            // Cache the schedule data
            localStorage.setItem(scheduleCacheKey, JSON.stringify(list))
            console.log('[Timetable] Fetched and cached schedule for', subj.kod_subjek)
          }
          
          for (const item of list) {
            const day = hariMap[item.hari]
            const slot = `${item.masa}`
            data[day] = data[day] || {}
            data[day][slot] = {
              subject: subj.kod_subjek,
              venue: item.ruang?.nama_ruang_singkatan || 'TBA'
            }
          }
        }
      }

      timetable.value = data
      
      // Cache with timestamp following SubjectListView pattern
      const dataToCache = {
        timetable: data,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
      console.log('[Timetable] Timetable loaded and cached:', data)

    } catch (err) {
      console.error('[Timetable] Error loading timetable:', err)
    } finally {
      loading.value = false
    }
  }

  function onSessionChange() {
    selectedSemester.value = ''
    availableSemesters.value = []
    timetable.value = {}
    if (selectedSession.value) {
      loadAvailableSemesters()
    }
  }

  function onSemesterChange() {
    timetable.value = {}
  }

  // Add cache management function (following SubjectListView pattern)
  function clearCache() {
    const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
    if (loginData.session_id) {
      // Clear all related cache keys
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.startsWith(`timetable_${loginData.session_id}`) ||
          key.startsWith(`subjects_${loginData.session_id}`) ||
          key.startsWith(`pelajar_subjek_${loginData.login_name}`) ||
          key.startsWith('jadual_') ||
          key === 'current_session'
        )) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log('[Timetable] Cache cleared:', keysToRemove.length, 'items removed')
    }
  }

  async function initialize() {
    await loadCurrentPeriod()
    await loadAvailableSessions()
    if (selectedSession.value) {
      await loadAvailableSemesters()
      if (selectedSemester.value) {
        await loadTimetableForPeriod()
      }
    }
  }

  onMounted(initialize)
  const sidebarOpen = ref(false)

  return {
    loading, loadingSessions, loadingSemesters,
    timetable, viewMode, hasTimetableData,
    displayDays, selectedDay, timeSlots, timeSlotsMap,
    dayColors, sidebarOpen,
    availableSessions, availableSemesters,
    selectedSession, selectedSemester,
    currentSession, currentSemester,
    onSessionChange, onSemesterChange,
    loadTimetableForPeriod,
    clearCache // Add this for debugging/manual cache clearing
  }
}
}
</script>

<style scoped>
@media (max-width: 640px) {
table { min-width: 800px; }
}
</style>