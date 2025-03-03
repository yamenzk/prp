<template>
	<div v-if="!currentLead">
		<Panel class="m-8" pt:root:class="!border-0 !bg-white dark:!bg-zinc-800">
			<div class="flex flex-col items-center justify-center h-full text-center py-12">
				<FeatherIcon
					name="users"
					class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4"
				/>
				<h3 class="text-xl font-medium text-tertiary mb-2">No Lead Selected</h3>
				<p class="text-tertiary max-w-sm">
					Select a lead from the list to view their details.
				</p>
			</div>
		</Panel>
	</div>
	<div v-else class="w-full">
		<div
			class="lead-header border-b border-gray-200 dark:border-zinc-700"
			style="padding: var(--p-datatable-header-padding)"
		>
			<div class="flex items-center justify-between h-[42px]">
				<div>
					<h2 class="text-xl font-bold">
						{{
							currentLead.lead_name ||
							`${currentLead.first_name || ''} ${currentLead.last_name || ''}`
						}}
					</h2>
					<!-- <div class="text-sm text-tertiary">
            {{ currentLead.name }}
          </div> -->
				</div>
				<Tag
					:value="currentLead.status"
					:severity="getStatusConfig(currentLead.status).severity"
					:icon="getStatusConfig(currentLead.status).icon"
				/>
				<div class="flex gap-2 justify-center">
					<Button
						@click="value = '0'"
						rounded
						label="🤵"
						class="w-8 h-8 p-0"
						:outlined="value !== '0'"
					/>
					<Button
						@click="value = '1'"
						rounded
						label="📞"
						class="w-8 h-8 p-0"
						:outlined="value !== '1'"
					/>
					<Button
						@click="value = '2'"
						rounded
						label="⭐"
						class="w-8 h-8 p-0"
						:outlined="value !== '2'"
					/>
				</div>
			</div>
		</div>
		<ScrollPanel style="width: 100%; height: 100%">
			<Tabs v-model:value="value" >
				<TabPanels pt:root:class="!bg-white dark:!bg-zinc-800">
					<TabPanel value="0" pt:root:class="!bg-white dark:!bg-zinc-800">
						<Fieldset legend="Personal Information" :toggleable="true" pt:root:class="!bg-white dark:!bg-zinc-800">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span class="text-sm">First Name</span>
                  <InputGroup class="flex items-center">
                      <InputText label="First Name" disabled :value="currentLead.first_name" />
                      <InputGroupAddon>
                          <Button icon="pi pi-user" severity="secondary" variant="text" />
                      </InputGroupAddon>
                  </InputGroup>
                </div>
                <div>
                  <span class="text-sm">First Name</span>
                  <InputGroup class="flex items-center">
                      <InputText label="First Name" disabled :value="currentLead.first_name" />
                      <InputGroupAddon>
                          <Button icon="pi pi-user" severity="secondary" variant="text" />
                      </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
						</Fieldset>
					</TabPanel>
					<TabPanel value="1">
						<p class="m-0"></p>
					</TabPanel>
					<TabPanel value="2">
						<p class="m-0"></p>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</ScrollPanel>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLeadStore } from '../../stores'
import { frappeRequest } from 'frappe-ui'
import { LEAD_STATUSES, getStatusConfig } from '../../utils/statusConfig'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import { ScrollPanel } from 'primevue'

// Props
const props = defineProps({
	leadId: {
		type: String,
		default: null,
	},
})

// Store
const leadStore = useLeadStore()
const value = ref('0')

// State
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const editingLink = ref(null)
const linkOptions = ref([])

const phonebookDialogVisible = ref(false)
const phonebookDialogTitle = ref('Add Contact Information')
const phonebookDialogMode = ref('add')
const phonebookEditIndex = ref(-1)
const phonebookEditData = ref({
	type: 'Mobile',
	value: '',
})

const deleteDialogVisible = ref(false)
const deleteConfirmText = ref('')

const contactTypeOptions = ['Mobile', 'Phone', 'Email', 'WhatsApp', 'Other']

// Dark mode detection
const isDarkMode = computed(() => {
	return (
		document.documentElement.classList.contains('dark') ||
		document.body.classList.contains('dark') ||
		window.matchMedia('(prefers-color-scheme: dark)').matches
	)
})

// Status configuration for the current lead
const statusConfig = computed(() => {
	return getStatusConfig(currentLead.value?.status || 'New', isDarkMode.value)
})

// Only show lead statuses (non-deal) for leads
const availableStatuses = computed(() => {
	return LEAD_STATUSES
})

// Computed
const currentLead = computed(() => leadStore.currentLead)

