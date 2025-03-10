<template>
	<div class="flex h-screen bg-gray-100 dark:bg-zinc-900 p-4">
		<div class="flex h-full rounded-2xl overflow-hidden w-full">
			<!-- Sidebar -->
			<Sidebar class="h-full rounded-l-2xl" />

			<!-- Main Content -->
			<div
				class="flex-1 flex flex-col bg-white dark:bg-zinc-800 shadow-md rounded-r-2xl overflow-hidden"
			>
				<!-- Header -->
				<header
					class="bg-white dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700"
				>
					<div class="flex items-center justify-between">
						<h1 class="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
							{{ currentPageTitle }}
						</h1>
						<div class="flex items-center space-x-4">
							<Button icon="pi pi-search" rounded outlined aria-label="Search" />
							<Button
								icon="pi pi-bell"
								rounded
								outlined
								aria-label="Notifications"
							/>
						</div>
					</div>
				</header>

				<!-- Page Content -->
				<main class="flex-1 overflow-auto">
					<router-view />
				</main>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import AppDock from './AppDock.vue'

const route = useRoute()

const currentPageTitle = computed(() => {
	const routeNames = {
		Home: 'Dashboard',
		Login: 'Login',
		ListingTabDetails: route.params.id,
		// Add more route name mappings as needed
	}

	return routeNames[route.name] || route.name
})
</script>
