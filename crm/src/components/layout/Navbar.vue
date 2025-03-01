<!-- src/components/layout/Navbar.vue (breadcrumbs section) -->
<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="h-16 px-4 flex items-center justify-between">
      <!-- Left section: Toggle sidebar & Breadcrumbs -->
      <div class="flex items-center">
        <button 
          class="md:hidden mr-4 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="$emit('toggle-sidebar')"
        >
          <FeatherIcon name="menu" class="w-5 h-5" />
        </button>
        
        <!-- Breadcrumbs with View Selector -->
        <div class="flex items-center space-x-2 text-sm">
          <template v-if="breadcrumbs && breadcrumbs.length">
            <div class="flex items-center">
              <template v-for="(crumb, index) in breadcrumbs" :key="index">
                <!-- Breadcrumb item with link -->
                <template v-if="index < breadcrumbs.length - 1">
                  <router-link 
                    v-if="crumb.to" 
                    :to="crumb.to" 
                    class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {{ crumb.label }}
                  </router-link>
                  <span v-else class="text-gray-900 dark:text-white">{{ crumb.label }}</span>
                  <FeatherIcon name="chevron-right" class="h-4 w-4 text-gray-400 mx-2" />
                </template>
                
                <!-- Last breadcrumb with view selector dropdown -->
                <template v-else>
                  <span class="text-gray-900 dark:text-white">{{ crumb.label }}</span>
                  
                  <!-- View Selector Dropdown -->
                  <template v-if="crumb.views && crumb.views.length">
                    <span class="mx-2 text-gray-400">|</span>
                    <Dropdown :options="formatViewOptions(crumb.views)" position="bottom-start">
                      <Button size="sm" variant="ghost" class="text-sm font-normal">
                        {{ crumb.currentView || 'Default View' }}
                        <template #icon-right>
                          <FeatherIcon name="chevron-down" class="h-4 w-4 ml-1" />
                        </template>
                      </Button>
                    </Dropdown>
                  </template>
                </template>
              </template>
            </div>
          </template>
          
          <!-- Fallback title if no breadcrumbs provided -->
          <h1 v-else class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ pageTitle }}
          </h1>
        </div>
      </div>
      
      <!-- Right section: Search, dark mode, user menu -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden md:block relative w-64">
          <FormControl
            type="search"
            size="sm"
            variant="subtle"
            placeholder="Search..."
            v-model="searchQuery"
          />
        </div>

        <!-- Dark mode toggle -->
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FeatherIcon v-if="isDark" name="sun" class="w-5 h-5" />
          <FeatherIcon v-else name="moon" class="w-5 h-5" />
        </button>

        <!-- User dropdown -->
        <div class="relative" ref="userMenuContainer">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center space-x-2 focus:outline-none"
          >
            <div class="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white">
              {{ userInitials }}
            </div>
            <span class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ userName }}
            </span>
            <FeatherIcon name="chevron-down" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <!-- Dropdown -->
          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="isUserMenuOpen = false"
            >
              Profile
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="isUserMenuOpen = false"
            >
              Settings
            </router-link>
            <button
              @click="logout"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { FeatherIcon, FormControl, Button, Dropdown } from 'frappe-ui'
import { useDarkMode } from '../../composables/useDarkMode'
import { session } from '../../data/session'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()
const { isDark, toggleDarkMode } = useDarkMode()
const searchQuery = ref('')

// User menu state
const isUserMenuOpen = ref(false)
const userMenuContainer = ref(null)

// Computed properties
const pageTitle = computed(() => {
  if (props.title) return props.title
  
  // Derive title from route
  const path = route.path
  if (path === '/') return 'Dashboard'
  
  const parts = path.split('/')
  const lastSegment = parts[parts.length - 1]
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
})

// Helper methods
function formatViewOptions(views) {
  if (!views || !views.length) return []
  
  return [
    {
      group: 'Available Views',
      items: views.map(view => ({
        label: view.label,
        icon: () => h(FeatherIcon, { name: view.icon || 'eye', class: 'h-4 w-4' }),
        onClick: () => view.onClick ? view.onClick() : null
      }))
    },
    {
      group: 'Actions',
      items: [
        {
          label: 'Create New View',
          icon: () => h(FeatherIcon, { name: 'plus', class: 'h-4 w-4' }),
          onClick: () => {
            // This should be handled by emitting an event that the parent component listens for
            this.$emit('create-view')
          }
        }
      ]
    }
  ]
}

// User related methods
const userName = computed(() => {
  return session.user || 'Guest'
})

const userInitials = computed(() => {
  const name = userName.value
  if (name === 'Guest') return 'G'
  
  // Get initials from email or name
  if (name.includes('@')) {
    return name.split('@')[0].charAt(0).toUpperCase()
  }
  
  const parts = name.split(' ')
  if (parts.length > 1) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  
  return name.charAt(0).toUpperCase()
})

// Close menu when clicking outside
function handleClickOutside(event) {
  if (userMenuContainer.value && !userMenuContainer.value.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function logout() {
  session.logout.submit()
  isUserMenuOpen.value = false
}
</script>