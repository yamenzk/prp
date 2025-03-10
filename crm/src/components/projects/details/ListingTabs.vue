<template>
	<div v-if="!currentListing" class="m-auto h-full">
		<Panel class="m-8" pt:root:class="!border-0 !bg-white dark:!bg-zinc-800">
			<div class="flex flex-col items-center justify-center h-full text-center py-12">
				<FeatherIcon name="home" class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4" />
				<h3 class="text-xl font-medium text-tertiary mb-2">No Listing Selected</h3>
				<p class="text-tertiary max-w-sm">
					Select a listing from the grid to view its details.
				</p>
			</div>
		</Panel>
	</div>
	<div v-else class="w-full h-full flex flex-col">
		<div
			class="listing-header border-b border-gray-200 dark:border-zinc-700 flex-none"
			style="padding: var(--p-datatable-header-padding)"
		>
			<div class="flex items-center justify-between p-4">
				<div>
					<h2 class="text-xl font-bold">
						{{ currentListing.project }} /
						{{ currentListing.building.substring(currentListing.project.length + 1) }}
						/ {{ currentListing.unit_id }}
					</h2>
				</div>
				<div class="flex gap-1 items-center">
					<Tag
						:value="currentListing.availability || 'Available'"
						:severity="getAvailabilitySeverity(currentListing.availability)"
						:icon="getAvailabilityIcon(currentListing.availability)"
						class="mr-3"
					/>
					<Button
						@click="switchTab('info')"
						rounded
						icon="pi pi-info-circle"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'info'"
						v-tooltip.top="'Info'"
					/>
					<Button
						@click="switchTab('pricing')"
						rounded
						icon="pi pi-dollar"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'pricing'"
						v-tooltip.top="'Pricing'"
					/>
					<Button
						@click="switchTab('media')"
						rounded
						icon="pi pi-camera"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'media'"
						v-tooltip.top="'Media'"
					/>
					<Button
						@click="switchTab('history')"
						rounded
						icon="pi pi-history"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'history'"
						v-tooltip.top="'History'"
					/>
					<Button
						@click="switchTab('notes')"
						rounded
						icon="pi pi-file"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'notes'"
						v-tooltip.top="'Documents'"
					/>
				</div>
			</div>
		</div>
		<div class="flex-grow overflow-hidden">
			<Tabs v-model:value="currentTab" class="h-full flex flex-col">
				<TabPanels class="h-full">
					<TabPanel value="info">
						<div class="h-full overflow-auto">
							<div class="p-4">
								<ListingInfoTab
									:listing="currentListing"
									@edit-field="openEditDialog"
								/>
							</div>
						</div>
					</TabPanel>
					<TabPanel value="pricing">
						<div class="h-full overflow-auto">
							<div class="p-4">
								<!-- <ListingPricingTab :listing="currentListing" @edit-field="openEditDialog" /> -->
								<div class="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
									<h2 class="text-lg font-semibold mb-2">Pricing Information</h2>
									<p class="text-gray-500 dark:text-zinc-400">
										Pricing information will be available soon.
									</p>
								</div>
							</div>
						</div>
					</TabPanel>
					<TabPanel value="media">
						<div class="h-full overflow-auto">
							<div class="p-4">
								<!-- <ListingMediaTab :listing-id="currentListing.name" /> -->
								<div class="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
									<h2 class="text-lg font-semibold mb-2">Media Gallery</h2>
									<p class="text-gray-500 dark:text-zinc-400">
										Media gallery will be available soon.
									</p>
								</div>
							</div>
						</div>
					</TabPanel>
					<TabPanel value="history">
						<div class="h-full overflow-hidden">
							<VersionTab :listing="currentListing" />
						</div>
					</TabPanel>
					<TabPanel value="notes">
						<div class="h-full overflow-auto">
							<div class="p-4">
								<!-- <NotesTab :doctype="'PRP Listing'" :docname="currentListing.name" /> -->
								<div class="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
									<h2 class="text-lg font-semibold mb-2">Notes & Documents</h2>
									<p class="text-gray-500 dark:text-zinc-400">
										Notes and document management will be available soon.
									</p>
								</div>
							</div>
						</div>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</div>
	</div>

	<!-- Listing Edit Dialog -->
	<EditDialog
		v-model:visible="dialogVisible"
		:field-name="editingField"
		:field-type="editingFieldType"
		:value="editValue"
		:title="dialogTitle"
		:options="dialogOptions"
		:validation="dialogValidation"
		:doctype="dialogDoctype"
		@save="handleDialogSave"
	/>

	<!-- Listing Delete Confirmation Dialog -->
	<DeleteDialog
		v-model:visible="deleteDialogVisible"
		title="Delete Listing"
		message="This action cannot be undone. To confirm deletion, please type the listing ID below:"
		confirm-field="unit_id"
		:confirm-value="currentListing?.unit_id"
		delete-button-label="Delete Listing"
		@confirm="confirmDeleteListing"
	/>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import ListingInfoTab from './tabs/ListingInfoTab.vue'
