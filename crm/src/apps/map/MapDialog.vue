<template>
	<Dialog
		:visible="visible"
		@update:visible="$emit('update:visible', $event)"
		header="Property Map"
		:style="{ width: '95vw', height: '90vh' }"
		:modal="true"
		:dismissableMask="true"
		:closeOnEscape="true"
		@hide="onDialogHide"
		@after-hide="onDialogClose"
	>
		<div class="map-container">
			<div v-if="loading" class="map-loading">
				<i class="pi pi-spin pi-spinner map-spinner"></i>
				<span>Loading map data...</span>
			</div>

			<div v-else-if="error" class="map-error">
				<i class="pi pi-exclamation-triangle"></i>
				<p>{{ errorMessage }}</p>
				<Button label="Retry" @click="initializeMap" />
			</div>

			<div v-else id="property-map" class="map-content"></div>

			<!-- Map Controls -->
			<div class="map-controls">
				<button class="map-control-button" @click="zoomIn" title="Zoom in">
					<i class="pi pi-plus"></i>
				</button>
				<button class="map-control-button" @click="zoomOut" title="Zoom out">
					<i class="pi pi-minus"></i>
				</button>
				<button class="map-control-button" @click="resetView" title="Reset view">
					<i class="pi pi-home"></i>
				</button>
				<button class="map-control-button" @click="toggleLayers" title="Toggle layers">
					<i class="pi pi-map"></i>
				</button>
			</div>

			<!-- Legend -->
			<div class="map-legend">
				<div class="legend-item">
					<div
						class="legend-color"
						style="background-color: rgba(0, 113, 255, 0.2); border: 2px solid #0071ff"
					></div>
					<span>Projects</span>
				</div>
				<div class="legend-item">
					<div
						class="legend-color"
						style="background-color: rgba(255, 140, 0, 0.2); border: 2px solid #ff8c00"
					></div>
					<span>Phases</span>
				</div>
				<div class="legend-item">
					<div class="legend-marker"></div>
					<span>Buildings</span>
				</div>
			</div>

			<!-- Layer Control Panel (toggled by layer button) -->
			<div v-if="showLayersPanel" class="layers-panel">
				<h3>Map Layers</h3>
				<div class="layer-controls">
					<div class="layer-control-item">
						<Checkbox v-model="showProjectLayers" :binary="true" id="show-projects" />
						<label for="show-projects">Show Projects</label>
					</div>
					<div class="layer-control-item">
						<Checkbox v-model="showPhaseLayers" :binary="true" id="show-phases" />
						<label for="show-phases">Show Phases</label>
					</div>
					<div class="layer-control-item">
						<Checkbox
							v-model="showBuildingMarkers"
							:binary="true"
							id="show-buildings"
						/>
						<label for="show-buildings">Show Buildings</label>
					</div>
				</div>
				<Button label="Close" text @click="showLayersPanel = false" />
			</div>
		</div>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useTerritoryStore } from '@/stores/territory'
import { useBuildingStore } from '@/stores/building'
import { useProjectStore } from '@/stores/project'
import { useListingStore } from '@/stores/listing'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Component props
const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
})

// Component emits
const emit = defineEmits(['update:visible', 'close'])

// Component state
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const map = ref(null)
const projectLayers = ref({}) // Store project layers by territory ID
const phaseLayers = ref({}) // Store phase layers by territory ID
const buildingMarkers = ref({}) // Store building markers by building ID
const showLayersPanel = ref(false)
const showProjectLayers = ref(true)
const showPhaseLayers = ref(true)
const showBuildingMarkers = ref(true)

// Layer groups
const projectLayerGroup = ref(null)
const phaseLayerGroup = ref(null)
const buildingLayerGroup = ref(null)

// Store instances
const territoryStore = useTerritoryStore()
const buildingStore = useBuildingStore()
const projectStore = useProjectStore()
const listingStore = useListingStore()

// Custom icons for markers
const buildingIcon = L.icon({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
	shadowSize: [41, 41],
	shadowAnchor: [13, 41],
})

// Watch visibility changes to initialize map when dialog opens
watch(
	() => props.visible,
	async (newVisible) => {
		if (newVisible) {
			loading.value = true
			error.value = false

			try {
				// First set loading to false to render the container
				loading.value = false

				// Wait for dialog to be fully rendered
				await nextTick()
				// Add small delay to ensure DOM is ready
				await new Promise((resolve) => setTimeout(resolve, 100))

				// Initialize map components
				initializeMap()

				// Load territories and buildings
				await loadTerritories()
				await loadBuildings()

				loading.value = false
			} catch (err) {
				console.error('Error in map initialization:', err)
				error.value = true
				errorMessage.value = 'Failed to initialize map. Please try again.'
			}
		}
	},
)

