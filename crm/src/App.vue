<template>
	<div>
		<!-- Use layout for all routes except login -->
		<Layout v-if="!isLoginRoute">
			<router-view />
		</Layout>

		<!-- Render Login page without layout -->
		<router-view v-else />
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/layout/Layout.vue'

const route = useRoute()
const isLoginRoute = computed(() => route.name === 'Login')
</script>

<style>
@import './assets/Inter/inter.css';

html,
body {
	font-family:
		'Inter',
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		Roboto,
		Helvetica,
		Arial,
		sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style>
