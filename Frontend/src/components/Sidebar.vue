<template>
    <!-- Mobile backdrop: clicking it closes the menu -->
   <!-- Backdrop -->
   <div 
    v-if="open" 
    class="fixed inset-0 z-20" 
    @click="$emit('update:open', false)"
  ></div>

  <transition name="slide">
    <aside
      v-if="open"
      class="fixed inset-y-0 left-0 z-30 bg-white shadow-lg overflow-auto
             transform transition-transform duration-300
             w-3/4 md:w-64
             flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <img src="@/assets/logo.png" alt="FC-UTM" class="w-8 h-8"/>
        <div class="flex items-center space-x-2">
          <img src="@/assets/user-avatar.jpg" alt="Avatar" class="w-8 h-8 rounded-full"/>
          <button 
            class="md:hidden p-1 rounded hover:bg-gray-200" 
            @click="$emit('update:open', false)"
          >
            <XMarkIcon class="w-6 h-6 text-gray-700"/>
          </button>
        </div>
      </div>
  
        <!-- Menu items -->
        <nav class="flex-1 p-2 space-y-1">
          <router-link
            to="/dashboard"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <HomeIcon class="w-6 h-6"/>
            <span class="ml-3">Dashboard</span>
          </router-link>
  
          <router-link
            to="/timetable"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <CalendarIcon class="w-6 h-6"/>
            <span class="ml-3">Timetable</span>
          </router-link>
  
          <router-link
            to="/profile"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <UserIcon class="w-6 h-6"/>
            <span class="ml-3">Profile</span>
          </router-link>
  
          <router-link
            to="/analytics"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <ChartBarIcon class="w-6 h-6"/>
            <span class="ml-3">Analytics</span>
          </router-link>
  
          <router-link
            to="/more"
            class="flex items-center p-2 rounded hover:bg-gray-100"
            @click="$emit('update:open', false)"
          >
            <EllipsisVerticalIcon class="w-6 h-6"/>
            <span class="ml-3">More</span>
          </router-link>
        </nav>
      </aside>
    </transition>
  </template>
  
  <script>
import { computed } from 'vue'
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

export default {
  name: 'Sidebar',
  props: { open: Boolean },
  emits: ['update:open'],
  setup() {
    // no desktop override: sidebar is shown ONLY when open=true
    return {}
  },
  components: {
    HomeIcon, CalendarIcon, UserIcon,
    ChartBarIcon, EllipsisVerticalIcon, XMarkIcon
  }
}  </script>
  
  <style scoped>
  .slide-enter-from,
.slide-leave-to { transform: translateX(-100%); }
.slide-enter-active,
.slide-leave-active { transition: transform 0.3s ease; }
  </style>
   