// Initialize the map
function initializeMap() {
	// Verify map container exists
	const mapContainer = document.getElementById('property-map')
	if (!mapContainer) {
		throw new Error('Map container not found')
	}

	// Create the map with default view
	map.value = L.map('property-map', {
		zoomControl: false,
	}).setView([25.276987, 55.296249], 10) // Default to Dubai

	// Add base tile layer
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20,
	}).addTo(map.value)

	// Create layer groups
	projectLayerGroup.value = L.layerGroup().addTo(map.value)
	phaseLayerGroup.value = L.layerGroup().addTo(map.value)
	buildingLayerGroup.value = L.layerGroup().addTo(map.value)
}

// Load territories from the store and display them
async function loadTerritories() {
	try {
		// Fetch territories from store
		await territoryStore.fetchTerritories()

		// Clear existing layers
		projectLayerGroup.value.clearLayers()
		phaseLayerGroup.value.clearLayers()

		// Get all territories
		const territories = territoryStore.territories

		// First add project territories (to ensure they're at the bottom layer)
		territories.filter((t) => t.is_project && !t.is_phase).forEach(addProjectToMap)

		// Then add phase territories on top
		territories.filter((t) => t.is_phase).forEach(addPhaseToMap)
	} catch (err) {
		console.error('Error loading territories:', err)
		throw new Error('Failed to load territory data')
	}
}

// Add a project territory to the map
function addProjectToMap(territory) {
	if (!territory || !territory.geo) return

	try {
		const geo = typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo
		let layer

		// Skip point-type project territories as they'll be shown by their buildings
		if (geo.type === 'Point') {
			return
		}

		if (geo.type === 'Polygon') {
			// Convert coordinates to Leaflet format
			const latlngs = geo.coordinates[0].map((coord) => [coord[1], coord[0]])

			// Create polygon with project style
			layer = L.polygon(latlngs, {
				color: '#0071ff',
				weight: 2,
				opacity: 0.8,
				fillColor: '#0071ff',
				fillOpacity: 0.2,
			})

			// Add popup with territory info
			layer.bindPopup(`
        <b>${territory.name_en || territory.territory_name || 'Project'}</b>
        <br>Project ID: ${territory.name}
      `)

			// Add to project layer group
			layer.addTo(projectLayerGroup.value)

			// Store reference to layer
			projectLayers.value[territory.name] = layer
		}
	} catch (err) {
		console.error(`Error adding project to map (${territory.name}):`, err)
	}
}

// Add a phase territory to the map
function addPhaseToMap(territory) {
	if (!territory || !territory.geo) return

	try {
		const geo = typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo
		let layer

		if (geo.type === 'Polygon') {
			// Convert coordinates to Leaflet format
			const latlngs = geo.coordinates[0].map((coord) => [coord[1], coord[0]])

			// Create polygon with phase style (different color than projects)
			layer = L.polygon(latlngs, {
				color: '#FF8C00', // Orange for phases
				weight: 2,
				opacity: 0.8,
				fillColor: '#FF8C00',
				fillOpacity: 0.2,
			})

			// Add popup with territory info
			layer.bindPopup(`
        <b>${territory.name_en || territory.territory_name || 'Phase'}</b>
        <br>Phase ID: ${territory.name}
        <br>Project: ${territory.parent_territory || 'Unknown'}
      `)

			// Add to phase layer group
			layer.addTo(phaseLayerGroup.value)

			// Store reference to layer
			phaseLayers.value[territory.name] = layer
		} else if (geo.type === 'Point') {
			// For point geometries, create a circle with phase style
			layer = L.circle([geo.coordinates[1], geo.coordinates[0]], {
				color: '#FF8C00',
				fillColor: '#FF8C00',
				fillOpacity: 0.2,
				radius: 100, // Default radius in meters
			})

			// Add popup with territory info
			layer.bindPopup(`
        <b>${territory.name_en || territory.territory_name || 'Phase'}</b>
        <br>Phase ID: ${territory.name}
        <br>Project: ${territory.parent_territory || 'Unknown'}
      `)

			// Add to phase layer group
			layer.addTo(phaseLayerGroup.value)

			// Store reference to layer
			phaseLayers.value[territory.name] = layer
		}
	} catch (err) {
		console.error(`Error adding phase to map (${territory.name}):`, err)
	}
}

