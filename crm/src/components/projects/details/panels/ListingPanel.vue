<template>
	<div class="flex flex-col h-full bg-[var(--pd-bg-surface)] overflow-hidden">
		<div
			class="flex justify-between items-center p-4 border-b border-[var(--pd-border-light)]"
		>
			<div class="flex items-center gap-2">
				<h3 class="text-lg font-semibold text-[var(--pd-text-primary)] m-0 tracking-tight">
					<span v-if="selectedBuilding">{{ selectedBuilding.building_name }} / </span
					>Listings
				</h3>
				<button
					class="text-[var(--pd-text-tertiary)] hover:text-[var(--pd-text-secondary)] hover:bg-[var(--pd-bg-surface-hover)] p-1 rounded-full"
					@click="toggleInfoPopover"
				>
					<i class="pi pi-info-circle"></i>
				</button>
				<Popover ref="infoPopover">
					<div class="p-4 w-72">
						<h4 class="text-[15px] font-semibold mb-3 text-[var(--pd-text-primary)]">
							Legend
						</h4>

						<div class="mb-4">
							<div
								class="text-[13px] font-medium text-[var(--pd-text-secondary)] mb-2"
							>
								Availability Status
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-success)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-tag"></i>
								</span>
								<span>Available</span>
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-error)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-tag"></i>
								</span>
								<span>Sold</span>
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-warning)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-tag"></i>
								</span>
								<span>Available for Secondhand</span>
							</div>
						</div>

						<div class="mb-2">
							<div
								class="text-[13px] font-medium text-[var(--pd-text-secondary)] mb-2"
							>
								Handover Status
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-info)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-clock"></i>
								</span>
								<span>Off-plan</span>
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-warning)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-clock"></i>
								</span>
								<span>Due for Handover</span>
							</div>
							<div
								class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]"
							>
								<span
									class="w-5 h-5 rounded-full text-[var(--pd-success)] flex items-center justify-center text-[10px]"
								>
									<i class="pi pi-clock"></i>
								</span>
								<span>Handover Completed</span>
							</div>
						</div>
					</div>
				</Popover>
			</div>

			<div class="flex items-center gap-3">
				<div v-if="selectedBuilding" class="relative w-[200px]">
					<input
						type="text"
						v-model="searchQuery"
						placeholder="Search listings..."
						class="w-full h-8 px-8 py-2 rounded-md border border-[var(--pd-border-light)] bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--pd-border-medium)] focus:shadow"
						@input="filterListings"
					/>
					<i
						class="pi pi-search absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[var(--pd-text-tertiary)]"
					></i>
					<button
						v-if="searchQuery"
						class="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent text-[var(--pd-text-tertiary)] cursor-pointer w-4 h-4 rounded-full flex items-center justify-center text-xs hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)]"
						@click="clearSearch"
					>
						<i class="pi pi-times"></i>
					</button>
				</div>
				<button
					class="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--pd-border-light)] bg-[var(--pd-bg-base)] text-[var(--pd-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)] hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
					@click="showCreateListing"
					:disabled="!selectedBuilding"
				>
					<i class="pi pi-plus"></i>
				</button>
			</div>
		</div>

		<!-- No building selected state -->
		<div v-if="!selectedBuilding" class="flex-1 flex items-center justify-center">
			<div class="flex flex-col items-center justify-center p-6 text-center">
				<i class="pi pi-list text-2xl text-[var(--pd-text-tertiary)] mb-3"></i>
				<p class="text-sm text-[var(--pd-text-secondary)]">
					Select a building to view listings
				</p>
			</div>
		</div>

		<!-- Loading state -->
		<div v-else-if="loading" class="flex-1 flex items-center justify-center">
			<i class="pi pi-spin pi-spinner text-2xl text-[var(--pd-text-tertiary)]"></i>
		</div>

		<!-- Empty state -->
		<div
			v-else-if="!displayedListings.length && !searchQuery"
			class="flex-1 flex items-center justify-center"
		>
			<div class="flex flex-col items-center justify-center p-6 text-center">
				<i class="pi pi-home text-2xl text-[var(--pd-text-tertiary)] mb-3"></i>
				<p class="text-sm text-[var(--pd-text-secondary)] mb-4">
					No listings found for this building
				</p>
				<button
					class="bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] border border-[var(--pd-border-medium)] rounded-md px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:-translate-y-0.5"
					@click="showCreateListing"
				>
					<i class="pi pi-plus"></i>
					<span>Add Listing</span>
				</button>
			</div>
		</div>

		<!-- No search results state -->
		<div
			v-else-if="searchQuery && !displayedListings.length"
			class="flex-1 flex items-center justify-center"
		>
			<div class="flex flex-col items-center justify-center p-6 text-center">
				<i class="pi pi-search text-2xl text-[var(--pd-text-tertiary)] mb-3"></i>
				<p class="text-sm text-[var(--pd-text-secondary)] mb-4">
					No listings found matching "{{ searchQuery }}"
				</p>
				<button
					class="bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] border border-[var(--pd-border-medium)] rounded-md px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:-translate-y-0.5"
					@click="clearSearch"
				>
					<i class="pi pi-times"></i>
					<span>Clear Search</span>
				</button>
			</div>
		</div>

		<!-- Listing grid content -->
		<div v-else class="flex-1 overflow-auto p-3">
			<!-- Listings Grid -->
			<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
				<div
					v-for="listing in displayedListings"
					:key="listing.name"
					class="relative flex flex-col items-center justify-end pt-5 pb-3 px-2 rounded-xl bg-[var(--pd-bg-base)] border border-[var(--pd-border-light)] cursor-pointer transition-all duration-200 h-[110px] hover:-translate-y-0.5 hover:shadow-md"
					:class="{
						'bg-[var(--pd-bg-surface-hover)] border-[var(--pd-border-medium)]':
							selectedListing && selectedListing.name === listing.name,
					}"
					@click="selectListing(listing)"
				>
					<div class="absolute top-2 right-2 flex">
						<span
							class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
							:class="{
								'text-[var(--pd-info)]':
									!listing.status || listing.status === 'Off-plan',
								'text-[var(--pd-warning)]': listing.status === 'Due for Handover',
								' text-[var(--pd-success)]':
									listing.status === 'Handover Completed',
							}"
						>
							<i class="pi pi-clock" style="font-size: 12px"></i>
						</span>
						<span
							class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
							:class="{
								' text-[var(--pd-success)]':
									!listing.availability || listing.availability === 'Available',
								' text-[var(--pd-error)]': listing.availability === 'Sold',
								'text-[var(--pd-warning)]':
									listing.availability === 'Available for Secondhand',
							}"
						>
							<i class="pi pi-tag" style="font-size: 12px"></i>
						</span>
					</div>
					<div
						class="w-[38px] h-[38px] rounded-lg bg-[var(--pd-badge-bg)] flex items-center justify-center mb-2.5"
					>
						<i class="pi pi-home text-lg text-[var(--pd-badge-text)]"></i>
					</div>
					<div
						class="text-[13px] font-medium text-[var(--pd-text-primary)] text-center whitespace-nowrap overflow-hidden text-ellipsis w-full"
					>
						{{ listing.unit_id }}
					</div>
				</div>
			</div>
		</div>

		<!-- Load more button if needed -->
		<div
			v-if="hasMoreListings"
			class="p-3 flex justify-center border-t border-[var(--pd-border-light)]"
		>
			<button
				class="bg-transparent border-none text-[var(--pd-text-secondary)] text-sm px-3 py-2 flex items-center gap-2 cursor-pointer rounded-md transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
				@click="loadMoreListings"
				:disabled="loadingMore"
			>
				<span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
				<i v-if="!loadingMore" class="pi pi-chevron-down"></i>
				<i v-else class="pi pi-spin pi-spinner"></i>
			</button>
		</div>

		<!-- Create Listing Dialog -->
		<CreateDialog
			v-model:visible="showCreateDialog"
			title="Add New Listing"
			:fields="listingFields"
			submitButtonLabel="Add Listing"
			@submit="createListing"
		/>
	</div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useListingStore } from '@/stores/listing'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'

