<template>
  <div class="relative min-h-screen bg-[#f6efe7]">
    <!-- Sidebar (from dashboard) -->
    <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />

    <!-- Main content -->
    <div class="flex flex-col items-center py-4">
      <!-- Header -->
      <header class="w-full max-w-md flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-3">
          <button @click="sidebarOpen = true">
            <!-- Hamburger Icon -->
            <svg class="h-6 w-6 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span class="text-[#1b2a3a] font-semibold text-lg">Room Schedule</span>
        </div>
        <div class="h-8 w-8 rounded-full overflow-hidden bg-[#e7e1d8]">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="object-cover h-full w-full"/>
        </div>
      </header>

      <!-- Filter/Search Bar -->
      <div class="w-full max-w-md flex items-center px-4 mt-2 mb-2">
        <div class="flex-1 flex items-center bg-white rounded px-2 py-1 border border-[#e7e1d8]">
          <svg class="h-4 w-4 text-[#b1a99c] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke-width="2"></circle>
            <path stroke-width="2" stroke-linecap="round" d="M21 21l-2-2"></path>
          </svg>
          <input
            class="bg-transparent outline-none text-[#1b2a3a] text-sm flex-1"
            placeholder="MPK9-N28A"
            v-model="search"
          />
        </div>
        <button @click="showFilter = true" class="ml-2">
          <!-- Funnel/Filter Icon matching Figma -->
          <svg class="h-6 w-6 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-7 7V19a1 1 0 0 1-1.447.894l-4-2A1 1 0 0 1 7 17v-5.293l-7-7A1 1 0 0 1 1 4V4z"/>
          </svg>
        </button>
      </div>

      <!-- Timetable Table -->
      <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#e7e1d8] overflow-hidden">
        <table class="w-full text-left text-[#1b2a3a]">
          <thead>
            <tr class="bg-[#f6efe7] text-xs">
              <th class="px-4 py-2 border-b border-[#e7e1d8]">Day</th>
              <th class="px-2 py-2 border-b border-[#e7e1d8]">8-10</th>
              <th class="px-2 py-2 border-b border-[#e7e1d8]">10-12</th>
              <th class="px-2 py-2 border-b border-[#e7e1d8]">12-1</th>
              <th class="px-2 py-2 border-b border-[#e7e1d8]">2-4</th>
              <th class="px-2 py-2 border-b border-[#e7e1d8]">4-6</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr>
              <td class="px-4 py-2 border-b border-[#e7e1d8]">Monday</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]">SECJ23<br>mpk9-n28</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]">SECJ23<br>mpk9-n28</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
            </tr>
            <tr class="bg-[#ece6f3]">
              <td class="px-4 py-2 border-b border-[#e7e1d8] font-semibold text-[#6c4e9c]">Tuesday</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-[#e7e1d8]">Wednesday</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]">SEVH43<br>mpk9-n28</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
            </tr>
            <tr>
              <td class="px-4 py-2 border-b border-[#e7e1d8]">Thursday</td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
              <td class="px-2 py-2 border-b border-[#e7e1d8]"></td>
            </tr>
            <tr>
              <td class="px-4 py-2">Friday</td>
              <td class="px-2 py-2"></td>
              <td class="px-2 py-2"></td>
              <td class="px-2 py-2"></td>
              <td class="px-2 py-2"></td>
              <td class="px-2 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Filter Modal Overlay -->
      <div v-if="showFilter" class="fixed inset-0 z-40 flex items-center justify-center" style="background:rgba(246,239,231,0.95)">
        <div class="bg-[#e7e1d8] rounded-xl shadow-lg w-[320px] max-w-[90vw] p-6 flex flex-col border border-[#d6cfc2]">
          <h2 class="text-[#1b2a3a] font-semibold text-lg mb-2">Search Filters</h2>
          <div class="text-[#b1a99c] text-xs mb-3">Sort By</div>
          <div class="space-y-4">
            <!-- Day -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-[#1b2a3a] text-sm">Day</span>
              </div>
              <select v-model="filters.day"
                      class="bg-[#f6efe7] border border-[#d6cfc2] rounded px-2 py-1 text-[#1b2a3a] text-sm focus:outline-none w-24">
                <option>All</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </div>
            <!-- Time Slot -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-[#1b2a3a] text-sm">Time Slot</span>
              </div>
              <select v-model="filters.timeSlot"
                      class="bg-[#f6efe7] border border-[#d6cfc2] rounded px-2 py-1 text-[#1b2a3a] text-sm focus:outline-none w-24">
                <option>All</option>
                <option>8-10am</option>
                <option>10-12pm</option>
                <option>12-1pm</option>
                <option>2-4pm</option>
                <option>4-6pm</option>
              </select>
            </div>
            <!-- Subject Code -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="text-[#1b2a3a] text-sm">Subject Code</span>
              </div>
              <select v-model="filters.subjectCode"
                      class="bg-[#f6efe7] border border-[#d6cfc2] rounded px-2 py-1 text-[#1b2a3a] text-sm focus:outline-none w-24">
                <option>All</option>
                <option>SECJ23</option>
                <option>SEVH43</option>
                <option>mpk9-n28</option>
              </select>
            </div>
            <!-- Lecturers -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-[#b1a99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="text-[#1b2a3a] text-sm">Lecturers</span>
              </div>
              <select v-model="filters.lecturers"
                      class="bg-[#f6efe7] border border-[#d6cfc2] rounded px-2 py-1 text-[#1b2a3a] text-sm focus:outline-none w-24">
                <option>All</option>
                <option>Dr. Mohd Razak</option>
                <option>Dr. Raghad</option>
                <option>Dr. Aqila</option>
                <option>Dr. Ahmad</option>
              </select>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex justify-between items-center mt-6">
            <button @click="showFilter = false"
                    class="text-[#b1a99c] text-sm font-medium px-4 py-2 rounded hover:bg-[#e7e1d8]">
              Cancel
            </button>
            <button @click="showFilter = false"
                    class="bg-[#1b2a3a] text-white text-sm font-semibold px-6 py-2 rounded hover:bg-[#11202e] transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const showFilter = ref(false)
const sidebarOpen = ref(false)
const search = ref('MPK9-N28A')
const filters = reactive({
  day: 'All',
  timeSlot: 'All',
  subjectCode: 'All',
  lecturers: 'All'
})
</script>
