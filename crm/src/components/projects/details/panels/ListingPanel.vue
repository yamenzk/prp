<template>
  <div class="pd-panel">
    <div class="pd-panel-header">
      <h3 class="pd-panel-title">Listings</h3>
      <button 
        class="pd-button-icon" 
        @click="showCreateListing"
        :disabled="!selectedBuilding"
      >
        <i class="pi pi-plus"></i>
      </button>
    </div>

    <!-- No building selected state -->
    <div v-if="!selectedBuilding" class="pd-panel-content pd-empty-container">
      <div class="pd-empty-state">
        <i class="pi pi-list"></i>
        <p>Select a building to view listings</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="pd-panel-content pd-loading-container">
      <i class="pi pi-spin pi-spinner pd-spinner"></i>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredListings.length" class="pd-panel-content pd-empty-container">
      <div class="pd-empty-state">
        <i class="pi pi-home"></i>
        <p>No listings found for this building</p>
        <button class="pd-button-small" @click="showCreateListing">
          <i class="pi pi-plus"></i>
          <span>Add Listing</span>
        </button>
      </div>
    </div>

    <!-- Listing list -->
    <div v-else class="pd-panel-content pd-scrollable">
      <!-- Building info header -->
      <div class="pd-building-header">
        <div class="pd-building-avatar">
          <i class="pi pi-building"></i>
        </div>
        <div class="pd-building-details">
          <div class="pd-building-title">{{ selectedBuilding.building_name }}</div>
          <div class="pd-listings-count">{{ filteredListings.length }} listings</div>
        </div>
      </div>

      <!-- Listings -->
      <div 
        v-for="listing in filteredListings" 
        :key="listing.name" 
        class="pd-listing-item"
        :class="{ 'pd-selected': selectedListing && selectedListing.name === listing.name }"
        @click="selectListing(listing)"
      >
        <div class="pd-listing-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="pd-listing-info">
          <div class="pd-listing-name">{{ listing.unit_id }}</div>
          <div class="pd-listing-status">
            <span class="pd-tag" :class="getAvailabilityClass(listing.availability)">
              {{ listing.availability || 'Available' }}
            </span>
            <span class="pd-tag pd-tag-handover" :class="getStatusClass(listing.status)">
              {{ listing.status || 'Off-plan' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Load more button if needed -->
    <div v-if="hasMoreListings" class="pd-panel-footer">
      <button 
        class="pd-button-text" 
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
import { ref, computed, inject, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useListingStore } from '@/stores/listing';
import CreateDialog from '@/components/dialogs/CreateDialog.vue';

// Get project ID from route
const route = useRoute();
const projectId = computed(() => route.params.id);

// Event bus for communication between components
const emitter = inject('emitter');

// Store access
const listingStore = useListingStore();

// Component state
const selectedBuilding = ref(null);
const selectedListing = ref(null);
const showCreateDialog = ref(false);
const loadingMore = ref(false);

// Computed properties
const listings = computed(() => listingStore.listings);
const loading = computed(() => listingStore.isLoading);
const hasMoreListings = computed(() => listingStore.hasMoreListings);
const filteredListings = computed(() => {
  if (!selectedBuilding.value) return [];
  return listings.value.filter(listing => listing.building === selectedBuilding.value.name);
});

// Listing fields for create dialog
const listingFields = computed(() => [
  {
    name: 'building',
    label: 'Building',
    type: 'link',
    doctype: 'PRP Building',
    validation: 'required',
    default: selectedBuilding.value?.name,
    readonly: true,
    fullWidth: false
  },
  {
    name: 'unit_id',
    label: 'Unit ID',
    type: 'text',
    validation: 'required',
    fullWidth: false
  },
  {
    name: 'project',
    label: 'Project',
    type: 'link',
    doctype: 'PRP Project',
    default: projectId.value,
    readonly: true,
    fullWidth: false
  },
  {
    name: 'availability',
    label: 'Availability',
    type: 'select',
    options: [
      { label: 'Available', value: 'Available' },
      { label: 'Sold', value: 'Sold' },
      { label: 'Available for Secondhand', value: 'Available for Secondhand' }
    ],
    default: 'Available',
    fullWidth: false
  },
  {
    name: 'status',
    label: 'Handover Status',
    type: 'select',
    options: [
      { label: 'Off-plan', value: 'Off-plan' },
      { label: 'Due for Handover', value: 'Due for Handover' },
      { label: 'Handover Completed', value: 'Handover Completed' }
    ],
    default: 'Off-plan',
    fullWidth: false
  },
  {
    name: 'enable_secondhand_selling',
    label: 'Enable Secondhand Selling',
    type: 'boolean',
    default: false,
    fullWidth: false
  },
  {
    name: 'enable_secondhand_renting',
    label: 'Enable Secondhand Renting',
    type: 'boolean',
    default: false,
    fullWidth: false
  }
]);

// Watch for building selection events
onMounted(() => {
  emitter.on('building-selected', (building) => {
    selectedBuilding.value = building;
    selectedListing.value = null;
    fetchListingsForBuilding(building.name);
  });

  emitter.on('show-create-listing', ({ building }) => {
    selectedBuilding.value = building;
    showCreateListing();
  });
});

// Fetch initial data
onMounted(async () => {
  await listingStore.fetchListings();
});

// Watch for selected listing changes and emit event
watch(selectedListing, (listing) => {
  if (listing) {
    emitter.emit('listing-selected', listing);
  }
});

// Fetch listings for a specific building
async function fetchListingsForBuilding(buildingName) {
  await listingStore.updateFilters({ building: buildingName });
}

// Load more listings
async function loadMoreListings() {
  loadingMore.value = true;
  try {
    await listingStore.loadMoreListings();
  } finally {
    loadingMore.value = false;
  }
}

// Select a listing
function selectListing(listing) {
  selectedListing.value = listing;
}

// Show dialog to create a new listing
function showCreateListing() {
  if (!selectedBuilding.value) return;
  showCreateDialog.value = true;
}

// Create new listing
async function createListing(data) {
  try {
    await listingStore.createListing(data);
  } catch (error) {
    console.error('Error creating listing:', error);
  }
}

// Helper function to get status class
function getStatusClass(status) {
  if (!status) return 'pd-tag-info';
  
  switch(status) {
    case 'Off-plan':
      return 'pd-tag-info';
    case 'Due for Handover':
      return 'pd-tag-warning';
    case 'Handover Completed':
      return 'pd-tag-success';
    default:
      return 'pd-tag-info';
  }
}

// Helper function to get availability class
function getAvailabilityClass(availability) {
  if (!availability) return 'pd-tag-available';
  
  switch(availability) {
    case 'Available':
      return 'pd-tag-available';
    case 'Sold':
      return 'pd-tag-sold';
    case 'Available for Secondhand':
      return 'pd-tag-secondhand';
    default:
      return 'pd-tag-available';
  }
}
</script>

<style scoped>
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

.pd-building-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: var(--pd-bg-base);
  border-radius: 8px;
  border: 1px solid var(--pd-border-light);
}

.pd-building-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--pd-badge-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.875rem;
}