// Get project ID from route
const route = useRoute()
const projectId = computed(() => route.params.id)

// Event bus for communication between components
const emitter = inject('emitter')

// Store access
const listingStore = useListingStore()

// Component state
const selectedBuilding = ref(null)
const selectedListing = ref(null)
const showCreateDialog = ref(false)
const loadingMore = ref(false)
const infoPopover = ref(null)
const searchQuery = ref('')
const searchResults = ref([])

// Computed properties
const listings = computed(() => listingStore.listings)
const loading = computed(() => listingStore.isLoading)
const hasMoreListings = computed(() => listingStore.hasMoreListings)

// Filtered listings for current building
const filteredListings = computed(() => {
	if (!selectedBuilding.value) return []
	return listings.value.filter((listing) => listing.building === selectedBuilding.value.name)
})

// Displayed listings (either filtered by search or all listings for the building)
const displayedListings = computed(() => {
	if (searchQuery.value) return searchResults.value
	return filteredListings.value
})

// Listing fields for create dialog
const listingFields = computed(() => [
		{
		name: 'project',
		label: 'Project',
		type: 'link',
		doctype: 'PRP Project',
		default: projectId.value,
		disabled: true,
		fullWidth: false,
	},
{
		name: 'building',
		label: 'Building',
		type: 'link',
		doctype: 'PRP Building',
		validation: 'required',
		default: selectedBuilding.value?.name,
		disabled: true,
		fullWidth: false,
	},
	{
		name: 'unit_id',
		label: 'Unit ID',
		type: 'text',
		validation: 'required',
		fullWidth: false,
	},
	{
		name: 'availability',
		label: 'Availability',
		type: 'select',
		options: [
			{ label: 'Available', value: 'Available' },
			{ label: 'Sold', value: 'Sold' },
			{ label: 'Available for Secondhand', value: 'Available for Secondhand' },
		],
		default: 'Available',
		fullWidth: false,
	},
	{
		name: 'status',
		label: 'Handover Status',
		type: 'select',
		options: [
			{ label: 'Off-plan', value: 'Off-plan' },
			{ label: 'Due for Handover', value: 'Due for Handover' },
			{ label: 'Handover Completed', value: 'Handover Completed' },
		],
		default: 'Off-plan',
		fullWidth: false,
	},
])