// Watch for changes in leadId prop
watch(
	() => props.leadId,
	async (newLeadId) => {
		if (newLeadId) {
			await leadStore.fetchLead(newLeadId)
		} else {
			// Clear the current lead when no ID is provided
			leadStore.currentLead = null
		}
	},
	{ immediate: true },
)

// Watch for lead changes to reset delete confirmation
watch(currentLead, () => {
	deleteConfirmText.value = ''
})

// Methods
const openEditDialog = async (fieldName, currentValue, title, fieldType = null) => {
	editingField.value = fieldName
	dialogTitle.value = title

	if (fieldName === 'is_deal') {
		editingFieldType.value = 'boolean'
		editValue.value = !!currentValue
	} else if (fieldName === 'status') {
		editingFieldType.value = 'status'
		editValue.value = currentValue || 'New'
	} else if (fieldType === 'User' || fieldType === 'PRP Lead Source') {
		editingFieldType.value = 'link'
		editingLink.value = fieldType
		editValue.value = currentValue || null

		// Fetch options for link field
		await fetchLinkOptions(fieldType)
	} else {
		editingFieldType.value = 'text'
		editValue.value = currentValue || ''
	}

	dialogVisible.value = true
}

// Helper function to fetch link options
const fetchLinkOptions = async (doctype) => {
	try {
		const response = await frappeRequest({
			method: 'frappe.client.get_list',
			params: {
				doctype: doctype,
				fields: ['name'],
			},
		})

		linkOptions.value = response.data.map((item) => ({
			value: item.name,
			label: item.full_name || item.name,
		}))
	} catch (error) {
		console.error(`Error fetching options for ${doctype}:`, error)
		linkOptions.value = []
	}
}

const saveFieldEdit = async () => {
	if (!currentLead.value || !editingField.value) return

	try {
		const updateData = {
			[editingField.value]: editValue.value,
		}

		await leadStore.updateLead(currentLead.value.name, updateData)
		dialogVisible.value = false

		// Refresh the lead data
		await leadStore.fetchLead(currentLead.value.name)
	} catch (error) {
		console.error('Error updating lead field:', error)
	}
}

const openAddPhonebookDialog = () => {
	phonebookDialogMode.value = 'add'
	phonebookDialogTitle.value = 'Add Contact Information'
	phonebookEditData.value = {
		type: 'Mobile',
		value: '',
	}
	phonebookEditIndex.value = -1
	phonebookDialogVisible.value = true
}

const openEditPhonebookDialog = (contact, index) => {
	phonebookDialogMode.value = 'edit'
	phonebookDialogTitle.value = 'Edit Contact Information'
	phonebookEditData.value = {
		type: contact.type,
		value: contact.value,
	}
	phonebookEditIndex.value = index
	phonebookDialogVisible.value = true
}

const savePhonebookEdit = async () => {
	if (!currentLead.value) return

	try {
		const updatedPhonebook = [...(currentLead.value.phonebook || [])]

		if (phonebookDialogMode.value === 'add') {
			// Add new entry
			updatedPhonebook.push({
				type: phonebookEditData.value.type,
				value: phonebookEditData.value.value,
			})
		} else {
			// Update existing entry
			updatedPhonebook[phonebookEditIndex.value] = {
				type: phonebookEditData.value.type,
				value: phonebookEditData.value.value,
			}
		}

		await leadStore.updatePhonebook(currentLead.value.name, updatedPhonebook)
		phonebookDialogVisible.value = false

		// Refresh the lead data
		await leadStore.fetchLead(currentLead.value.name)
	} catch (error) {
		console.error('Error updating phonebook:', error)
	}
}

const deletePhonebookEntry = async (index) => {
	if (!currentLead.value || !currentLead.value.phonebook) return

	if (confirm('Are you sure you want to delete this contact information?')) {
		try {
			const updatedPhonebook = [...currentLead.value.phonebook]
			updatedPhonebook.splice(index, 1)

			await leadStore.updatePhonebook(currentLead.value.name, updatedPhonebook)

			// Refresh the lead data
			await leadStore.fetchLead(currentLead.value.name)
		} catch (error) {
			console.error('Error deleting phonebook entry:', error)
		}
	}
}

const openDeleteDialog = () => {
	deleteDialogVisible.value = true
	deleteConfirmText.value = ''
}

const confirmDeleteLead = async () => {
	if (!currentLead.value || deleteConfirmText.value !== currentLead.value.name) return

	try {
		await leadStore.deleteLead(currentLead.value.name)
		deleteDialogVisible.value = false
	} catch (error) {
		console.error('Error deleting lead:', error)
	}
}
</script>

<style scoped></style>
