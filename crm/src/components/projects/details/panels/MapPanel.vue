<template>
	<div class="pd-map-panel">
		<div v-if="loading" class="pd-map-loading">
			<i class="pi pi-spin pi-spinner pd-spinner"></i>
			<span>Loading map...</span>
		</div>

		<div v-else-if="error" class="pd-map-error">
			<i class="pi pi-exclamation-triangle"></i>
			<p>{{ errorMessage }}</p>
		</div>

		<div v-else id="project-map" class="pd-map-container"></div>

		<!-- Map Controls -->
		<div class="pd-map-controls">
			<button class="pd-map-control-button" @click="zoomIn" title="Zoom in">
				<i class="pi pi-plus"></i>
			</button>
			<button class="pd-map-control-button" @click="zoomOut" title="Zoom out">
				<i class="pi pi-minus"></i>
			</button>
			<button class="pd-map-control-button" @click="resetView" title="Reset view">
				<i class="pi pi-home"></i>
			</button>
		</div>

		<!-- Building Location Dialog -->
		<Dialog
			v-model:visible="showLocationDialog"
			header="Set Building Location"
			modal
			:style="{ width: '50rem' }"
		>
			<div class="pd-location-dialog-content">
				<p class="pd-location-help">Click on the map to set the building location.</p>
				<div id="location-map" class="pd-location-map"></div>
			</div>

			<template #footer>
				<Button label="Cancel" text @click="cancelLocationSelection" />
				<Button
					label="Save Location"
					@click="saveLocation"
					:disabled="!selectedLocation"
				/>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, onMounted, inject, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTerritoryStore } from '@/stores/territory'
import { useBuildingStore } from '@/stores/building'
import { useProjectStore } from '@/stores/project'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Component state
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const map = ref(null)
const locationMap = ref(null)
const projectLayer = ref(null)
const buildingsLayer = ref(null)
const showLocationDialog = ref(false)
const selectedLocation = ref(null)
const selectedBuilding = ref(null)
const tempMarker = ref(null)
const projectTerritory = ref(null)

// Create custom icon for markers
const markerIcon = ref(
	L.icon({
		iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41], // Position the bottom of the icon at the LatLng point
		popupAnchor: [1, -34],
		shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
		shadowSize: [41, 41],
		shadowAnchor: [13, 41], // Position the shadow properly as well
	}),
)

// Stores and emitter
const territoryStore = useTerritoryStore()
const buildingStore = useBuildingStore()
const projectStore = useProjectStore()
const emitter = inject('emitter')
const route = useRoute()

// Get project ID from route
const projectId = computed(() => route.params.id)

// Watching for building selection events
onMounted(() => {
	emitter.on('building-selected', (building) => {
		highlightBuilding(building)
	})

	emitter.on('show-location-dialog', (building) => {
		selectedBuilding.value = building
		openLocationDialog()
	})
})

// Setup map after component mount
onMounted(async () => {
	try {
		// First set loading to false and render the container
		loading.value = false

		// Give DOM time to update before initializing map
		await nextTick()

		// Initialize Leaflet map with default view
		initializeMap()

		// Fetch project territory data
		await fetchProjectTerritory()

		// Fetch buildings for this project
		await buildingStore.fetchBuildingsByProject(projectId.value)

		// Add buildings to map
		addBuildingsToMap()
	} catch (err) {
		console.error('Error initializing map:', err)
		error.value = true
		errorMessage.value = 'Failed to initialize map. Please refresh the page.'
	}
})

// Initialize the map with default view
function initializeMap() {
	// Create the map
	map.value = L.map('project-map', {
		zoomControl: false, // We'll use our custom controls
		attributionControl: true,
		doubleClickZoom: false, // Disable double-click zoom to prevent popup issues
	})

	// Set default view (Dubai)
	map.value.setView([25.276987, 55.296249], 12)

	// Add Carto Light basemap
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20,
	}).addTo(map.value)

	// Create a layer group for buildings
	buildingsLayer.value = L.layerGroup().addTo(map.value)
}

// Fetch project territory data
async function fetchProjectTerritory() {
	try {
		// First get project data to get the territory field
		await projectStore.fetchProject(projectId.value)
		const project = projectStore.currentProject

		if (!project || !project.territory) {
			console.warn('Project has no territory field:', projectId.value)
			return
		}

		// Now get territory data using the territory field from the project
		await territoryStore.fetchTerritories()
		const territories = territoryStore.territories

		// Find the territory that matches our project's territory field
		const territory = territories.find((t) => t.name === project.territory)

		if (territory) {
			console.log('Found project territory:', territory.name)
			projectTerritory.value = territory
			addProjectToMap(territory)
		} else {
			console.warn('Territory not found for project:', project.territory)
		}
	} catch (err) {
		console.error('Error fetching project territory:', err)
		// Continue with default map view
	}
}

