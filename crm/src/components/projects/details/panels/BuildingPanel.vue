<template>
	<div class="pd-panel">
		<div class="pd-panel-header">
			<h3 class="pd-panel-title">Buildings</h3>
			<button class="pd-button-icon" @click="showNewBuildingDialog">
				<i class="pi pi-plus"></i>
			</button>
		</div>

		<!-- Loading state -->
		<div v-if="loading" class="pd-panel-content pd-loading-container">
			<i class="pi pi-spin pi-spinner pd-spinner"></i>
		</div>

		<!-- Empty state -->
		<div v-else-if="!buildings.length" class="pd-panel-content pd-empty-container">
			<div class="pd-empty-state">
				<i class="pi pi-building"></i>
				<p>No buildings found</p>
				<button class="pd-button-small" @click="showNewBuildingDialog">
					<i class="pi pi-plus"></i>
					<span>Add Building</span>
				</button>
			</div>
		</div>

		<!-- Building list -->
		<div v-else class="pd-panel-content pd-scrollable">
			<div
				v-for="building in buildings"
				:key="building.name"
				class="pd-building-item"
				:class="{
					'pd-selected': selectedBuilding && selectedBuilding.name === building.name,
				}"
				@click="selectBuilding(building)"
				@contextmenu="onRightClick($event, building)"
			>
				<div class="pd-building-icon">
					<i class="pi pi-building"></i>
				</div>
				<div class="pd-building-info">
					<div class="pd-building-name">{{ building.building_name }}</div>
					<div class="pd-building-status">
						<span class="pd-tag" :class="getStatusClass(building.status)">
							{{ building.status || 'Off-plan' }}
						</span>
						<span v-if="building.lat && building.lng" class="pd-location-indicator">
							<i class="pi pi-map-marker"></i>
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Load more button if needed -->
		<div v-if="hasMoreBuildings" class="pd-panel-footer">
			<button class="pd-button-text" @click="loadMoreBuildings" :disabled="loadingMore">
				<span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
				<i v-if="!loadingMore" class="pi pi-chevron-down"></i>
				<i v-else class="pi pi-spin pi-spinner"></i>
			</button>
		</div>

		<!-- Context Menu -->
		<ContextMenu ref="buildingMenu" :model="menuItems" />

		<!-- Create Building Dialog -->
		<CreateDialog
			v-model:visible="showCreateDialog"
			title="Add New Building"
			:fields="buildingFields"
			submitButtonLabel="Add Building"
			@submit="createBuilding"
		/>

		<!-- Edit Building Dialog -->
		<EditDialog
			v-model:visible="showEditDialog"
			:fieldName="editField.name"
			:fieldType="editField.type"
			:value="editField.value"
			:title="editField.label"
			:options="editField.options"
			:validation="editField.validation"
			@save="updateBuilding"
		/>

		<!-- Delete Building Dialog -->
		<DeleteDialog
			v-model:visible="showDeleteDialog"
			title="Delete Building"
			:message="`Are you sure you want to delete building '${selectedBuilding?.building_name}'? This will delete all associated listings and cannot be undone.`"
			:confirmField="'building_name'"
			:confirmValue="selectedBuilding?.building_name"
			@confirm="deleteSelectedBuilding"
		/>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildingStore } from '@/stores/building'
import { useTerritoryStore } from '@/stores/territory'
import { useProjectStore } from '@/stores/project' // Add import for project store
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

// Get project ID from route
const route = useRoute()
const projectId = computed(() => route.params.id)

// Event bus for communication between components
const emitter = inject('emitter')

// Store access
const buildingStore = useBuildingStore()
const territoryStore = useTerritoryStore()
const projectStore = useProjectStore() // Initialize project store

