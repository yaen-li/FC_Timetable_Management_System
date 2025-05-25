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
                  <!-- Single Toggle Button -->
                <div class="flex justify-end mb-4">
                    <button
                        @click="viewMode = viewMode==='table' ? 'daily' : 'table'"
                        class="px-4 py-2 rounded border hover:bg-gray-100 bg-blue-500 text-white font-medium shadow-md"
                    >
                        {{ viewMode === 'table' ? 'Switch to Daily View' : 'Switch to Grid View' }}
                    </button>
                </div>
          <div v-if="loading" class="flex justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
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
                  <td class="p-2 border-b">{{ slot.label }}</td>
                  <td
                    v-for="day in displayDays"
                    :key="day"
                    class="p-2 border-b text-center"
                  >
                    <div v-if="timetable[day] && timetable[day][slot.key]">
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
                class="border rounded p-1"
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
              class="p-2 rounded text-center font-semibold"
              :class="dayColors[selectedDay]"
            >
              {{ selectedDay }}
            </div>
  
            <!-- List of classes for that day -->
            <div v-if="timetable[selectedDay]">
              <div
                v-for="(cls, slot) in timetable[selectedDay]"
                :key="slot"
                class="flex justify-between items-center p-4 rounded shadow-sm"
              >
                <div>
                  <p class="text-sm text-gray-600">{{ timeSlotsMap[slot] }}</p>
                  <p class="font-medium">{{ cls.subject }}</p>
                  <p class="text-xs italic text-green-600">{{ cls.venue }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-gray-500">
              No classes on {{ selectedDay }}.
            </p>
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
      const loading = ref(true)
      const timetable = ref({})
      const viewMode = ref('table')
      const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
      const displayDays = computed(() =>
        days.filter(d => ['MON','TUE','WED','THU','FRI'].includes(d))
      )
      const selectedDay = ref(displayDays.value[0])
  
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
        MON: 'bg-red-100 text-red-800',
        TUE: 'bg-yellow-100 text-yellow-800',
        WED: 'bg-green-100 text-green-800',
        THU: 'bg-blue-100 text-blue-800',
        FRI: 'bg-purple-100 text-purple-800'
      }
  
      async function fetchJSON(params) {
        const url = `${TTMS_API}?${new URLSearchParams(params)}`
        console.log('[Timetable] Fetching:', url)
        const res = await fetch(url)
        const json = await res.json()
        console.log('[Timetable] Response for', params.entity, json)
        return json
      }
  
      async function loadTimetable() {
        console.log('[Timetable] loadTimetable() start')
        try {
          const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
          console.log('[Timetable] loginData:', loginData)
          if (!loginData) return console.error('[Timetable] No login data')
  
          const cacheKey = `timetable_${loginData.session_id}`
          const cached = localStorage.getItem(cacheKey)
          if (cached) {
            timetable.value = JSON.parse(cached)
            console.log('[Timetable] Loaded from cache')
            loading.value = false
            return
          }
  
          const [sesData] = await fetchJSON({ entity: 'sesisemester' })
          const sesi = sesData.sesi, semester = sesData.semester
          console.log('[Timetable] sesi=', sesi, 'semester=', semester)
  
          const subjects = await fetchJSON({
            entity: 'pelajar_subjek',
            no_matrik: loginData.login_name
          })
  
          const data = {}
          const hariMap = {1:'SUN',2:'MON',3:'TUE',4:'WED',5:'THU',6:'FRI',7:'SAT'}
  
          for (const subj of subjects) {
            if (`${subj.sesi}` === `${sesi}` && `${subj.semester}` === `${semester}`) {
              const list = await fetchJSON({
                entity: 'jadual_subjek',
                sesi, semester,
                kod_subjek: subj.kod_subjek,
                seksyen: subj.seksyen
              })
              for (const item of list) {
                const day = hariMap[item.hari]
                const slot = `${item.masa}`
                data[day] = data[day] || {}
                data[day][slot] = {
                  subject: subj.kod_subjek,
                  venue: item.ruang.nama_ruang_singkatan
                }
              }
            }
          }
  
          timetable.value = data
          localStorage.setItem(cacheKey, JSON.stringify(data))
  
        } catch (err) {
          console.error('[Timetable] Error:', err)
        } finally {
          loading.value = false
          console.log('[Timetable] loadTimetable() end')
        }
      }
  
      onMounted(loadTimetable)
      const sidebarOpen = ref(false)
  
      return {
        loading, timetable, viewMode,
        displayDays, selectedDay, timeSlots, timeSlotsMap,
        dayColors, sidebarOpen
      }
    }
  }
  </script>
  
  <style scoped>
  @media (max-width: 640px) {
    table { min-width: 800px; }
  }
  </style>
  