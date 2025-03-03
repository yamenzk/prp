<template>
<Splitter class="h-full">
    <SplitterPanel class="flex"><LeadList></LeadList></SplitterPanel>
    <SplitterPanel class="flex items-center justify-center"> Panel 2 </SplitterPanel>
</Splitter>
</template>

<script setup>
import { ref } from 'vue'
import LeadList from '../components/leads/LeadList.vue'

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