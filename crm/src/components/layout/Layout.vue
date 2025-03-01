<template>
	<div class="h-screen flex flex-col" :class="isDarkMode ? 'dark' : ''">
		<!-- Mobile Header (only visible on mobile) -->
		<Header />

		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar - regular on desktop, overlay on mobile -->
			<div
				v-show="isMobileSidebarOpen"
				class="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
				@click="closeMobileSidebar"
			></div>

			<div
				:class="[
					'fixed md:static z-30 transition-transform duration-300',
					isMobileSidebarOpen
						? 'translate-x-0 top-0 left-0'
						: '-translate-x-full md:translate-x-0',
				]"
			>
				<Sidebar />
			</div>

			<!-- Main Content Area -->
			<main class="flex-1 overflow-auto bg-gray-50 dark:bg-dark">
				<!-- Page Content -->
				<div class="p-6 text-gray-900 dark:text-dark-text">
					<slot></slot>
				</div>
			</main>
		</div>
	</div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'

// Theme management
const isDarkMode = ref(
	localStorage.getItem('theme') === 'dark' ||
		(!localStorage.getItem('theme') &&
			window.matchMedia('(prefers-color-scheme: dark)').matches),
)

const toggleTheme = () => {
	isDarkMode.value = !isDarkMode.value
	localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Mobile sidebar management
const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
	isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
	isMobileSidebarOpen.value = false
}

// Provide values to child components
provide('isDarkMode', isDarkMode)
provide('toggleTheme', toggleTheme)
provide('toggleMobileSidebar', toggleMobileSidebar)
provide('closeMobileSidebar', closeMobileSidebar)
</script>