// Load buildings and display as markers
async function loadBuildings() {
	try {
		// First reset any existing filters
		await buildingStore.resetFilters()

		// Fetch all buildings without any project context
		await buildingStore.fetchAllBuildings() // Make sure this endpoint exists in the store

		// Clear existing building markers
		buildingLayerGroup.value.clearLayers()
		buildingMarkers.value = {}

		// Get all buildings that have lat/lng coordinates
		const buildings = buildingStore.buildings.filter((b) => b.lat && b.lng)

		// Add each building as a marker
		for (const building of buildings) {
			try {
				// Get listings for this building
				await listingStore.updateFilters({ building: building.name })
				await listingStore.fetchListings()
				const buildingListings = listingStore.listings

				// Add marker to map
				addBuildingMarker(building, buildingListings)
			} catch (err) {
				console.error(`Error processing building ${building.name}:`, err)
			}
		}

		// Reset filters after we're done
		await listingStore.resetFilters()
	} catch (err) {
		console.error('Error loading buildings:', err)
		throw new Error('Failed to load building data')
	}
}

// Add a building marker to the map with listings data
function addBuildingMarker(building, listings) {
	if (!building.lat || !building.lng) return

	try {
		// Create marker at building location
		const marker = L.marker([parseFloat(building.lat), parseFloat(building.lng)], {
			icon: buildingIcon,
			title: building.building_name,
		})

		// Group listings by type and bedrooms
		const groupedListings = {}
		listings.forEach((listing) => {
			const type = listing.type || 'Not Specified'
			const bedrooms = listing.bedrooms || 'Not Specified'
			const key = `${type}-${bedrooms}`

			if (!groupedListings[key]) {
				groupedListings[key] = {
					type: type,
					bedrooms: bedrooms,
					count: 0,
					availabilities: {},
				}
			}

			// Count by availability status
			const availability = listing.availability || 'Available'
			if (!groupedListings[key].availabilities[availability]) {
				groupedListings[key].availabilities[availability] = 0
			}

			groupedListings[key].count++
			groupedListings[key].availabilities[availability]++
		})

		// Create listings table rows
		const listingRows = Object.values(groupedListings)
			.map((group) => {
				// Generate availability text that shows counts by status
				const availabilityText = Object.entries(group.availabilities)
					.map(([status, count]) => `${status}: ${count}`)
					.join('<br>')

				return `
        <tr>
          <td>${group.type}</td>
          <td>${group.bedrooms}</td>
          <td>${group.count}</td>
          <td>${availabilityText}</td>
        </tr>
      `
			})
			.join('')

		const popupContent = `
      <div class="building-popup">
        <h4>${building.building_name}</h4>
        <p>
          <strong>Project:</strong> ${building.project}<br>
          <strong>Status:</strong> ${building.status || 'Off-plan'}<br>
        </p>
        ${
			listings.length > 0
				? `
          <h5>Available Units:</h5>
          <table class="listings-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Bedrooms</th>
                <th>Units</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              ${listingRows}
            </tbody>
          </table>
        `
				: '<p>No units available in this building</p>'
		}
      </div>
    `

		// Bind popup to marker
		marker.bindPopup(popupContent, {
			maxWidth: 300,
			maxHeight: 300,
			autoPanPadding: [50, 50],
		})

		// Add to building layer group
		marker.addTo(buildingLayerGroup.value)

		// Store reference to marker
		buildingMarkers.value[building.name] = marker
	} catch (err) {
		console.error(`Error adding building marker for ${building.name}:`, err)
	}
}

// Toggle the visibility of the layers panel
function toggleLayers() {
	showLayersPanel.value = !showLayersPanel.value
}

// Watch for layer visibility changes

watch(showProjectLayers, (visible) => {
	if (visible) {
		map.value.addLayer(projectLayerGroup.value)
	} else {
		map.value.removeLayer(projectLayerGroup.value)
	}
})

watch(showPhaseLayers, (visible) => {
	if (visible) {
		map.value.addLayer(phaseLayerGroup.value)
	} else {
		map.value.removeLayer(phaseLayerGroup.value)
	}
})

