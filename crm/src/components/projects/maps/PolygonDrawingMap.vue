<!-- components/projects/maps/PolygonDrawingMap.vue -->
<template>
  <div class="map-container">
    <div id="polygon-drawing-map" class="map"></div>
    <div v-if="loading" class="map-loading">
      <ProgressSpinner />
    </div>
    <div v-if="drawingError" class="drawing-error">
      {{ drawingError }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const props = defineProps({
  drawnGeometry: {
    type: Object,
    default: null
  },
  boundaryGeometry: {
    type: Object,
    default: null
  },
  restrictToParent: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['update:drawnGeometry']);

const loading = ref(true);
const drawingError = ref('');
let map = null;
let drawnItems = null;
let boundaryLayer = null;
let drawControl = null;

// Initialize map
onMounted(() => {
  loading.value = true;
  
  try {
    // Initialize the map
    map = L.map('polygon-drawing-map').setView(
      [props.initialCenter.lat, props.initialCenter.lng], 
      props.initialZoom
    );
    
    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Initialize FeatureGroup to store editable layers
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Add boundary layer if provided
    if (props.boundaryGeometry) {
      addBoundaryLayer();
    }
    
    // Initialize draw control with only polygon option
    drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: false, // Removed rectangle option
        polygon: {
          allowIntersection: false,
          showArea: false,
          showLength: false,
          shapeOptions: {
            color: '#3388ff',
            weight: 3
          }
        }
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);
    
    // Handle draw events
    map.on(L.Draw.Event.CREATED, onDrawCreated);
    map.on(L.Draw.Event.EDITED, onDrawEdited);
    map.on(L.Draw.Event.DELETED, onDrawDeleted);
    
    // Initialize with existing geometry if available
    if (props.drawnGeometry) {
      addGeoJSONToMap(props.drawnGeometry);
    }
    
  } catch (error) {
    console.error('Error initializing map:', error);
    drawingError.value = 'Could not initialize map. Please refresh the page.';
  } finally {
    loading.value = false;
  }
});

// Watch for boundary geometry changes
watch(() => props.boundaryGeometry, (newGeometry) => {
  if (newGeometry && map) {
    addBoundaryLayer();
  }
});

// Watch for drawn geometry changes from parent
watch(() => props.drawnGeometry, (newGeometry) => {
  if (newGeometry && map && !areSameGeometries(newGeometry, getCurrentDrawnGeometry())) {
    addGeoJSONToMap(newGeometry);
  }
});

// Clean up
onUnmounted(() => {
  if (map) {
    // Clean up event listeners
    map.off(L.Draw.Event.CREATED, onDrawCreated);
    map.off(L.Draw.Event.EDITED, onDrawEdited);
    map.off(L.Draw.Event.DELETED, onDrawDeleted);
    
    // Remove map
    map.remove();
    map = null;
  }
});

// Add boundary layer
function addBoundaryLayer() {
  if (!map) return;
  
  if (boundaryLayer) {
    map.removeLayer(boundaryLayer);
  }
  
  boundaryLayer = L.geoJSON(props.boundaryGeometry, {
    style: {
      color: '#3388ff',
      weight: 3,
      opacity: 0.5,
      fillOpacity: 0.1
    }
  }).addTo(map);
  
  // Fit map to boundary
  if (boundaryLayer.getBounds().isValid()) {
    map.fitBounds(boundaryLayer.getBounds());
  }
}

// Handle draw created event
function onDrawCreated(event) {
  drawingError.value = '';
  const layer = event.layer;
  
  // Check if drawing is within boundary when restriction is enabled
  if (props.restrictToParent && boundaryLayer) {
    const isWithinBoundary = checkWithinBoundary(layer);
    
    if (!isWithinBoundary) {
      drawingError.value = 'Drawing must be entirely within the parent project boundaries';
      return;
    }
  }
  
  // Clear existing drawings
  drawnItems.clearLayers();
  
  // Add the new layer
  drawnItems.addLayer(layer);
  
  // Update geometry
  const geometry = layerToGeoJSON(layer);
  emit('update:drawnGeometry', geometry);
}

// Handle draw edited event
function onDrawEdited(event) {
  drawingError.value = '';
  const layers = event.layers;
  
  // Check if any edited layer is within boundary when restriction is enabled
  if (props.restrictToParent && boundaryLayer) {
    let isWithinBoundary = true;
    
    layers.eachLayer((layer) => {
      if (!checkWithinBoundary(layer)) {
        isWithinBoundary = false;
      }
    });
    
    if (!isWithinBoundary) {
      drawingError.value = 'Drawing must be entirely within the parent project boundaries';
      return;
    }
  }
  
  // Update geometry if we have only one layer
  if (drawnItems.getLayers().length === 1) {
    const geometry = layerToGeoJSON(drawnItems.getLayers()[0]);
    emit('update:drawnGeometry', geometry);
  }
}

// Handle draw deleted event
function onDrawDeleted() {
  drawingError.value = '';
  
  // Clear geometry
  emit('update:drawnGeometry', null);
}

// Check if layer is within boundary
function checkWithinBoundary(layer) {
  if (!boundaryLayer) return true;
  
  try {
    // Get GeoJSON for the layer
    const layerGeoJSON = layer.toGeoJSON();
    
    // Get GeoJSON for the boundary
    const boundaryGeoJSON = boundaryLayer.toGeoJSON();
    
    // Use Leaflet's containsLatLng to check if point is in polygon
    if (layerGeoJSON.geometry.type === 'Point') {
      const point = layerGeoJSON.geometry.coordinates;
      return isPointInPolygon(point, boundaryGeoJSON);
    }
    
    // For polygons, check if all points are within the boundary
    if (layerGeoJSON.geometry.type === 'Polygon') {
      const coords = layerGeoJSON.geometry.coordinates[0];
      return coords.every(point => isPointInPolygon(point, boundaryGeoJSON));
    }
    
    return false;
  } catch (error) {
    console.error('Error checking boundary containment:', error);
    return false;
  }
}

// Simple point in polygon check
function isPointInPolygon(point, polygon) {
  if (!polygon) return true;
  
  if (polygon.type === 'FeatureCollection') {
    return polygon.features.some(feature => 
      isPointInPolygon(point, feature.geometry)
    );
  }
  
  if (polygon.type === 'Feature') {
    return isPointInPolygon(point, polygon.geometry);
  }
  
  if (polygon.type === 'Polygon') {
    const lng = point[0];
    const lat = point[1];
    const coords = polygon.coordinates[0];
    
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0], yi = coords[i][1];
      const xj = coords[j][0], yj = coords[j][1];
      
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }
  
  return false;
}

// Convert layer to GeoJSON
function layerToGeoJSON(layer) {
  if (!layer) return null;
  return layer.toGeoJSON().geometry;
}

// Get current drawn geometry
function getCurrentDrawnGeometry() {
  if (!drawnItems || drawnItems.getLayers().length === 0) return null;
  
  return layerToGeoJSON(drawnItems.getLayers()[0]);
}

// Add GeoJSON to map
function addGeoJSONToMap(geoJSON) {
  if (!map || !geoJSON) return;
  
  // Clear existing layers
  drawnItems.clearLayers();
  
  // Add new layer
  const layer = L.geoJSON(geoJSON);
  
  // Add each layer to drawn items
  layer.eachLayer(l => {
    drawnItems.addLayer(l);
  });
  
  // Fit map to drawn items
  if (drawnItems.getBounds().isValid()) {
    map.fitBounds(drawnItems.getBounds());
  }
}

// Simple check if two geometries are the same
function areSameGeometries(geom1, geom2) {
  if (!geom1 || !geom2) return geom1 === geom2;
  
  return JSON.stringify(geom1) === JSON.stringify(geom2);
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

.drawing-error {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 4px;
  z-index: 1000;
}
</style>