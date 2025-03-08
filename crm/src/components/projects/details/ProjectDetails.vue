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
          Listing Tabs
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
import { onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import MapPanel from './panels/MapPanel.vue'
import BuildingPanel from './panels/BuildingPanel.vue'
import ListingPanel from './panels/ListingPanel.vue'
import mitt from 'mitt'

// Create event emitter for component communication
const emitter = mitt()
provide('emitter', emitter)

const route = useRoute()

onMounted(() => {
  // Get the project ID from the route params
  const projectId = route.params.id
  // You can fetch project details here using the ID
  console.log('Project ID:', projectId)
})
</script>

<style>
.pd-splitter-panel {
  padding: 0.75rem;
  overflow: hidden;
}
</style>