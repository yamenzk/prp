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
          <TabPanel value="0" pt:root:class="!bg-white dark:!bg-zinc-800 !flex !flex-col !gap-4">
            <EditableFieldset
              legend="Lead"
              :fields="leadFields"
              :data="currentLead"
              :columns="3"
              customClass="mb-2"
              @edit="openEditDialog"
            />

            <EditableFieldset
              legend="Personal"
              :fields="personalFields"
              :data="currentLead"
              :columns="2"
              customClass="mb-2"
              @edit="openEditDialog"
            />
            
            <EditableFieldset
              legend="Professional" 
              :fields="professionalFields"
              :data="currentLead"
              :columns="3"
              customClass="mb-2"
              @edit="openEditDialog"
            />
          </TabPanel>
          <TabPanel value="1">
            <div class="p-4">
              <h3 class="text-lg font-medium mb-4">Contact Information</h3>
              <Button 
                label="Add Contact" 
                icon="pi pi-plus" 
                @click="openAddPhonebookDialog" 
                class="mb-4"
              />
              
              <div v-if="!currentLead.phonebook || currentLead.phonebook.length === 0" class="text-tertiary">
                No contact information available.
              </div>
              
              <div v-else class="grid grid-cols-1 gap-3">
                <div v-for="(contact, index) in currentLead.phonebook" :key="index" class="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div class="font-medium">{{ contact.type }}</div>
                    <div>{{ contact.value }}</div>
                  </div>
                  <div class="flex gap-2">
                    <Button icon="pi pi-pencil" text @click="openEditPhonebookDialog(contact, index)" />
                    <Button icon="pi pi-trash" text severity="danger" @click="deletePhonebookEntry(index)" />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="2">
            <div class="p-4">
              <h3 class="text-lg font-medium mb-4">Notes & Activities</h3>
              <!-- Notes and activities content will go here -->
              <p class="text-tertiary">This feature is coming soon.</p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ScrollPanel>
  </div>

  <!-- Using the reusable EditDialog component -->
  <EditDialog
    v-model:visible="dialogVisible"
    :field-name="editingField"
    :field-type="editingFieldType"
    :value="editValue"
    :title="dialogTitle"
    :options="dialogOptions"
    @save="handleDialogSave"
  />

  <!-- Phonebook Dialog -->
  <Dialog v-model:visible="phonebookDialogVisible" :header="phonebookDialogTitle" modal>
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="contactType" class="font-medium">Contact Type</label>
        <Dropdown 
          v-model="phonebookEditData.type" 
          :options="contactTypeOptions" 
          class="w-full mt-1" 
          placeholder="Select Type"
          id="contactType"
        />
      </div>
      <div class="field">
        <label for="contactValue" class="font-medium">Contact Value</label>
        <InputText v-model="phonebookEditData.value" id="contactValue" class="w-full mt-1" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" @click="phonebookDialogVisible = false" text />
      <Button label="Save" @click="savePhonebookEdit" />
    </template>
  </Dialog>

  <!-- Delete Confirmation Dialog -->
  <Dialog v-model:visible="deleteDialogVisible" header="Delete Lead" modal>
    <div class="p-fluid">
      <p class="mb-4">This action cannot be undone. To confirm deletion, please type the lead name below:</p>
      <p class="font-bold mb-2">{{ currentLead?.name }}</p>
      <InputText v-model="deleteConfirmText" class="w-full" placeholder="Type lead name to confirm" />
    </div>
    <template #footer>
      <Button label="Cancel" @click="deleteDialogVisible = false" text />
      <Button 
        label="Delete Lead" 
        severity="danger" 
        :disabled="deleteConfirmText !== currentLead?.name" 
        @click="confirmDeleteLead" 
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLeadStore } from '../../stores'
import { frappeRequest } from 'frappe-ui'
import { LEAD_STATUSES, getStatusConfig } from '../../utils/statusConfig'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import { 
  Panel, 
  Button, 
  Tag, 
  ScrollPanel, 
  Tabs, 
  TabPanel, 
  Dialog,
  InputText,
  Dropdown
} from 'primevue'

// Props
const props = defineProps({
  leadId: {
    type: String,
    default: null,
  },
})

// Field definitions
const personalFields = [
  { name: 'first_name', label: 'First Name', type: 'text' },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' }
]

const professionalFields = [
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'position', label: 'Position', type: 'text' },
  { name: 'salary', label: 'Salary', type: 'currency' }
]

const leadFields = [
  { name: 'name', label: 'ID', type: 'text' },
  { name: 'source', label: 'Lead Source', type: 'link' },
  { name: 'owner', label: 'Owner', type: 'link' },
  { name: 'status', label: 'Status', type: 'status' }
]

// Store
const leadStore = useLeadStore()
const value = ref('0')

// Dialog state
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const dialogOptions = ref([])

// Phonebook dialog state
const phonebookDialogVisible = ref(false)
const phonebookDialogTitle = ref('Add Contact Information')
const phonebookDialogMode = ref('add')
const phonebookEditIndex = ref(-1)
const phonebookEditData = ref({
  type: 'Mobile',
  value: '',
})

// Delete confirmation dialog state
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
const openEditDialog = async (fieldName, currentValue, title, fieldType = 'text') => {
  editingField.value = fieldName
  dialogTitle.value = title
  
  // Set the field type
  if (fieldName === 'is_deal') {
    editingFieldType.value = 'boolean'
  } else if (fieldName === 'status') {
    editingFieldType.value = 'status'
    dialogOptions.value = availableStatuses.value
  } else if (fieldType === 'link') {
    editingFieldType.value = 'link'
    
    // Determine which link type to fetch based on field name
    let doctype = 'User'
    if (fieldName === 'source') {
      doctype = 'PRP Lead Source'
    }
    
    // Fetch options for link field
    await fetchLinkOptions(doctype)
  } else {
    editingFieldType.value = fieldType || 'text'
  }
  
  editValue.value = currentValue || ''
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

    dialogOptions.value = response.data.map((item) => ({
      value: item.name,
      label: item.full_name || item.name,
    }))
  } catch (error) {
    console.error(`Error fetching options for ${doctype}:`, error)
    dialogOptions.value = []
  }
}

// Handle dialog save
const handleDialogSave = async ({ fieldName, value }) => {
  if (!currentLead.value || !fieldName) return

  try {
    const updateData = {
      [fieldName]: value,
    }

    await leadStore.updateLead(currentLead.value.name, updateData)
    
    // Refresh the lead data
    await leadStore.fetchLead(currentLead.value.name)
  } catch (error) {
    console.error('Error updating lead field:', error)
  }
}

// Phonebook methods
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

// Delete lead methods
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