// import ListingPricingTab from '@/components/listings/tabs/ListingPricingTab.vue'
// import ListingMediaTab from '@/components/listings/tabs/ListingMediaTab.vue'
import VersionTab from './tabs/VersionTab.vue'
// import NotesTab from '@/components/common/NotesTab.vue'

// Store references
const listingStore = useListingStore()
const route = useRoute()
const router = useRouter()

// Emitter for component communication
const emitter = inject('emitter')

// Tab state
const currentTab = ref('info')

// Dialog state
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const dialogOptions = ref([])
const dialogValidation = ref(null)
const dialogDoctype = ref('')

// Delete dialog state
const deleteDialogVisible = ref(false)

// Computed properties
const currentListing = computed(() => listingStore.currentListing)

// Handle tab switching with routing
const switchTab = (tabId) => {
	if (currentListing.value) {
		currentTab.value = tabId
		router.push({
			name: 'ListingTabDetails',
			params: {
				id: route.params.id,
				buildingId: route.params.buildingId,
				listingId: currentListing.value.name,
				tabId: tabId,
			},
		})
	}
}

// Listen for listing selection and router changes
onMounted(() => {
	// Listen for listing selection events
	emitter.on('listing-selected', async (listing) => {
		await listingStore.fetchListing(listing.name)

		// If we have a tab in the URL params, use that
		if (route.params.tabId) {
			// Update active tab based on route
			currentTab.value = route.params.tabId
		}

		// If we're not on the listing tab route, update URL to include current tab
		if (route.name !== 'ListingTabDetails') {
			const tabId = route.params.tabId || currentTab.value
			router.push({
				name: 'ListingTabDetails',
				params: {
					id: route.params.id,
					buildingId: route.params.buildingId,
					listingId: listing.name,
					tabId: tabId,
				},
			})
		}
	})

	// Listen for clear listing events (when building changes)
	emitter.on('clear-current-listing', () => {
		// Clear the current listing in the store
		listingStore.clearCurrentListing()

		// Update the URL to remove the listing ID
		if (route.params.listingId) {
			router.push({
				name: 'BuildingDetails',
				params: {
					id: route.params.id,
					buildingId: route.params.buildingId,
				},
			})
		}
	})

	// Check for tab param on initial load
	if (route.params.tabId) {
		currentTab.value = route.params.tabId
	}
})

// Watch for route changes to update the active tab
watch(
	() => route.params.tabId,
	(newTabId) => {
		if (newTabId) {
			currentTab.value = newTabId
		}
	},
)

// Methods for handling availability status
const getAvailabilitySeverity = (status) => {
	switch (status) {
		case 'Sold':
			return 'danger'
		case 'Available for Secondhand':
			return 'warning'
		default:
			return 'success' // 'Available' is default
	}
}

const getAvailabilityIcon = (status) => {
	return 'pi pi-tag'
}

// Define empty arrays for backward compatibility
const listingFields = []
const pricingFields = []
const attributeFields = []

// Methods for Listing Management
const openEditDialog = (fieldName, currentValue, title, type) => {
	// If fieldName is an object, it's coming from the new component structure
	if (typeof fieldName === 'object' && fieldName !== null) {
		const field = fieldName
		editingField.value = field.fieldName
		editValue.value = field.currentValue
		dialogTitle.value = field.title
		editingFieldType.value = field.type || 'text'
		dialogOptions.value = field.options || []
		dialogValidation.value = field.validation || null
		dialogDoctype.value = field.doctype || ''
	} else {
		// Handle old way for backward compatibility
		editingField.value = fieldName
		editValue.value = currentValue
		dialogTitle.value = title
		editingFieldType.value = type || 'text'

		// Find the field definition in any of the field arrays
		const allFields = [...listingFields, ...pricingFields, ...attributeFields]
		const fieldDef = allFields.find((field) => field.name === fieldName) || {}

		// Set all properties from the field definition
		dialogOptions.value = fieldDef.options || []
		dialogValidation.value = fieldDef.validation || null
		dialogDoctype.value = fieldDef.doctype || ''
	}

	dialogVisible.value = true
}

const handleDialogSave = async ({ fieldName, value }) => {
	if (!currentListing.value || !fieldName) return

	try {
		const updateData = {
			[fieldName]: value,
		}

		await listingStore.updateListing(currentListing.value.name, updateData)
		await listingStore.refreshCurrentListing()
	} catch (error) {
		console.error('Error updating listing field:', error)
		await listingStore.refreshCurrentListing()
	}
}

const confirmDeleteListing = async () => {
	if (!currentListing.value) return

	try {
		await listingStore.deleteListing(currentListing.value.name)
		deleteDialogVisible.value = false
		emitter.emit('listing-deleted')
	} catch (error) {
		console.error('Error deleting listing:', error)
	}
}
</script>

<style scoped>
/* Ensure all height-related containers properly cascade the height */
:deep(.p-tabs),
:deep(.p-tabpanels),
:deep(.p-tabpanel) {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

:deep(.p-tabpanel) > div {
	flex: 1;
}
</style>