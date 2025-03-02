<template>
	<div class="leads-page">
		<ResizablePane>
			<template #left>
				<LeadList @lead-selected="handleLeadSelected" />
			</template>
			<template #right>
				<LeadPane :leadId="selectedLeadId" />
			</template>
		</ResizablePane>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import LeadList from '../components/leads/LeadList.vue'
import LeadPane from '../components/leads/LeadPane.vue'
import ResizablePane from '../components/common/ResizablePane.vue'

// Selected lead state
const selectedLeadId = ref(null)

// Handler for lead selection event
const handleLeadSelected = (leadId) => {
	selectedLeadId.value = leadId
}
</script>

<style scoped>
.leads-page {
	height: 100%;
	min-height: calc(100vh - 60px); /* Adjust based on your app's header size */
}
</style>
