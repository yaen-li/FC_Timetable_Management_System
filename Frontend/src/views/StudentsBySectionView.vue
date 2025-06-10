<template>
    <div class="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />
  
      <div class="flex flex-col">
        <header class="flex items-center justify-between p-4 bg-white shadow-lg">
          <button @click="sidebarOpen = true" class="p-2">
            <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-800">Students by Section</h1>
          <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
            <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full" />
          </div>
        </header>
  
        <main class="p-4 sm:p-6 bg-white flex-1">
          <!-- Admin Auth Required -->
          <div v-if="!adminSessionId && !loadingAdminAuth" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium mb-2 text-blue-800">Admin Authentication Required</h3>
                <p class="text-sm text-blue-600">You need admin access to view students by section</p>
              </div>
              <button
                @click="getAdminAuth"
                :disabled="loadingAdminAuth"
                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                <svg v-if="loadingAdminAuth" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{{ loadingAdminAuth ? 'Authenticating...' : 'Get Admin Access' }}</span>
              </button>
            </div>
          </div>

          <!-- Section Selection -->
          <div v-if="adminSessionId" class="mb-6 p-4 bg-white shadow-md rounded-lg border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-800">Select Section</h3>
              <div class="flex space-x-2">
                <button @click="clearAllCache" class="text-xs text-red-500 hover:text-red-700 px-2 py-1 border rounded transition-colors">
                  Clear Cache
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                    :key="session"
                    :value="session"
                  >
                    {{ session }} {{ session === currentSession ? '(Current)' : '' }}
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
                    :key="semester"
                    :value="semester"
                  >
                    Semester {{ semester }}
                  </option>
                </select>
              </div>

              <!-- Replace the subject select div with this searchable dropdown -->
              <div>
                <label for="subjectSelect" class="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                  <span v-if="loadingSubjects" class="text-xs text-blue-600">(Loading...)</span>
                  <span v-else-if="availableSubjects.length > 0" class="text-xs text-green-600">({{ availableSubjects.length }} found)</span>
                  <span v-else-if="selectedSemester" class="text-xs text-red-600">(None found)</span>
                </label>
                <div class="relative">
                  <input
                    v-model="subjectSearchQuery"
                    @click="showSubjectDropdown = true"
                    @input="showSubjectDropdown = true"
                    type="text"
                    placeholder="Search and select subject..."
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    :disabled="!selectedSemester || loadingSubjects"
                    readonly
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <!-- Dropdown -->
                  <div v-if="showSubjectDropdown && !loadingSubjects" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <!-- Search input inside dropdown -->
                    <div class="p-2 border-b">
                      <input
                        v-model="subjectSearchQuery"
                        @input="filterSubjects"
                        type="text"
                        placeholder="Type to search subjects..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    
                    <!-- Subject options -->
                    <div class="max-h-48 overflow-y-auto">
                      <div
                        v-for="subject in filteredSubjectsForDropdown"
                        :key="subject.kod_subjek"
                        @click="selectSubject(subject)"
                        class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div class="font-medium text-gray-900">{{ subject.kod_subjek }}</div>
                        <div class="text-sm text-gray-600">{{ subject.nama_subjek }}</div>
                        <div class="text-xs text-blue-600">{{ subject.bil_seksyen }} sections</div>
                      </div>
                      
                      <div v-if="filteredSubjectsForDropdown.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
                        No subjects found matching "{{ subjectSearchQuery }}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label for="sectionSelect" class="block text-sm font-medium text-gray-700 mb-2">
                  Section
                  <span v-if="loadingSections" class="text-xs text-blue-600">(Loading...)</span>
                  <span v-else-if="availableSections.length > 0" class="text-xs text-green-600">({{ availableSections.length }} found)</span>
                </label>
                <select
                  id="sectionSelect"
                  v-model="selectedSection"
                  @change="onSectionChange"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="!selectedSubject || loadingSections"
                >
                  <option value="">Select Section</option>
                  <option
                    v-for="section in availableSections"
                    :key="section.seksyen"
                    :value="section.seksyen"
                  >
                    Section {{ section.seksyen }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Current Selection Display -->
            <div v-if="selectedSession && selectedSemester && selectedSubject && selectedSection" class="mt-4 p-3 bg-blue-50 rounded-md">
              <p class="text-sm text-blue-800">
                <span class="font-medium">Viewing:</span> 
                {{ selectedSubject }} - Section {{ selectedSection }} 
                (Session {{ selectedSession }}, Semester {{ selectedSemester }})
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingStudents" class="flex flex-col items-center justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p class="text-gray-600">Loading students...</p>
          </div>

          <!-- Students Table -->
          <div v-else-if="students.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Table Header with Stats -->
            <div class="bg-gray-100 px-6 py-4 border-b">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-800">
                  Students in {{ selectedSubject }} - Section {{ selectedSection }}
                </h2>
                <div class="flex items-center space-x-4">
                  <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {{ students.length }} Students
                  </span>
                  <button
                    @click="exportStudents"
                    class="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-sm rounded-full hover:from-green-500 hover:to-green-600 transition-colors"
                  >
                    Export List
                  </button>
                </div>
              </div>
            </div>

            <!-- Search and Filter -->
            <div class="p-4 border-b bg-gray-50">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name or matric number..."
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    v-model="sortBy"
                    class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nama">Sort by Name</option>
                    <option value="no_kp">Sort by ID</option>
                    <option value="kod_kursus">Sort by Program</option>
                    <option value="tahun_kursus">Sort by Year</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Students Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr 
                    v-for="(student, index) in filteredStudents" 
                    :key="student.no_kp || index"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ index + 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.no_kp || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          <span class="text-xs font-medium text-gray-700">
                            {{ getInitials(student.nama || 'N/A') }}
                          </span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            {{ student.nama || 'N/A' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ student.kod_kursus || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        Year {{ student.tahun_kursus || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ student.kod_fakulti || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="[
                          'px-2 py-1 text-xs rounded-full',
                          student.status === '-' || !student.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ student.status === '-' || !student.status ? 'ACTIVE' : student.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="selectedSection && !loadingStudents" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p class="text-gray-500">
              No students are enrolled in {{ selectedSubject }} - Section {{ selectedSection }}
            </p>
            <button 
              @click="retryLoadStudents" 
              class="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-colors"
            >
              Retry Loading Students
            </button>
          </div>

          <!-- Initial State -->
          <div v-else-if="adminSessionId && !selectedSection" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Select a Section</h3>
            <p class="text-gray-500">
              Choose a session, semester, subject, and section to view enrolled students
            </p>
          </div>
        </main>
      </div>
    </div>
</template>
  
<script>
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'StudentsBySectionView',
  components: { Sidebar },
  setup() {
    const TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi'
    const ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php'
    
    const sidebarOpen = ref(false)
    const adminSessionId = ref('')
    const loadingAdminAuth = ref(false)
    
    // Loading states
    const loadingSessions = ref(false)
    const loadingSemesters = ref(false)
    const loadingSubjects = ref(false)
    const loadingSections = ref(false)
    const loadingStudents = ref(false)
    
    // Selection states
    const selectedSession = ref('')
    const selectedSemester = ref('')
    const selectedSubject = ref('')
    const selectedSection = ref('')
    const currentSession = ref('')
    const currentSemester = ref('')
    
    // Data arrays
    const availableSessions = ref([])
    const availableSemesters = ref([])
    const availableSubjects = ref([])
    const availableSections = ref([])
    const students = ref([])
    
    // Search and filter
    const searchQuery = ref('')
    const sortBy = ref('nama')

    const subjectSearchQuery = ref('')
    const showSubjectDropdown = ref(false)
    const filteredSubjectsForDropdown = ref([])

    // Computed properties
    const filteredStudents = computed(() => {
      let filtered = students.value

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(student => 
          (student.nama && student.nama.toLowerCase().includes(query)) ||
          (student.no_kp && student.no_kp.toLowerCase().includes(query))
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortBy.value === 'nama') {
          const nameA = a.nama || ''
          const nameB = b.nama || ''
          return nameA.localeCompare(nameB)
        } else if (sortBy.value === 'no_kp') {
          const idA = a.no_kp || ''
          const idB = b.no_kp || ''
          return idA.localeCompare(idB)
        } else if (sortBy.value === 'kod_kursus') {
          const programA = a.kod_kursus || ''
          const programB = b.kod_kursus || ''
          return programA.localeCompare(programB)
        } else if (sortBy.value === 'tahun_kursus') {
          const yearA = a.tahun_kursus || 0
          const yearB = b.tahun_kursus || 0
          return yearA - yearB
        }
        return 0
      })

      return filtered
    })

    // Utility functions
    function getInitials(name) {
      if (!name || name === 'N/A') return 'NA'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    function exportStudents() {
      const csvContent = [
        ['No', 'ID Number', 'Name', 'Program', 'Year', 'Faculty', 'Status'],
        ...filteredStudents.value.map((student, index) => [
          index + 1,
          student.no_kp || 'N/A',
          student.nama || 'N/A',
          student.kod_kursus || 'N/A',
          student.tahun_kursus || 'N/A',
          student.kod_fakulti || 'N/A',
          student.status === '-' || !student.status ? 'ACTIVE' : student.status
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students_${selectedSubject.value}_${selectedSection.value}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }

    function clearAllCache() {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.includes('subjects_') || 
          key.includes('sections_') || 
          key.includes('students_') ||
          key.includes('admin_session_')
        )) {
          keys.push(key)
        }
      }
      keys.forEach(key => localStorage.removeItem(key))
      console.log('[StudentsBySection] Cleared cache:', keys.length, 'items')
      
      // Reset data
      availableSubjects.value = []
      availableSections.value = []
      students.value = []
      
      // Reload if we have selections
      if (selectedSession.value && selectedSemester.value) {
        loadAvailableSubjects()
      }
    }

    function retryLoadStudents() {
      if (selectedSection.value) {
        loadStudents()
      }
    }

    function filterSubjects() {
      if (!subjectSearchQuery.value) {
        filteredSubjectsForDropdown.value = availableSubjects.value
      } else {
        const query = subjectSearchQuery.value.toLowerCase()
        filteredSubjectsForDropdown.value = availableSubjects.value.filter(subject =>
          subject.kod_subjek.toLowerCase().includes(query) ||
          subject.nama_subjek.toLowerCase().includes(query)
        )
      }
    }

    function selectSubject(subject) {
      selectedSubject.value = subject.kod_subjek
      subjectSearchQuery.value = `${subject.kod_subjek} - ${subject.nama_subjek}`
      showSubjectDropdown.value = false
      onSubjectChange()
    }

    // API functions
    async function fetchJSON(url) {
      console.log('[StudentsBySection] Fetching:', url)
      
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const json = await res.json()
        console.log('[StudentsBySection] Response:', json)
        return json
      } catch (error) {
        console.error('[StudentsBySection] Fetch error:', error)
        throw error
      }
    }

    async function getAdminAuth() {
      loadingAdminAuth.value = true
      
      try {
        const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession'))
        if (!loginData) {
          console.error('[StudentsBySection] No login data')
          return
        }
        
        // Check for cached admin session ID
        const adminCacheKey = `admin_session_${loginData.session_id}`
        const cachedAdminSession = localStorage.getItem(adminCacheKey)
        
        if (cachedAdminSession) {
          adminSessionId.value = JSON.parse(cachedAdminSession).adminSessionId
          console.log('[StudentsBySection] Using cached admin session ID:', adminSessionId.value)
        } else {
          // Get admin session ID
          const adminAuthUrl = `${ADMIN_AUTH_API}?session_id=${loginData.session_id}`
          const [adminAuth] = await fetchJSON(adminAuthUrl)
          adminSessionId.value = adminAuth.session_id
          
          // Cache the admin session ID
          localStorage.setItem(adminCacheKey, JSON.stringify({ 
            adminSessionId: adminSessionId.value,
            timestamp: Date.now()
          }))
          
          console.log('[StudentsBySection] Admin session ID:', adminSessionId.value)
        }
        
        // Initialize the component after getting admin access
        await loadCurrentPeriod()
        await loadAvailableSessions()
        if (selectedSession.value) {
          await loadAvailableSemesters()
          if (selectedSemester.value) {
            await loadAvailableSubjects()
          }
        }
        
      } catch (err) {
        console.error('[StudentsBySection] Error getting admin auth:', err)
      } finally {
        loadingAdminAuth.value = false
      }
    }

    async function loadCurrentPeriod() {
      try {
        const sessionCacheKey = 'current_session'
        const cachedSession = localStorage.getItem(sessionCacheKey)
        
        let sesData
        if (cachedSession) {
          sesData = JSON.parse(cachedSession)
          console.log('[StudentsBySection] Using cached session data:', sesData)
        } else {
          const [sessionResponse] = await fetchJSON(`${TTMS_API}?entity=sesisemester`)
          sesData = sessionResponse
          localStorage.setItem(sessionCacheKey, JSON.stringify(sesData))
          console.log('[StudentsBySection] Fetched and cached session data:', sesData)
        }
        
        currentSession.value = sesData.sesi
        currentSemester.value = sesData.semester
        selectedSession.value = currentSession.value
        selectedSemester.value = currentSemester.value
        
        console.log('[StudentsBySection] Set current period:', {
          session: currentSession.value,
          semester: currentSemester.value
        })
      } catch (err) {
        console.error('[StudentsBySection] Error loading current period:', err)
      }
    }

    async function loadAvailableSessions() {
      loadingSessions.value = true
      try {
        const currentYear = new Date().getFullYear()
        const sessions = [
          `${currentYear}/${currentYear + 1}`,
          `${currentYear - 1}/${currentYear}`,
          `${currentYear - 2}/${currentYear - 1}`
        ]
        
        availableSessions.value = sessions
        console.log('[StudentsBySection] Available sessions:', sessions)
      } catch (err) {
        console.error('[StudentsBySection] Error loading sessions:', err)
        availableSessions.value = [currentSession.value]
      } finally {
        loadingSessions.value = false
      }
    }

    async function loadAvailableSemesters() {
      if (!selectedSession.value) return
      
      loadingSemesters.value = true
      try {
        availableSemesters.value = [1, 2]
        console.log('[StudentsBySection] Available semesters:', [1, 2])
      } catch (err) {
        console.error('[StudentsBySection] Error loading semesters:', err)
        availableSemesters.value = [1, 2]
      } finally {
        loadingSemesters.value = false
      }
    }

    async function loadAvailableSubjects() {
      if (!selectedSession.value || !selectedSemester.value) return
      
      loadingSubjects.value = true
      console.log('[StudentsBySection] Loading subjects for:', {
        session: selectedSession.value,
        semester: selectedSemester.value
      })
      
      try {
        const cacheKey = `subjects_${selectedSession.value}_${selectedSemester.value}`
        const cached = localStorage.getItem(cacheKey)
        
        let subjects
        if (cached) {
          subjects = JSON.parse(cached)
          console.log('[StudentsBySection] Using cached subjects data:', subjects.length, 'subjects')
        } else {
          const url = `${TTMS_API}?entity=subjek&sesi=${selectedSession.value}&semester=${selectedSemester.value.toString()}`
          subjects = await fetchJSON(url)
          
          if (subjects && subjects.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(subjects))
            console.log('[StudentsBySection] Fetched and cached subjects data:', subjects.length, 'subjects')
          } else {
            console.warn('[StudentsBySection] No subjects returned from API')
          }
        }
        
        // Filter subjects that have sections (bil_seksyen > 0)
        const subjectsWithSections = subjects.filter(subject => subject.bil_seksyen > 0)
        availableSubjects.value = subjectsWithSections
        
        console.log('[StudentsBySection] Available subjects with sections:', subjectsWithSections.length)
        filteredSubjectsForDropdown.value = subjectsWithSections
        
      } catch (err) {
        console.error('[StudentsBySection] Error loading subjects:', err)
        availableSubjects.value = []
      } finally {
        loadingSubjects.value = false
      }
    }

    async function loadAvailableSections() {
      if (!selectedSession.value || !selectedSemester.value || !selectedSubject.value) return
      
      loadingSections.value = true
      console.log('[StudentsBySection] Loading sections for:', selectedSubject.value)
      
      try {
        const cacheKey = `sections_${selectedSession.value}_${selectedSemester.value}_${selectedSubject.value}`
        const cached = localStorage.getItem(cacheKey)
        
        let sections
        if (cached) {
          sections = JSON.parse(cached)
          console.log('[StudentsBySection] Using cached sections data:', sections)
        } else {
          // Get sections for the selected subject using jadual_subjek
          const url = `${TTMS_API}?entity=jadual_subjek&sesi=${selectedSession.value}&semester=${selectedSemester.value.toString()}&kod_subjek=${selectedSubject.value}`
          const scheduleData = await fetchJSON(url)
          
          console.log('[StudentsBySection] Schedule data:', scheduleData)
          
          // Extract unique sections from schedule data
          const uniqueSections = [...new Set(scheduleData.map(item => item.seksyen))]
          sections = uniqueSections.map(seksyen => ({ seksyen }))
          
          localStorage.setItem(cacheKey, JSON.stringify(sections))
          console.log('[StudentsBySection] Fetched and cached sections data:', sections)
        }
        
        availableSections.value = sections
        console.log('[StudentsBySection] Available sections:', sections)
      } catch (err) {
        console.error('[StudentsBySection] Error loading sections:', err)
        availableSections.value = []
      } finally {
        loadingSections.value = false
      }
    }

    async function loadStudents() {
      if (!selectedSession.value || !selectedSemester.value || !selectedSubject.value || !selectedSection.value || !adminSessionId.value) return
      
      loadingStudents.value = true
      console.log('[StudentsBySection] Loading students for:', {
        session: selectedSession.value,
        semester: selectedSemester.value,
        subject: selectedSubject.value,
        section: selectedSection.value
      })
      
      try {
        const cacheKey = `students_${selectedSession.value}_${selectedSemester.value}_${selectedSubject.value}_${selectedSection.value}`
        const cached = localStorage.getItem(cacheKey)
        
        let studentData = []
        if (cached) {
          const cachedData = JSON.parse(cached)
          const cacheAge = Date.now() - (cachedData.timestamp || 0)
          const cacheMaxAge = 30 * 60 * 1000 // 30 minutes
          
          if (cacheAge < cacheMaxAge) {
            students.value = cachedData.students
            console.log('[StudentsBySection] Loaded students from cache:', students.value.length)
            return
          }
        }
        
        // Use the correct API endpoint with admin session ID
        const url = `${TTMS_API}?entity=subjek_pelajar&session_id=${adminSessionId.value}&sesi=${selectedSession.value}&semester=${selectedSemester.value.toString()}&kod_subjek=${selectedSubject.value}&seksyen=${selectedSection.value}`
        studentData = await fetchJSON(url)
        
        console.log('[StudentsBySection] Raw student data:', studentData)
        students.value = studentData
        
        // Cache with timestamp
        const dataToCache = {
          students: studentData,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
        
        console.log('[StudentsBySection] Successfully loaded', studentData.length, 'students')
        
      } catch (err) {
        console.error('[StudentsBySection] Error loading students:', err)
        students.value = []
      } finally {
        loadingStudents.value = false
      }
    }

    // Event handlers
    function onSessionChange() {
      console.log('[StudentsBySection] Session changed to:', selectedSession.value)
      selectedSemester.value = ''
      selectedSubject.value = ''
      selectedSection.value = ''
      availableSemesters.value = []
      availableSubjects.value = []
      availableSections.value = []
      students.value = []
      if (selectedSession.value) {
        loadAvailableSemesters()
      }
    }

    function onSemesterChange() {
      console.log('[StudentsBySection] Semester changed to:', selectedSemester.value)
      selectedSubject.value = ''
      selectedSection.value = ''
      availableSubjects.value = []
      availableSections.value = []
      students.value = []
      if (selectedSemester.value) {
        loadAvailableSubjects()
      }
    }

    function onSubjectChange() {
      console.log('[StudentsBySection] Subject changed to:', selectedSubject.value)
      selectedSection.value = ''
      availableSections.value = []
      students.value = []
      if (selectedSubject.value) {
        loadAvailableSections()
      }
    }

    function onSectionChange() {
      console.log('[StudentsBySection] Section changed to:', selectedSection.value)
      students.value = []
      if (selectedSection.value) {
        loadStudents()
      }
    }

    // Initialize
    async function initialize() {
      console.log('[StudentsBySection] Initializing...')
      
      // Check for cached admin session ID
      const loginData = JSON.parse(localStorage.getItem('web.fc.utm.my_usersession') || '{}')
      if (loginData.session_id) {
        const adminCacheKey = `admin_session_${loginData.session_id}`
        const cachedAdminSession = localStorage.getItem(adminCacheKey)
        
        if (cachedAdminSession) {
          adminSessionId.value = JSON.parse(cachedAdminSession).adminSessionId
          console.log('[StudentsBySection] Found cached admin session ID:', adminSessionId.value)
          
          // Continue with initialization
          await loadCurrentPeriod()
          await loadAvailableSessions()
          if (selectedSession.value) {
            await loadAvailableSemesters()
            if (selectedSemester.value) {
              await loadAvailableSubjects()
            }
          }
        }
      }
    }

    onMounted(() => {
      initialize()
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) {
          showSubjectDropdown.value = false
        }
      })
    })

    return {
      sidebarOpen, adminSessionId, loadingAdminAuth,
      loadingSessions, loadingSemesters, loadingSubjects, loadingSections, loadingStudents,
      selectedSession, selectedSemester, selectedSubject, selectedSection,
      currentSession, currentSemester,
      availableSessions, availableSemesters, availableSubjects, availableSections,
      students, filteredStudents,
      searchQuery, sortBy,
      subjectSearchQuery, showSubjectDropdown, filteredSubjectsForDropdown,
      onSessionChange, onSemesterChange, onSubjectChange, onSectionChange,
      getInitials, exportStudents, clearAllCache, retryLoadStudents, getAdminAuth,
      filterSubjects, selectSubject
    }
  }
}
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>