// Add project territory to the map
function addProjectToMap(territory) {
	if (!territory || !territory.geo) {
		console.warn('No geometry data for territory:', territory?.name)
		return
	}

	const geo = typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo

	if (projectLayer.value) {
		map.value.removeLayer(projectLayer.value)
	}

	if (geo.type === 'Point') {
		// Create a marker for point geometry
		projectLayer.value = L.marker([geo.coordinates[1], geo.coordinates[0]], {
			icon: markerIcon.value,
		})
			.addTo(map.value)
			.bindPopup(`<b>${territory.name_en || territory.name}</b>`)

		// Set map view to point
		map.value.setView([geo.coordinates[1], geo.coordinates[0]], 16)
	} else if (geo.type === 'Polygon') {
		// Convert coordinates to Leaflet format
		const latlngs = geo.coordinates[0].map((coord) => [coord[1], coord[0]])

		// Create a polygon for polygon geometry
		projectLayer.value = L.polygon(latlngs, {
			color: '#0071ff',
			weight: 2,
			opacity: 0.8,
			fillColor: '#0071ff',
			fillOpacity: 0.2,
		})
			.addTo(map.value)
			.bindPopup(`<b>${territory.name_en || territory.name}</b>`)

		// Fit map to polygon bounds
		map.value.fitBounds(projectLayer.value.getBounds(), {
			padding: [20, 20],
			maxZoom: 17,
		})
	}
}

// Add buildings to the map
function addBuildingsToMap() {
	// Clear current buildings
	if (buildingsLayer.value) {
		buildingsLayer.value.clearLayers()
	}

	// Add each building as a marker
	buildingStore.buildings.forEach((building) => {
		if (building.lat && building.lng) {
			// Create a marker with precise coordinates
			const latlng = L.latLng(parseFloat(building.lat), parseFloat(building.lng))
			const marker = L.marker(latlng, {
				icon: markerIcon.value,
				title: building.building_name,
			})

			// Add the marker to the layer
			marker.addTo(buildingsLayer.value)

			// Bind popup with configuration to handle open/close events properly
			const popupContent = `
        <b>${building.building_name}</b><br>
        Status: ${building.status || 'Off-plan'}<br>
        Availability: ${building.availability || 'Available'}
      `

			const popup = L.popup({
				closeButton: true,
				autoClose: true,
				closeOnEscapeKey: true,
				closeOnClick: true,
			}).setContent(popupContent)

			marker.bindPopup(popup)

			// Store building reference in marker for quick access
			marker.buildingData = building
		}
	})
}

// Highlight a selected building on the map
function highlightBuilding(building) {
	// Skip if no location data
	if (!building || !building.lat || !building.lng) return

	// Reset all markers first
	buildingsLayer.value.eachLayer((layer) => {
		if (layer.buildingData) {
			// Reset marker style
			layer.setIcon(markerIcon.value)

			// If this is the selected building, highlight it
			if (layer.buildingData.name === building.name) {
				// Create a highlighted version of the icon
				const highlightedIcon = L.icon({
					...markerIcon.value.options,
					// We'll use the same icon but could use a highlighted version
					// iconUrl: '/path/to/highlighted-marker-icon.png',
				})

				layer.setIcon(highlightedIcon)
				layer.openPopup()

				// Pan to this building
				map.value.setView([building.lat, building.lng], 17)
			}
		}
	})
}

// Open location selection dialog
function openLocationDialog() {
	if (!selectedBuilding.value) return

	showLocationDialog.value = true

	// Initialize location map in next tick to ensure DOM is updated
	setTimeout(() => {
		initLocationMap()
	}, 100)
}

// Initialize the location selection map
function initLocationMap() {
	// Create the map for location selection
	locationMap.value = L.map('location-map', {
		zoomControl: false,
		doubleClickZoom: false, // Disable double-click zoom to prevent popup issues
	})

	// Add Carto Light basemap
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20,
	}).addTo(locationMap.value)

	// Default view (Dubai)
	locationMap.value.setView([25.276987, 55.296249], 12)

	// Get project territory to display
	if (projectTerritory.value && projectTerritory.value.geo) {
		const geo =
			typeof projectTerritory.value.geo === 'string'
				? JSON.parse(projectTerritory.value.geo)
				: projectTerritory.value.geo

		if (geo.type === 'Polygon') {
			// Convert coordinates to Leaflet format
			const latlngs = geo.coordinates[0].map((coord) => [coord[1], coord[0]])

			// Create a polygon for polygon geometry
			const polygon = L.polygon(latlngs, {
				color: '#0071ff',
				weight: 2,
				opacity: 0.8,
				fillColor: '#0071ff',
				fillOpacity: 0.2,
			}).addTo(locationMap.value)

			// Fit map to polygon bounds
			locationMap.value.fitBounds(polygon.getBounds(), {
				padding: [20, 20],
				maxZoom: 17,
			})
		} else if (geo.type === 'Point') {
			// For point projects, center on the project point
			locationMap.value.setView([geo.coordinates[1], geo.coordinates[0]], 16)
		}
	}

	// Add click handler to select location
	locationMap.value.on('click', onLocationMapClick)

	// Add existing marker if building already has location
	if (selectedBuilding.value.lat && selectedBuilding.value.lng) {
		selectedLocation.value = {
			lat: selectedBuilding.value.lat,
			lng: selectedBuilding.value.lng,
		}

		tempMarker.value = L.marker([selectedBuilding.value.lat, selectedBuilding.value.lng], {
			icon: markerIcon.value,
		}).addTo(locationMap.value)
	}
}