// Component state
const selectedBuilding = ref(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const loadingMore = ref(false)
const buildingMenu = ref(null)
const projectGeoType = ref(null) // 'Point' or 'Polygon'
const editField = ref({
	name: '',
	type: 'text',
	value: '',
	label: '',
	options: [],
})

// Computed properties
const buildings = computed(() => buildingStore.buildings)
const loading = computed(() => buildingStore.isLoading)
const hasMoreBuildings = computed(() => buildingStore.hasMoreBuildings)

// Dynamic menu items for context menu based on project geo type
const menuItems = computed(() => {
	const items = [
		{
			label: 'Edit Building Name',
			icon: 'pi pi-pencil',
			command: () => editBuildingName(),
		},
		{
			label: 'Edit Configuration',
			icon: 'pi pi-cog',
			command: () => editBuildingConfig(),
		},
		{
			label: 'Add Listing',
			icon: 'pi pi-plus',
			command: () =>
				emitter.emit('show-create-listing', { building: selectedBuilding.value }),
		},
	]

	// Only show Set Location option for polygon project types
	if (projectGeoType.value === 'Polygon') {
		items.push({
			label: 'Set Location',
			icon: 'pi pi-map-marker',
			command: () => emitter.emit('show-location-dialog', selectedBuilding.value),
		})
	}

	items.push({ separator: true })
	items.push({
		label: 'Delete Building',
		icon: 'pi pi-trash',
		class: 'text-red-500',
		command: () => (showDeleteDialog.value = true),
	})

	return items
})

// Building fields for create dialog (without lat/lng as they're handled automatically or via map)
const buildingFields = computed(() => [
	{
		name: 'project',
		label: 'Project',
		type: 'link',
		doctype: 'PRP Project',
		validation: 'required',
		default: projectId.value,
		readonly: true,
		fullWidth: false,
	},
	{
		name: 'building_name',
		label: 'Building Name',
		type: 'text',
		validation: 'required',
		fullWidth: false,
	},
	{
		name: 'building_configuration',
		label: 'Building Configuration',
		type: 'text',
		fullWidth: true,
	},
])

// Watch for selected building changes and emit event
watch(selectedBuilding, (building) => {
	if (building) {
		emitter.emit('building-selected', building)
	}
})

// Lifecycle hooks
onMounted(async () => {
	await fetchProjectData()
	await fetchBuildingsForProject()
})

// Fetch project data to determine geometry type
async function fetchProjectData() {
	try {
		// First fetch the project to get its territory field
		await projectStore.fetchProject(projectId.value)
		const project = projectStore.currentProject

		if (!project || !project.territory) {
			console.warn('Project has no territory field:', projectId.value)
			return
		}

		// Now get the territory data using the territory field from the project
		await territoryStore.fetchTerritories()
		const territory = territoryStore.territories.find((t) => t.name === project.territory)

		if (territory && territory.geo) {
			const geo =
				typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo

			console.log('Project territory geo type:', geo.type)
			projectGeoType.value = geo.type // 'Point' or 'Polygon'
		} else {
			console.warn('Territory not found or has no geometry data:', project.territory)
		}
	} catch (error) {
		console.error('Error fetching project data:', error)
	}
}

// Fetch buildings for the current project
async function fetchBuildingsForProject() {
	if (projectId.value) {
		await buildingStore.fetchBuildingsByProject(projectId.value)
	}
}

// Load more buildings
async function loadMoreBuildings() {
	loadingMore.value = true
	try {
		await buildingStore.loadMoreBuildings()
	} finally {
		loadingMore.value = false
	}
}

// Select a building
function selectBuilding(building) {
	selectedBuilding.value = building
}

// Right click handler for context menu
function onRightClick(event, building) {
	selectedBuilding.value = building
	buildingMenu.value.show(event)
}

// Show dialog to create a new building
function showNewBuildingDialog() {
	showCreateDialog.value = true
}

// Edit building name
function editBuildingName() {
	if (!selectedBuilding.value) return

	editField.value = {
		name: 'building_name',
		label: 'Building Name',
		type: 'text',
		value: selectedBuilding.value.building_name,
		validation: 'required',
	}

	showEditDialog.value = true
}

// Edit building configuration
function editBuildingConfig() {
	if (!selectedBuilding.value) return

	editField.value = {
		name: 'building_configuration',
		label: 'Building Configuration',
		type: 'text',
		value: selectedBuilding.value.building_configuration || '',
		validation: null,
	}

	showEditDialog.value = true
}

// Create new building
async function createBuilding(data) {
	try {
		// If project geo type is 'Point', automatically set the building coordinates
		if (projectGeoType.value === 'Point') {
			const territory = territoryStore.territories.find(
				(t) => t.is_project && t.name === projectId.value,
			)

			if (territory && territory.geo) {
				const geo =
					typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo

				if (geo.type === 'Point') {
					// Add coordinates to building data
					data.lat = geo.coordinates[1]
					data.lng = geo.coordinates[0]
				}
			}
		}

		await buildingStore.createBuilding(data)
	} catch (error) {
		console.error('Error creating building:', error)
	}
}

// Update building
async function updateBuilding({ fieldName, value }) {
	if (!selectedBuilding.value) return

	try {
		const updateData = {
			[fieldName]: value,
		}

		await buildingStore.updateBuilding(selectedBuilding.value.name, updateData)

		// Update local state until server refresh
		selectedBuilding.value = {
			...selectedBuilding.value,
			[fieldName]: value,
		}
	} catch (error) {
		console.error('Error updating building:', error)
	}
}

// Delete selected building
async function deleteSelectedBuilding() {
	if (!selectedBuilding.value) return

	try {
		await buildingStore.deleteBuilding(selectedBuilding.value.name)
		selectedBuilding.value = null
	} catch (error) {
		console.error('Error deleting building:', error)
	}
}

// Helper function to get status class
function getStatusClass(status) {
	if (!status) return 'pd-tag-info'

	switch (status) {
		case 'Off-plan':
			return 'pd-tag-info'
		case 'Due for Handover':
			return 'pd-tag-warning'
		case 'Handover Completed':
			return 'pd-tag-success'
		default:
			return 'pd-tag-info'
	}
}
</script>

<style scoped>
/* [Same as before with the addition of:] */
.pd-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: var(--pd-bg-surface);
	border-radius: 12px;
	overflow: hidden;
}

