<!-- components/projects/maps/PointSelectionMap.vue -->
<template>
  <div class="map-container">
    <div :id="mapId" class="map"></div>
    <div v-if="loading" class="map-loading">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
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
  },
  mapId: {
    type: String,
    default: () => `point-map-${Math.random().toString(36).substr(2, 9)}`
  }
});

const emit = defineEmits(['update:selectedPoint']);

const loading = ref(true);
const isMapInitialized = ref(false);
let map = null;
let marker = null;

// Initialize map
onMounted(() => {
  setTimeout(() => {
    initializeMap();
  }, 100);
});

// Watch for selected point changes from parent
watch(() => props.selectedPoint, (newPoint) => {
  if (newPoint && map && isMapInitialized.value) {
    createMarker(newPoint);
  } else if (!newPoint && marker) {
    map.removeLayer(marker);
    marker = null;
  }
});

// Clean up
onUnmounted(() => {
  destroyMap();
});

function initializeMap() {
  if (isMapInitialized.value) return;
  
  loading.value = true;
  
  try {
    // Check if container exists
    const container = document.getElementById(props.mapId);
    if (!container) {
      console.error(`Map container with id ${props.mapId} not found`);
      return;
    }
    
    // Create map
    map = L.map(props.mapId).setView(
      [props.initialCenter.lat, props.initialCenter.lng], 
      props.initialZoom
    );
    
    // Add OSM tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);
    
    // Initialize with existing point if available
    if (props.selectedPoint) {
      createMarker(props.selectedPoint);
    }
    
    // Add click listener to map
    map.on('click', handleMapClick);
    
    isMapInitialized.value = true;
    
  } catch (error) {
    console.error('Error initializing map:', error);
  } finally {
    loading.value = false;
  }
}

function destroyMap() {
  if (!map) return;
  
  // Clean up event listeners
  map.off('click', handleMapClick);
  
  // Remove map
  map.remove();
  map = null;
  isMapInitialized.value = false;
}

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
.map-container {
  position: relative;
  height: 380px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--pd-border-light);
  flex-grow: 1;
  z-index: 1; /* Ensure proper z-index */
}

.map {
  height: 100%;
  width: 100%;
  z-index: 1;
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