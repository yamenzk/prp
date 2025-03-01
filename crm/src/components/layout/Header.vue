<template>
	<header
		class="bg-white dark:bg-dark-accent border-b border-gray-200 dark:border-dark-border h-16 flex items-center px-4 md:hidden"
	>
		<!-- Hamburger menu button (mobile only) -->
		<button
			@click="toggleMobileSidebar"
			class="p-1 mr-4 text-gray-500 dark:text-dark-text-secondary rounded-md hover:bg-gray-100 dark:hover:bg-dark-navbar focus:outline-none"
		>
			<FeatherIcon name="menu" class="w-6 h-6" />
		</button>

		<!-- App logo and title -->
		<div class="flex items-center">
			<img src="/favicon.png" alt="Logo" class="w-8 h-8" />
			<span class="ml-2 font-semibold text-gray-900 dark:text-dark-text">PRP CRM</span>
		</div>
	</header>
</template>

<script setup>
import { inject } from 'vue'

// Inject sidebar controls from the parent component
const toggleMobileSidebar = inject('toggleMobileSidebar')
</script>
