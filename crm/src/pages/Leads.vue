<template>
<Splitter class="h-full">
    <SplitterPanel class="flex"><LeadList @lead-selected="handleLeadSelected"></LeadList></SplitterPanel>
    <SplitterPanel class="flex bg-white dark:bg-zinc-800 "><LeadPane :leadId="selectedLeadId"></LeadPane></SplitterPanel>
</Splitter>
</template>

<script setup>
import { ref } from 'vue'
import LeadList from '../components/leads/LeadList.vue'
import LeadPane from '../components/leads/LeadPane.vue'

// Selected lead state
const selectedLeadId = ref(null)

// Handler for lead selection event
const handleLeadSelected = (leadId) => {
	selectedLeadId.value = leadId
}
</script>
<style scoped>
.p-splitter{
    border-color: transparent;
}
</style>