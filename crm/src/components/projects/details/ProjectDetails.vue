<template>
  <Splitter style="height: 100%">
    <SplitterPanel :size="20" :minSize="10">
      <Splitter layout="vertical">
        <SplitterPanel class="pd-splitter-panel" :size="40">
          <MapPanel></MapPanel>
        </SplitterPanel>
        <SplitterPanel class="pd-splitter-panel" :size="60">
          Project Tabs
        </SplitterPanel>
      </Splitter>
    </SplitterPanel>
    <SplitterPanel :size="80">
      <Splitter layout="vertical">
        <SplitterPanel class="pd-splitter-panel" :size="70">
          <ListingTabs></ListingTabs>
        </SplitterPanel>
        <SplitterPanel :size="30">
          <Splitter>
            <SplitterPanel class="pd-splitter-panel" :size="50">
              <BuildingPanel></BuildingPanel>
            </SplitterPanel>
            <SplitterPanel class="pd-splitter-panel" :size="50">
              <ListingPanel></ListingPanel>
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </SplitterPanel>
  </Splitter>
</template>

<script setup>
import { onMounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBuildingStore } from '@/stores/building'
import { useListingStore } from '@/stores/listing'
import MapPanel from './panels/MapPanel.vue'
import BuildingPanel from './panels/BuildingPanel.vue'
import ListingPanel from './panels/ListingPanel.vue'
import ListingTabs from './ListingTabs.vue'
import mitt from 'mitt'

// Create event emitter for component communication
const emitter = mitt()
provide('emitter', emitter)

// Router and route
const route = useRoute()
const router = useRouter()
const buildingStore = useBuildingStore()
const listingStore = useListingStore()

// Extract route params
const projectId = route.params.id
const buildingId = route.params.buildingId
const listingId = route.params.listingId

// Load data based on URL parameters
onMounted(async () => {
  // Always load project
  console.log('Project ID:', projectId)
  
  // If building ID is in URL, select that building
  if (buildingId) {
    console.log('Loading Building:', buildingId)
    await buildingStore.fetchBuilding(buildingId)
    emitter.emit('building-selected', buildingStore.currentBuilding)
  }
  
  // If listing ID is in URL, select that listing
  if (listingId) {
    console.log('Loading Listing:', listingId)
    await listingStore.fetchListing(listingId)
    emitter.emit('listing-selected', listingStore.currentListing)
  }
})

// Update URL when building is selected
emitter.on('building-selected', (building) => {
  // Only update URL if the building ID has changed
  if (building && building.name !== buildingId) {
    router.push({
      name: 'BuildingDetails',
      params: { id: projectId, buildingId: building.name }
    })
  }
})

// Update URL when listing is selected
emitter.on('listing-selected', (listing) => {
  // Only update URL if the listing ID has changed
  if (listing && listing.name !== listingId) {
    router.push({
      name: 'ListingDetails',
      params: { 
        id: projectId, 
        buildingId: listing.building,
        listingId: listing.name 
      }
    })
  }
})
</script>

<style>
.pd-splitter-panel {
  overflow: hidden;
}
</style>