<template>
	<div
		class="sidebar bg-white dark:bg-zinc-800 shadow-md transition-all duration-300 flex flex-col h-full"
		:class="{ 'w-64': !collapsed, 'w-16': collapsed }"
	>
		<!-- Logo Section -->
		<div class="p-4 flex justify-center items-center">
			<img
				src="/favicon.png"
				alt="Logo"
				class="transition-all duration-300"
				:class="{ 'h-8 w-8': collapsed, 'h-10 w-10': !collapsed }"
			/>
		</div>

		<!-- Divider -->
		<div
			:class="{ 'my-2': collapsed }"
			class="border-b border-gray-200 dark:border-zinc-700"
		></div>

		<!-- Navigation Menu -->
		<div class="flex-grow px-2 py-4">
			<ul class="space-y-2">
				<li v-for="(item, index) in menuItems" :key="index">
					<router-link
						:to="item.path"
						class="flex items-center p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
						:class="{ 'justify-center': collapsed }"
					>
						<FeatherIcon
							:name="item.icon"
							class="h-5 w-5 text-zinc-600 dark:text-zinc-400"
						/>
						<span v-if="!collapsed" class="ml-3 text-zinc-700 dark:text-zinc-300">{{
							item.name
						}}</span>
					</router-link>
				</li>
			</ul>
		</div>

		<!-- Action Items -->
		<div class="mt-auto px-2 pb-4">
			<div class="border-t border-gray-200 dark:border-zinc-700 pt-4">
				<ul class="space-y-2">
					<li v-for="(item, index) in actionItems" :key="index">
						<a
							href="#"
							class="flex items-center p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
							:class="{ 'justify-center': collapsed }"
							@click.prevent="item.action"
						>
							<FeatherIcon
								:name="item.icon"
								class="h-5 w-5 text-zinc-600 dark:text-zinc-400"
							/>
							<span
								v-if="!collapsed"
								class="ml-3 text-zinc-700 dark:text-zinc-300"
								>{{ item.name }}</span
							>
						</a>
					</li>

					<!-- Toggle Sidebar Button -->
					<li>
						<a
							href="#"
							class="flex items-center p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
							:class="{ 'justify-center': collapsed }"
							@click.prevent="toggleSidebar"
						>
							<FeatherIcon
								:name="collapsed ? 'chevron-right' : 'chevron-left'"
								class="h-5 w-5 text-zinc-600 dark:text-zinc-400"
							/>
							<span v-if="!collapsed" class="ml-3 text-zinc-700 dark:text-zinc-300"
								>Collapse</span
							>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const collapsed = ref(true)
const isDarkMode = ref(false)

// Check initial theme state
onMounted(() => {
	isDarkMode.value = document.documentElement.classList.contains('dark')
})

const toggleSidebar = () => {
	collapsed.value = !collapsed.value
}

const menuItems = [
	{ name: 'Dashboard', icon: 'home', path: '/' },
	{ name: 'Leads', icon: 'users', path: '/leads' },
	{ name: 'Deals', icon: 'briefcase', path: '/deals' },
	{ name: 'Projects', icon: 'home', path: '/projects' },
	{ name: 'Calendar', icon: 'calendar', path: '/calendar' },
]

const actionItems = [
	{
		name: 'Theme',
		get icon() { return isDarkMode.value ? 'sun' : 'moon' },
		action: () => toggleDarkMode(),
	},
	{
		name: 'Settings',
		icon: 'settings',
		action: () => console.log('Settings clicked'),
	},
]

function toggleDarkMode() {
	document.documentElement.classList.toggle('dark')
	isDarkMode.value = !isDarkMode.value
}
</script>
