<template>
	<div class="lead-list-container">
		<!-- Loading indicator -->
		<div
			v-if="isLoading && !filteredLeads.length"
			class="flex justify-center items-center py-10"
		>
			<span class="text-lg font-medium">Loading leads...</span>
		</div>

		<!-- Error message -->
		<div
			v-else-if="hasError"
			class="bg-red-50 text-red-700 p-4 rounded mb-4 dark:bg-red-900/20 dark:text-red-400"
		>
			<p>{{ errorMessage || 'Error loading leads' }}</p>
			<Button @click="fetchLeads" class="mt-2">Retry</Button>
		</div>

		<!-- Lead list table -->
		<div v-else class="leads-table">
			<!-- Filters section -->
			<div class="mb-4 flex justify-between items-center">
				<h2 class="text-xl font-semibold dark:text-gray-100">Leads</h2>
				<div class="flex gap-2">
					<Button @click="resetFilters" class="p-button-text">Reset Filters</Button>
					<Button @click="createNewLead" severity="success">New Lead</Button>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table
					class="min-w-full bg-white border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
				>
					<thead class="bg-gray-50 dark:bg-gray-800">
						<tr>
							<th
								class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
							>
								Name
							</th>
							<th
								class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
							>
								Company
							</th>
							<th
								class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
							>
								Lead Owner
							</th>
							<th
								class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
							>
								Status
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						<tr
							v-for="lead in filteredLeads"
							:key="lead.name"
							class="hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700/50"
							:class="{
								'bg-blue-50 dark:bg-blue-900/20': selectedLeadId === lead.name,
							}"
							@click="selectLead(lead)"
						>
							<td class="px-4 py-2 whitespace-nowrap">
								<div class="font-medium text-gray-900 dark:text-gray-100">
									{{
										lead.lead_name ||
										`${lead.first_name || ''} ${lead.last_name || ''}`
									}}
								</div>
								<div
									v-if="lead.position"
									class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
								>
									{{ lead.position }}
								</div>
							</td>
							<td
								class="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300"
							>
								{{ lead.company || '-' }}
							</td>
							<td
								class="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300"
							>
								{{ lead.lead_owner || '-' }}
							</td>
							<td class="px-4 py-2 whitespace-nowrap">
								<StatusBadge :status="lead.status" :isDarkMode="isDarkMode" />
							</td>
						</tr>
						<!-- Empty state -->
						<tr v-if="!filteredLeads.length && !isLoading">
							<td
								colspan="4"
								class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
							>
								No leads found. Create your first lead!
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div v-if="hasMoreLeads" class="mt-4 flex justify-center">
				<Button @click="loadMoreLeads" :loading="isLoading" class="px-4 py-2">
					Load More
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useLeadStore } from '../../stores'
import StatusBadge from '../common/StatusBadge.vue'

// Initialize the lead store
const leadStore = useLeadStore()

// Selected lead tracking
const selectedLeadId = ref(null)

// Dark mode detection (can be improved based on your app's dark mode implementation)
const isDarkMode = computed(() => {
	return (
		document.documentElement.classList.contains('dark') ||
		document.body.classList.contains('dark') ||
		window.matchMedia('(prefers-color-scheme: dark)').matches
	)
})

// Define emitted events
const emit = defineEmits(['lead-selected'])

// Computed properties
const leads = computed(() => leadStore.leads || [])
const filteredLeads = computed(() => leads.value.filter((lead) => lead.is_deal !== 1))
const isLoading = computed(() => leadStore.isLoading)
const hasError = computed(() => leadStore.hasError)
const errorMessage = computed(() => leadStore.errorMessage)
const hasMoreLeads = computed(() => leadStore.hasMoreLeads)

// Actions
const fetchLeads = () => {
	leadStore.updateFilters({ is_deal: 0 }).then(() => {
		leadStore.fetchLeads()
	})
}

const loadMoreLeads = () => leadStore.loadMoreLeads()

const resetFilters = () => {
	leadStore.resetFilters().then(() => {
		leadStore.updateFilters({ is_deal: 0 })
	})
}

// Component methods
const selectLead = (lead) => {
	selectedLeadId.value = lead.name
	emit('lead-selected', lead.name)
}

const createNewLead = () => {
	// You can navigate to a lead creation page here
	console.log('Create new lead')
	// Example: router.push('/leads/new')
}

// Fetch leads when component mounts
onMounted(() => {
	// Initialize filter to only show non-deals
	leadStore.updateFilters({ is_deal: 0 }).then(() => {
		leadStore.fetchLeads()
	})
})
</script>

<style scoped>
.lead-list-container {
	padding: 1rem;
	height: 100%;
	overflow-y: auto;
}

.leads-table {
	border-radius: 0.5rem;
	overflow: hidden;
}

/* Dark mode styling for the container */
:deep(.dark) .lead-list-container {
	color: #e5e7eb;
	background-color: #1f2937;
}

:deep(.dark) .lead-list-container table {
	border-color: #374151;
}
</style>
