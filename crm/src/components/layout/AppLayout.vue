<!-- src/components/layout/AppLayout.vue -->
<template>
  <div class="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar - Desktop -->
    <div class="hidden md:block flex-shrink-0">
      <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    </div>

    <!-- Mobile Sidebar -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 md:hidden"
    >
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-gray-600 bg-opacity-75" 
        @click="isMobileSidebarOpen = false"
      ></div>
      
      <!-- Sidebar content -->
      <div class="relative flex flex-col w-full max-w-xs bg-white dark:bg-gray-800">
        <Sidebar :collapsed="false" @toggle="isMobileSidebarOpen = false" />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <Navbar 
        :title="pageTitle" 
        :breadcrumbs="breadcrumbs"
        @toggle-sidebar="isMobileSidebarOpen = true" 
      />
      
      <main class="flex-1 relative overflow-y-auto p-4 focus:outline-none">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const props = defineProps({
  pageTitle: {
    type: String,
    default: ''
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

const sidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

// Provide page context to child components
provide('pageContext', {
  setTitle: (title) => pageTitle.value = title,
  setBreadcrumbs: (items) => breadcrumbs.value = items
})
</script>