<template>
<Splitter class="h-full">
    <SplitterPanel class="flex"><LeadList @lead-selected="handleLeadSelected" :initialLeadId="leadIdFromRoute"></LeadList></SplitterPanel>
    <SplitterPanel class="flex bg-white dark:bg-zinc-800 "><LeadPane :leadId="selectedLeadId"></LeadPane></SplitterPanel>
</Splitter>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LeadList from '../components/leads/LeadList.vue'
import LeadPane from '../components/leads/LeadPane.vue'

// Router functionality
const route = useRoute()
const router = useRouter()

// Get lead ID from route if available
const leadIdFromRoute = computed(() => route.params.id || null)

// Selected lead state
const selectedLeadId = ref(leadIdFromRoute.value)

// Set initial lead ID from route when component mounts
onMounted(() => {
    if (leadIdFromRoute.value) {
        selectedLeadId.value = leadIdFromRoute.value
    }
})

// Watch for changes in the route parameter
watch(() => route.params.id, (newLeadId) => {
    if (newLeadId) {
        selectedLeadId.value = newLeadId
    }
})

// Handler for lead selection event
const handleLeadSelected = (leadId) => {
    selectedLeadId.value = leadId
    
    // Update the URL when a lead is selected
    router.push({
        name: 'LeadDetails',
        params: { id: leadId }
    })
}
</script>
<style scoped>
.p-splitter{
    border-color: transparent;
}
</style>