.pd-panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid var(--pd-border-light);
}

.pd-panel-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--pd-text-primary);
	margin: 0;
	letter-spacing: -0.01em;
}

.pd-panel-content {
	flex: 1;
	overflow: hidden;
	position: relative;
}

.pd-scrollable {
	overflow-y: auto;
	padding: 0.5rem;
	height: 100%;
}

.pd-panel-footer {
	padding: 0.75rem;
	display: flex;
	justify-content: center;
	border-top: 1px solid var(--pd-border-light);
}

.pd-building-item {
	display: flex;
	align-items: center;
	padding: 0.75rem;
	border-radius: 8px;
	margin-bottom: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	background-color: var(--pd-bg-base);
	border: 1px solid var(--pd-border-light);
}

.pd-building-item:hover {
	transform: translateY(-2px);
	box-shadow: 0 2px 8px var(--pd-shadow-color);
}

.pd-building-item.pd-selected {
	background-color: var(--pd-bg-surface-hover);
	border-color: var(--pd-border-medium);
}

.pd-building-icon {
	width: 38px;
	height: 38px;
	border-radius: 8px;
	background-color: var(--pd-badge-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 0.875rem;
}

.pd-building-icon i {
	font-size: 1.125rem;
	color: var(--pd-badge-text);
}

.pd-building-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.pd-building-name {
	font-size: 0.9375rem;
	font-weight: 500;
	color: var(--pd-text-primary);
	margin-bottom: 0.25rem;
}

.pd-building-status {
	display: flex;
}

.pd-tag {
	font-size: 0.6875rem;
	padding: 0.125rem 0.5rem;
	border-radius: 4px;
	font-weight: 500;
}

.pd-tag-info {
	background-color: var(--pd-info-bg);
	color: var(--pd-info);
}

.pd-tag-warning {
	background-color: var(--pd-warning-bg);
	color: var(--pd-warning);
}

.pd-tag-success {
	background-color: var(--pd-success-bg);
	color: var(--pd-success);
}

.pd-button-icon {
	width: 2rem;
	height: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	border: 1px solid var(--pd-border-light);
	background-color: var(--pd-bg-base);
	color: var(--pd-text-secondary);
	cursor: pointer;
	transition: all 0.2s ease;
}

.pd-button-icon:hover {
	background-color: var(--pd-bg-surface-hover);
	color: var(--pd-text-primary);
	transform: translateY(-1px);
	box-shadow: 0 2px 4px var(--pd-shadow-color);
}

.pd-button-text {
	background: transparent;
	border: none;
	color: var(--pd-text-secondary);
	font-size: 0.875rem;
	padding: 0.5rem 0.75rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.2s ease;
}

.pd-button-text:hover {
	background-color: var(--pd-bg-surface-hover);
	color: var(--pd-text-primary);
}

.pd-button-text:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.pd-button-small {
	background-color: var(--pd-bg-base);
	color: var(--pd-text-primary);
	border: 1px solid var(--pd-border-medium);
	border-radius: 6px;
	padding: 0.5rem 0.75rem;
	font-size: 0.75rem;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.pd-button-small:hover {
	background-color: var(--pd-bg-surface-hover);
	transform: translateY(-1px);
}

.pd-empty-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.pd-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
	text-align: center;
}

.pd-empty-state i {
	font-size: 1.5rem;
	color: var(--pd-text-tertiary);
	margin-bottom: 0.75rem;
}

.pd-empty-state p {
	font-size: 0.875rem;
	color: var(--pd-text-secondary);
	margin-bottom: 1rem;
}

.pd-loading-container {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.pd-spinner {
	font-size: 1.5rem;
	color: var(--pd-text-tertiary);
}
.pd-location-indicator {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-left: 0.5rem;
	color: var(--pd-text-tertiary);
	font-size: 0.75rem;
}

.pd-location-indicator i {
	font-size: 0.75rem;
}
</style>