.pd-building-avatar i {
  font-size: 1.125rem;
  color: var(--pd-badge-text);
}

.pd-building-details {
  flex: 1;
}

.pd-building-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--pd-text-primary);
  margin-bottom: 0.125rem;
}

.pd-listings-count {
  font-size: 0.75rem;
  color: var(--pd-text-tertiary);
}

.pd-listing-item {
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

.pd-listing-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px var(--pd-shadow-color);
}

.pd-listing-item.pd-selected {
  background-color: var(--pd-bg-surface-hover);
  border-color: var(--pd-border-medium);
}

.pd-listing-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: var(--pd-badge-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.pd-listing-icon i {
  font-size: 0.875rem;
  color: var(--pd-badge-text);
}

.pd-listing-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pd-listing-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--pd-text-primary);
  margin-bottom: 0.25rem;
}

.pd-listing-status {
  display: flex;
  gap: 0.375rem;
}

.pd-tag {
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

/* Status tags */
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

/* Availability tags */
/* Availability tags */
.pd-tag-available {
  background-color: rgba(52, 199, 89, 0.2);
  color: rgb(52, 199, 89);
}

.pd-tag-sold {
  background-color: rgba(255, 69, 58, 0.2);
  color: rgb(255, 69, 58);
}

.pd-tag-secondhand {
  background-color: rgba(255, 149, 0, 0.2);
  color: rgb(255, 149, 0);
}

.pd-tag-handover {
  margin-left: 0.25rem;
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

.pd-button-icon:hover:not(:disabled) {
  background-color: var(--pd-bg-surface-hover);
  color: var(--pd-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--pd-shadow-color);
}

.pd-button-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.pd-button-text:hover:not(:disabled) {
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
</style>