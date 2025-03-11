<!-- components/listings/tabs/DocumentsTab.vue -->
<template>
  <div class="documents-tab">
    <DocumentViewer
      :relDoctype="'PRP Listing'"
      :relDocname="listingId"
      :relatedRooms="relatedRooms"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useListingStore } from '@/stores/listing';
import DocumentViewer from '@/components/common/DocumentViewer.vue';

// Use the store
const listingStore = useListingStore();

// Use computed properties instead of local state
const currentListing = computed(() => listingStore.currentListing);
const listingId = computed(() => currentListing.value?.name || '');

// Compute related rooms based on the currentListing
const relatedRooms = computed(() => {
  if (!currentListing.value) return [];
  
  const rooms = [];
  
  if (currentListing.value.building) {
    rooms.push({
      doctype: 'PRP Building',
      docname: currentListing.value.building
    });
  }
  
  if (currentListing.value.project) {
    rooms.push({
      doctype: 'PRP Project',
      docname: currentListing.value.project
    });
  }
  
  return rooms;
});
</script>

<style scoped>
.documents-tab {
  height: 100%;
  overflow: auto;
}
</style>