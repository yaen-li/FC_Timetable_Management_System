<template>
    <div class="relative min-h-screen bg-gray-50">
      <Sidebar :open="sidebarOpen" @update:open="val => sidebarOpen = val" />
  
      <div class="flex flex-col">
        <header class="flex items-center justify-between p-4 bg-white shadow">
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
          <!-- Empty for now -->
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from '@/components/Sidebar.vue'
  import { ref } from 'vue'
  
  export default {
    name: 'StudentsBySectionView',
    components: { Sidebar },
    setup() {
      const sidebarOpen = ref(false)
      return { sidebarOpen }
    }
  }
  </script>
  