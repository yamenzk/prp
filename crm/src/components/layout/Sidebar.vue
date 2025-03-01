<template>
	<aside
		:class="[
			'flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-dark-accent border-r border-gray-200 dark:border-dark-border',
			isMobile ? 'w-64 h-screen' : isCollapsed ? 'w-16 md:w-16 h-full' : 'w-64 h-full',
		]"
	>
		<!-- Logo that toggles sidebar expansion (not on mobile) -->
		<div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-border">
			<div
				class="flex items-center cursor-pointer"
				@click="!isMobile && toggleSidebar()"
				:title="isCollapsed && !isMobile ? 'Expand sidebar' : 'Collapse sidebar'"
			>
				<!-- App logo -->
				<div class="flex-shrink-0">
					<img src="/favicon.png" alt="Logo" class="w-8 h-8" />
				</div>
				<!-- App name (hidden when collapsed) -->
				<div
					:class="[
						'ml-2 font-semibold text-gray-900 dark:text-dark-text transition-opacity',
						isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
					]"
				>
					PRP CRM
				</div>
			</div>
			
			<!-- Close button for mobile only -->
			<button
				v-if="isMobile"
				@click="closeMobileSidebar"
				class="text-gray-500 dark:text-dark-text-secondary rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar focus:outline-none p-1"
				title="Close Sidebar"
			>
				<FeatherIcon name="x" class="w-5 h-5" />
			</button>
		</div>

		<div class="flex flex-col flex-1 overflow-hidden">
			<!-- Navigation menu - always first in the order -->
			<nav class="px-2 py-4 overflow-y-auto flex-1">
				<ul class="space-y-1">
					<!-- Dashboard -->
					<li>
						<router-link
							to="/"
							class="flex items-center p-2 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar"
							:class="{ 'justify-center': isCollapsed && !isMobile }"
							@click="isMobile && closeMobileSidebar()"
						>
							<FeatherIcon name="home" class="w-5 h-5" />
							<span
								:class="[
									'ml-3 transition-opacity',
									isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
								]"
							>
								Dashboard
							</span>
						</router-link>
					</li>

					<!-- Leads -->
					<li>
						<router-link
							to="/leads"
							class="flex items-center p-2 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar"
							:class="{ 'justify-center': isCollapsed && !isMobile }"
							@click="isMobile && closeMobileSidebar()"
						>
							<FeatherIcon name="users" class="w-5 h-5" />
							<span
								:class="[
									'ml-3 transition-opacity',
									isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
								]"
							>
								Leads
							</span>
						</router-link>
					</li>

					<!-- Projects -->
					<li>
						<router-link
							to="/projects"
							class="flex items-center p-2 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar"
							:class="{ 'justify-center': isCollapsed && !isMobile }"
							@click="isMobile && closeMobileSidebar()"
						>
							<FeatherIcon name="briefcase" class="w-5 h-5" />
							<span
								:class="[
									'ml-3 transition-opacity',
									isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
								]"
							>
								Projects
							</span>
						</router-link>
					</li>

					<!-- Settings -->
					<li>
						<router-link
							to="/settings"
							class="flex items-center p-2 text-gray-700 dark:text-dark-text rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar"
							:class="{ 'justify-center': isCollapsed && !isMobile }"
							@click="isMobile && closeMobileSidebar()"
						>
							<FeatherIcon name="settings" class="w-5 h-5" />
							<span
								:class="[
									'ml-3 transition-opacity',
									isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
								]"
							>
								Settings
							</span>
						</router-link>
					</li>
				</ul>
			</nav>

			<!-- Footer with user info and actions -->
				<div class="border-t border-gray-200 dark:border-dark-border p-4 mt-auto">
				<!-- User profile and actions -->
				<div>
					<div class="flex items-center">
						<!-- User avatar using frappe-ui Avatar component -->
						<div class="flex-shrink-0">
							<Avatar
								:shape="'circle'"
								:image="session.userImage"
								:label="userInitials"
								size="xl"
							/>
						</div>

						<!-- User info (hidden when collapsed) -->
						<div
							:class="[
								'ml-3 transition-opacity',
								isCollapsed && !isMobile ? 'opacity-0 hidden' : 'opacity-100',
							]"
						>
							<div class="text-sm font-medium text-gray-900 dark:text-dark-text">
								{{ session.user }}
							</div>
							<div class="text-xs text-gray-500 dark:text-dark-text-secondary">
								{{ session.userInfo.email || '' }}
							</div>
						</div>
					</div>

					<!-- Action buttons - vertical in collapsed mode, justified in expanded mode -->
					<div
						:class="[
							'mt-3 flex',
							isCollapsed && !isMobile ? 'flex-col items-center' : 'justify-between',
						]"
					>
						<!-- Theme toggle -->
						<button
							@click="toggleTheme"
							class="text-gray-500 dark:text-dark-text-secondary rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar focus:outline-none p-2"
							:title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
						>
							<FeatherIcon :name="isDarkMode ? 'sun' : 'moon'" class="w-5 h-5" />
						</button>

						<!-- Info button (disabled) -->
						<button
							class="text-gray-300 dark:text-gray-600 rounded-md cursor-not-allowed p-2"
							disabled
							title="Info (Coming soon)"
						>
							<FeatherIcon name="info" class="w-5 h-5" />
						</button>

						<!-- Logout button -->
						<button
							@click="handleLogout"
							class="text-gray-500 dark:text-dark-text-secondary rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar focus:outline-none p-2"
							title="Logout"
						>
							<FeatherIcon name="log-out" class="w-5 h-5" />
						</button>
					</div>
				</div>

				<!-- Copyright text (never shown in collapsed state) -->
				<div
					v-if="!isCollapsed && !isMobile"
					class="text-xs text-gray-500 dark:text-dark-text-secondary text-center mt-4"
				>
					&copy; Daraj Al Yasamin Group
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { session } from '../../data/session'

// Get theme toggle from parent
const isDarkMode = inject('isDarkMode')
const toggleTheme = inject('toggleTheme')

const router = useRouter()

// Sidebar collapse state
const isCollapsed = ref(false)
const isMobile = ref(false)

// Inject mobile sidebar control function
const closeMobileSidebar = inject('closeMobileSidebar', () => {})

const toggleSidebar = () => {
	// Only allow toggling if not on mobile
	if (!isMobile.value) {
		isCollapsed.value = !isCollapsed.value
	}
}

// Check if the device is mobile
const checkMobileView = () => {
	isMobile.value = window.innerWidth < 768
}

// Add event listener for window resize to check for mobile view
onMounted(() => {
	checkMobileView()
	window.addEventListener('resize', checkMobileView)
})

// Remove event listener when component is unmounted
onUnmounted(() => {
	window.removeEventListener('resize', checkMobileView)
})

// Calculate user initials for the avatar
const userInitials = computed(() => {
	const name = session.userInfo.full_name || session.user || ''
	const names = name.split(' ')
	if (names.length >= 2) {
		return `${names[0][0]}${names[1][0]}`.toUpperCase()
	}
	return name.substring(0, 2).toUpperCase()
})

// Fixed logout function that submits the logout resource
const handleLogout = () => {
	session.logout.submit()
}
</script>