// Watch for building selection events
onMounted(() => {
	emitter.on('building-selected', (building) => {
		selectedBuilding.value = building
		selectedListing.value = null
		searchQuery.value = ''
		searchResults.value = []
		fetchListingsForBuilding(building.name)
	})

	emitter.on('show-create-listing', ({ building }) => {
		selectedBuilding.value = building
		showCreateListing()
	})
})

// Fetch initial data
onMounted(async () => {
	await listingStore.fetchListings()
})

// Watch for selected listing changes and emit event
watch(selectedListing, (listing) => {
	if (listing) {
		emitter.emit('listing-selected', listing)
	}
})

// Toggle info popover
function toggleInfoPopover(event) {
	infoPopover.value.toggle(event)
}

// Fetch listings for a specific building
async function fetchListingsForBuilding(buildingName) {
	await listingStore.updateFilters({ building: buildingName })
}

// Filter listings based on search query
function filterListings() {
	if (!searchQuery.value.trim()) {
		searchResults.value = []
		return
	}

	const query = searchQuery.value.toLowerCase()
	searchResults.value = filteredListings.value.filter(
		(listing) =>
			listing.unit_id.toLowerCase().includes(query) ||
			(listing.availability && listing.availability.toLowerCase().includes(query)) ||
			(listing.status && listing.status.toLowerCase().includes(query)),
	)
}

// Clear search
function clearSearch() {
	searchQuery.value = ''
	searchResults.value = []
}

// Load more listings
async function loadMoreListings() {
	loadingMore.value = true
	try {
		await listingStore.loadMoreListings()
	} finally {
		loadingMore.value = false
	}
}

// Select a listing
function selectListing(listing) {
	selectedListing.value = listing
}

// Show dialog to create a new listing
function showCreateListing() {
	if (!selectedBuilding.value) return
	showCreateDialog.value = true
}

// Create new listing
async function createListing(data) {
	try {
		await listingStore.createListing(data)
	} catch (error) {
		console.error('Error creating listing:', error)
	}
}
</script>
