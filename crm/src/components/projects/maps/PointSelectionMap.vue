<!-- components/projects/maps/PointSelectionMap.vue -->
<template>
  <div class="map-container">
    <div id="point-selection-map" class="map"></div>
    <div v-if="loading" class="map-loading">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  selectedPoint: {
    type: Object,
    default: null
  },
  initialZoom: {
    type: Number,
    default: 12
  },
  initialCenter: {
    type: Object,
    default: () => ({ lat: 25.276987, lng: 55.296249 }) // Default to Dubai
  }
});

const emit = defineEmits(['update:selectedPoint']);

const loading = ref(true);
let map = null;
let marker = null;
let L = null; // Leaflet instance

// Initialize map
onMounted(async () => {
  loading.value = true;
  
  try {
    // Import Leaflet dynamically to avoid SSR issues
    L = await import('leaflet');
    
    // Create map
    map = L.map('point-selection-map').setView(
      [props.initialCenter.lat, props.initialCenter.lng], 
      props.initialZoom
    );
    
    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Initialize with existing point if available
    if (props.selectedPoint) {
      createMarker(props.selectedPoint);
    }
    
    // Add click listener to map
    map.on('click', handleMapClick);
    
  } catch (error) {
    console.error('Error initializing map:', error);
  } finally {
    loading.value = false;
  }
});

// Watch for selected point changes from parent
watch(() => props.selectedPoint, (newPoint) => {
  if (newPoint && map) {
    createMarker(newPoint);
  } else if (!newPoint && marker) {
    map.removeLayer(marker);
    marker = null;
  }
});

// Clean up
onUnmounted(() => {
  if (map) {
    map.off('click', handleMapClick);
    map.remove();
    map = null;
  }
});

// Handle map click
function handleMapClick(e) {
  const point = {
    lat: e.latlng.lat,
    lng: e.latlng.lng
  };
  
  createMarker(point);
  emit('update:selectedPoint', point);
}

// Create or update marker
function createMarker(point) {
  if (marker) {
    map.removeLayer(marker);
  }
  
  marker = L.marker([point.lat, point.lng]).addTo(map);
  map.setView([point.lat, point.lng], map.getZoom());
}
</script>

<style scoped>
.map-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}
</style>