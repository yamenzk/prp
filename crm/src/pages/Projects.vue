<template>
	<div class="page-container">
		<div class="header">
			<h1>Projects</h1>
			<div class="actions">
				<Button
					icon="pi pi-map"
					class="p-button-primary mr-2"
					@click="openMapView"
					label="Map View"
				/>
				<!-- ...existing buttons... -->
			</div>
		</div>

		<ProjectList></ProjectList>
	</div>
</template>

<script setup>
import ProjectList from '@/components/projects/ProjectList.vue'
import { inject } from 'vue'

// Get map dialog API from the provide/inject system
const mapDialog = inject('mapDialog')

// Function to open the map view
function openMapView() {
	if (mapDialog) {
		mapDialog.open()
	}
}
</script>