// Handle click on location map
function onLocationMapClick(e) {
	// Store selected location with precise coordinates
	selectedLocation.value = {
		lat: e.latlng.lat,
		lng: e.latlng.lng,
	}

	// Clear existing marker
	if (tempMarker.value) {
		locationMap.value.removeLayer(tempMarker.value)
	}

	// Add new marker at clicked position with precise coordinates
	tempMarker.value = L.marker([e.latlng.lat, e.latlng.lng], { icon: markerIcon.value }).addTo(
		locationMap.value,
	)

	// Create a popup with safe configuration
	const popup = L.popup({
		closeButton: true,
		autoClose: true,
		closeOnEscapeKey: true,
		closeOnClick: true,
	}).setContent(`New location for ${selectedBuilding.value.building_name}`)

	tempMarker.value.bindPopup(popup).openPopup()
}

// Save the selected location
async function saveLocation() {
	if (!selectedLocation.value || !selectedBuilding.value) return

	try {
		// Update building location with precise coordinates
		await buildingStore.updateLocation(
			selectedBuilding.value.name,
			selectedLocation.value.lat.toFixed(6),
			selectedLocation.value.lng.toFixed(6),
		)

		// Close dialog
		showLocationDialog.value = false

		// Update building data locally for immediate feedback
		selectedBuilding.value.lat = selectedLocation.value.lat.toFixed(6)
		selectedBuilding.value.lng = selectedLocation.value.lng.toFixed(6)

		// Refresh buildings on map
		addBuildingsToMap()

		// Reset temporary data
		selectedLocation.value = null
		tempMarker.value = null
	} catch (err) {
		console.error('Error saving building location:', err)
	}
}

// Cancel location selection
function cancelLocationSelection() {
	showLocationDialog.value = false
	selectedLocation.value = null
	tempMarker.value = null
}

// Map control functions
function zoomIn() {
	if (map.value) map.value.zoomIn()
}

function zoomOut() {
	if (map.value) map.value.zoomOut()
}

function resetView() {
	if (!map.value) return

	if (projectLayer.value) {
		if (projectLayer.value.getBounds) {
			map.value.fitBounds(projectLayer.value.getBounds(), {
				padding: [20, 20],
				maxZoom: 17,
			})
		} else if (projectLayer.value.getLatLng) {
			map.value.setView(projectLayer.value.getLatLng(), 16)
		}
	} else {
		// Default view if no project layer
		map.value.setView([25.276987, 55.296249], 12)
	}
}
</script>

<style scoped>
.pd-map-panel {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: var(--pd-bg-surface);
	border-radius: 12px;
	overflow: hidden;
}

.pd-map-container {
	width: 100%;
	height: 100%;
	z-index: 1;
}

.pd-map-loading,
.pd-map-error {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: var(--pd-bg-surface);
	z-index: 2;
}

.pd-map-loading {
	gap: 1rem;
}

.pd-map-error {
	padding: 2rem;
	text-align: center;
}

.pd-map-error i {
	font-size: 2rem;
	color: var(--pd-error);
	margin-bottom: 1rem;
}

.pd-map-error p {
	color: var(--pd-text-secondary);
	max-width: 300px;
}

.pd-spinner {
	font-size: 2rem;
	color: var(--pd-text-tertiary);
}

.pd-map-controls {
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	z-index: 1000;
}

.pd-map-control-button {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	background-color: var(--pd-bg-base);
	border: 1px solid var(--pd-border-light);
	box-shadow: 0 2px 6px var(--pd-shadow-color);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.pd-map-control-button:hover {
	background-color: var(--pd-bg-surface-hover);
	transform: translateY(-2px);
	box-shadow: 0 4px 8px var(--pd-shadow-color);
}

.pd-map-control-button i {
	font-size: 1rem;
	color: var(--pd-text-primary);
}

.pd-location-dialog-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.pd-location-help {
	font-size: 0.9rem;
	color: var(--pd-text-secondary);
	margin: 0;
}

.pd-location-map {
	width: 100%;
	height: 400px;
	border-radius: 8px;
	overflow: hidden;
}
</style>