watch(showBuildingMarkers, (visible) => {
	if (visible) {
		map.value.addLayer(buildingLayerGroup.value)
	} else {
		map.value.removeLayer(buildingLayerGroup.value)
	}
})

// Map control functions
function zoomIn() {
	if (map.value) map.value.zoomIn()
}

function zoomOut() {
	if (map.value) map.value.zoomOut()
}

function resetView() {
	if (!map.value) return

	// Get bounds from all territories
	const bounds = []

	// Add project bounds
	Object.values(projectLayers.value).forEach((layer) => {
		if (layer.getBounds) {
			bounds.push(layer.getBounds())
		} else if (layer.getLatLng) {
			bounds.push(L.latLngBounds(layer.getLatLng(), layer.getLatLng()))
		}
	})

	// Add phase bounds
	Object.values(phaseLayers.value).forEach((layer) => {
		if (layer.getBounds) {
			bounds.push(layer.getBounds())
		} else if (layer.getLatLng) {
			bounds.push(L.latLngBounds(layer.getLatLng(), layer.getLatLng()))
		}
	})

	if (bounds.length > 0) {
		// Merge all bounds
		const combinedBounds = L.latLngBounds(bounds[0].getSouthWest(), bounds[0].getNorthEast())
		bounds.forEach((bound) => combinedBounds.extend(bound))

		// Fit map to combined bounds
		map.value.fitBounds(combinedBounds, {
			padding: [50, 50],
			maxZoom: 16,
		})
	} else {
		// Default view if no bounds available
		map.value.setView([25.276987, 55.296249], 10)
	}
}

// Handle dialog hide (triggered when dialog is closed)
function onDialogHide() {
	emit('update:visible', false)
}

// Handle dialog close
function onDialogClose() {
	emit('close')
	// Clean up map instance if it exists
	if (map.value) {
		map.value.remove()
		map.value = null
	}
}

// Cleanup on component unmount
onBeforeUnmount(() => {
	if (map.value) {
		map.value.remove()
		map.value = null
	}
})
</script>

<style scoped>
.map-container {
	position: relative;
	width: 100%;
	height: calc(90vh - 90px); /* Adjust for header */
	background-color: #f5f5f5;
	overflow: hidden;
}

.map-content {
	width: 100%;
	height: 100%;
	z-index: 1;
}

.map-loading,
.map-error {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f5f5f5;
	z-index: 10;
	gap: 1rem;
}

.map-spinner {
	font-size: 2rem;
	color: #666;
}

.map-error i {
	font-size: 2rem;
	color: #f44336;
	margin-bottom: 1rem;
}

.map-error p {
	color: #666;
	max-width: 400px;
	text-align: center;
	margin-bottom: 1rem;
}

.map-controls {
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	z-index: 1000;
}

.map-control-button {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #ddd;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.map-control-button:hover {
	background-color: #f5f5f5;
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.map-control-button i {
	font-size: 1rem;
	color: #333;
}

.map-legend {
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	background-color: white;
	border-radius: 4px;
	padding: 0.75rem 1rem;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	z-index: 1000;
}

.legend-item {
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;
}

.legend-item:last-child {
	margin-bottom: 0;
}

.legend-color {
	width: 1.5rem;
	height: 1.5rem;
	margin-right: 0.5rem;
	border-radius: 3px;
}

.legend-marker {
	width: 0.75rem;
	height: 1.25rem;
	margin-right: 0.75rem;
	margin-left: 0.375rem;
	background-color: #2b8cff;
	border-radius: 50% 50% 50% 0;
	transform: rotate(-45deg);
}

.layers-panel {
	position: absolute;
	top: 1rem;
	left: 1rem;
	background-color: white;
	border-radius: 4px;
	padding: 1rem;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	max-width: 250px;
}

.layers-panel h3 {
	margin-top: 0;
	margin-bottom: 1rem;
	font-size: 1rem;
}

.layer-controls {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.layer-control-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

/* Popup styles (these will be applied globally) */
:global(.building-popup h4) {
	margin-top: 0;
	margin-bottom: 0.5rem;
}

:global(.building-popup h5) {
	margin-top: 1rem;
	margin-bottom: 0.5rem;
}

:global(.listings-table) {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.9rem;
}

:global(.listings-table th, .listings-table td) {
	border: 1px solid #ddd;
	padding: 0.25rem 0.5rem;
	text-align: left;
}

:global(.listings-table th) {
	background-color: #f5f5f5;
}
</style>
