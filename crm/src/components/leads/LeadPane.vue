<template>
  <div class="lead-pane">
    <!-- Lead details section -->
    <div v-if="currentLead" class="lead-details">
      <!-- Header section (visible across all tabs) -->
      <div class="lead-header mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ currentLead.lead_name || `${currentLead.first_name || ''} ${currentLead.last_name || ''}` }}
            </h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              ID: {{ currentLead.name }}
            </div>
          </div>
          
          <Tag class="status-tag" @click="openEditDialog('status', currentLead.status, 'Status', 'status')">
            <div class="flex items-center gap-2 px-1">
              <FeatherIcon :name="statusConfig.icon" class="status-icon" :style="{ color: statusConfig.currentTextColor }" />
              <span class="status-text">{{ currentLead.status || 'New' }}</span>
            </div>
          </Tag>
        </div>
        
        <div class="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-x-4 gap-y-1">
          <span v-if="currentLead.company" class="flex items-center gap-1">
            <FeatherIcon name="briefcase" class="w-3.5 h-3.5" />
            {{ currentLead.company }}
          </span>
          <span v-if="currentLead.position" class="flex items-center gap-1">
            <FeatherIcon name="user" class="w-3.5 h-3.5" />
            {{ currentLead.position }}
          </span>
          <span v-if="currentLead.lead_owner" class="flex items-center gap-1">
            <FeatherIcon name="user-check" class="w-3.5 h-3.5" />
            {{ currentLead.lead_owner }}
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <TabView>
        <!-- Details Tab -->
        <TabPanel header="Details">
          <div class="tab-content">
            <!-- Lead details in cards -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Personal Information Card -->
              <div class="detail-card">
                <div class="card-header">
                  <h3 class="card-title">Personal Information</h3>
                </div>

                <div class="card-content">
                  <div class="detail-item" @click="openEditDialog('first_name', currentLead.first_name, 'First Name')">
                    <div class="detail-label">First Name</div>
                    <div class="detail-value">{{ currentLead.first_name || '-' }}</div>
                  </div>
                  <div class="detail-item" @click="openEditDialog('last_name', currentLead.last_name, 'Last Name')">
                    <div class="detail-label">Last Name</div>
                    <div class="detail-value">{{ currentLead.last_name || '-' }}</div>
                  </div>
                  <div class="detail-item" @click="openEditDialog('position', currentLead.position, 'Position')">
                    <div class="detail-label">Position</div>
                    <div class="detail-value">{{ currentLead.position || '-' }}</div>
                  </div>
                  <div class="detail-item" @click="openEditDialog('salary', currentLead.salary, 'Salary')">
                    <div class="detail-label">Salary</div>
                    <div class="detail-value">{{ currentLead.salary || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Company Information Card -->
              <div class="detail-card">
                <div class="card-header">
                  <h3 class="card-title">Company Information</h3>
                </div>

                <div class="card-content">
                  <div class="detail-item" @click="openEditDialog('company', currentLead.company, 'Company')">
                    <div class="detail-label">Company</div>
                    <div class="detail-value">{{ currentLead.company || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Lead Management Card -->
              <div class="detail-card">
                <div class="card-header">
                  <h3 class="card-title">Lead Management</h3>
                </div>

                <div class="card-content">
                  <div class="detail-item" @click="openEditDialog('lead_owner', currentLead.lead_owner, 'Lead Owner', 'User')">
                    <div class="detail-label">Lead Owner</div>
                    <div class="detail-value">{{ currentLead.lead_owner || '-' }}</div>
                  </div>
                  <div class="detail-item" @click="openEditDialog('lead_source', currentLead.lead_source, 'Lead Source', 'PRP Lead Source')">
                    <div class="detail-label">Lead Source</div>
                    <div class="detail-value">{{ currentLead.lead_source || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Contacts Tab -->
        <TabPanel header="Contact Information">
          <div class="tab-content">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold dark:text-white">Contacts</h3>
              <Button 
                icon="plus" 
                class="p-button-sm" 
                @click="openAddPhonebookDialog"
                label="Add Contact"
              />
            </div>

            <div v-if="currentLead.phonebook && currentLead.phonebook.length" class="space-y-3">
              <div 
                v-for="(contact, index) in currentLead.phonebook" 
                :key="index" 
                class="contact-card"
              >
                <div class="flex items-center">
                  <div class="contact-icon">
                    <FeatherIcon :name="getContactIcon(contact.type)" />
                  </div>
                  <div class="flex-grow">
                    <div class="font-medium text-gray-900 dark:text-white">{{ contact.value }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ contact.type }}</div>
                  </div>
                  <div class="flex gap-1">
                    <Button 
                      icon="edit-2" 
                      @click="openEditPhonebookDialog(contact, index)" 
                      class="p-button-text p-button-sm" 
                    />
                    <Button 
                      icon="trash-2" 
                      severity="danger" 
                      @click="deletePhonebookEntry(index)" 
                      class="p-button-text p-button-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div 
              v-else 
              class="empty-state"
            >
              <FeatherIcon name="phone-missed" class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No contact information available</p>
              <Button 
                label="Add Contact" 
                icon="plus" 
                @click="openAddPhonebookDialog" 
                class="mt-4"
              />
            </div>
          </div>
        </TabPanel>

        <!-- Danger Zone Tab -->
        <TabPanel header="Danger Zone">
          <div class="tab-content">
            <div class="danger-zone-container">
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
              
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 class="text-base font-medium text-red-700 dark:text-red-300">Delete this lead</h4>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1 mb-4">
                  Once you delete a lead, there is no going back. Please be certain.
                </p>
                
                <Button 
                  label="Delete this lead" 
                  severity="danger" 
                  icon="trash-2" 
                  @click="openDeleteDialog" 
                />
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty state when no lead is selected -->
    <div v-else class="flex flex-col items-center justify-center h-full text-center py-12">
      <FeatherIcon name="users" class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No Lead Selected</h3>
      <p class="text-gray-400 dark:text-gray-500 max-w-sm">
        Select a lead from the list to view their details here
      </p>
    </div>

    <!-- Edit Dialog for regular fields -->
    <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '30rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-6">Update lead information</span>
      
      <!-- Status field (select) -->
      <div v-if="editingField === 'status'" class="mb-4">
        <label :for="editingField" class="block font-medium mb-2 text-gray-700 dark:text-gray-300">{{ dialogTitle }}</label>
        <Dropdown 
          v-model="editValue" 
          :options="availableStatuses" 
          class="w-full" 
          placeholder="Select Status"
        />
      </div>
      
      <!-- Boolean field (checkbox) -->
      <div v-else-if="editingField && editingFieldType === 'boolean'" class="mb-4">
        <div class="flex items-center">
          <Checkbox v-model="editValue" :binary="true" :id="editingField" />
          <label :for="editingField" class="ml-2 text-gray-700 dark:text-gray-300">{{ dialogTitle }}</label>
        </div>
      </div>
      
      <!-- Link field (dropdown) -->
      <div v-else-if="editingField && editingFieldType === 'link'" class="mb-4">
        <label :for="editingField" class="block font-medium mb-2 text-gray-700 dark:text-gray-300">{{ dialogTitle }}</label>
        <Dropdown v-model="editValue" :options="linkOptions" optionLabel="label" 
                  optionValue="value" class="w-full" :filter="true" />
      </div>
      
      <!-- Regular input field -->
      <div v-else class="mb-4">
        <label :for="editingField" class="block font-medium mb-2 text-gray-700 dark:text-gray-300">{{ dialogTitle }}</label>
        <InputText v-model="editValue" :id="editingField" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="dialogVisible = false" />
        <Button label="Save" @click="saveFieldEdit" />
      </template>
    </Dialog>

    <!-- Add/Edit Phonebook Dialog -->
    <Dialog v-model:visible="phonebookDialogVisible" modal :header="phonebookDialogTitle" :style="{ width: '30rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-6">
        {{ phonebookDialogMode === 'add' ? 'Add new contact information' : 'Update contact information' }}
      </span>
      
      <div class="mb-4">
        <label for="contact-type" class="block font-medium mb-2 text-gray-700 dark:text-gray-300">Contact Type</label>
        <Dropdown v-model="phonebookEditData.type" id="contact-type" class="w-full" :options="contactTypeOptions" />
      </div>
      
      <div class="mb-4">
        <label for="contact-value" class="block font-medium mb-2 text-gray-700 dark:text-gray-300">Contact Value</label>
        <InputText v-model="phonebookEditData.value" id="contact-value" class="w-full" />
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="phonebookDialogVisible = false" />
        <Button label="Save" @click="savePhonebookEdit" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" modal header="Delete Lead" :style="{ width: '30rem' }">
      <div class="mb-6">
        <p class="text-red-600 dark:text-red-400 mb-4">
          This action cannot be undone. This will permanently delete the lead <strong>"{{ currentLead?.lead_name || 'this lead' }}"</strong>.
        </p>
        
        <div class="mb-4">
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Please type <strong>{{ currentLead?.name }}</strong> to confirm
          </label>
          <InputText v-model="deleteConfirmText" class="w-full" placeholder="Type lead ID to confirm" />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" text @click="deleteDialogVisible = false" />
        <Button 
          label="I understand, delete this lead" 
          severity="danger" 
          :disabled="deleteConfirmText !== currentLead?.name"
          @click="confirmDeleteLead" 
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLeadStore } from '../../stores'
import { frappeRequest } from 'frappe-ui'
import { LEAD_STATUSES, getStatusConfig } from '../../utils/statusConfig'

// Props
const props = defineProps({
  leadId: {
    type: String,
    default: null
  }
})

// Store
const leadStore = useLeadStore()

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
  value: ''
})

const deleteDialogVisible = ref(false)
const deleteConfirmText = ref('')

const contactTypeOptions = ['Mobile', 'Phone', 'Email', 'WhatsApp', 'Other']

// Dark mode detection
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark') || 
    document.body.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
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

// Get icon based on contact type
const getContactIcon = (type) => {
  switch (type) {
    case 'Mobile': return 'smartphone'
    case 'Phone': return 'phone'
    case 'Email': return 'mail'
    case 'WhatsApp': return 'message-circle'
    default: return 'link'
  }
}

// Watch for changes in leadId prop
watch(() => props.leadId, async (newLeadId) => {
  if (newLeadId) {
    await leadStore.fetchLead(newLeadId)
  } else {
    // Clear the current lead when no ID is provided
    leadStore.currentLead = null
  }
}, { immediate: true })

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

const fetchLinkOptions = async (doctype) => {
  try {
    const response = await frappeRequest({
      method: 'frappe.client.get_list',
      params: {
        doctype: doctype,
        fields: ['name', 'full_name']
      }
    })
    
    linkOptions.value = response.data.map(item => ({
      value: item.name,
      label: item.full_name || item.name
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
      [editingField.value]: editValue.value
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
    value: ''
  }
  phonebookEditIndex.value = -1
  phonebookDialogVisible.value = true
}

const openEditPhonebookDialog = (contact, index) => {
  phonebookDialogMode.value = 'edit'
  phonebookDialogTitle.value = 'Edit Contact Information'
  phonebookEditData.value = {
    type: contact.type,
    value: contact.value
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
        value: phonebookEditData.value.value
      })
    } else {
      // Update existing entry
      updatedPhonebook[phonebookEditIndex.value] = {
        type: phonebookEditData.value.type,
        value: phonebookEditData.value.value
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

<style scoped>
.lead-pane {
  height: 100%;
  padding: 1.5rem;
  overflow-y: auto;
  background-color: white;
  transition: background-color 0.2s ease;
}

.status-tag {
  cursor: pointer;
  border: 2px solid var(--surface-border);
  background: transparent !important;
  --border-color: v-bind('statusConfig.currentTextColor');
  --text-color: v-bind('statusConfig.currentTextColor');
  border-color: var(--border-color);
  color: var(--text-color);
  transition: all 0.2s;
}

.status-tag:hover {
  opacity: 0.9;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.detail-card {
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.card-content {
  padding: 0.5rem;
}

.detail-item {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.15s;
}

.detail-item:hover {
  background-color: #f9fafb;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
  color: #111827;
}

.tab-content {
  padding: 1rem 0.5rem;
  min-height: 350px;
}

.contact-card {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: white;
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.contact-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: #4b5563;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
}

.danger-zone-container {
  padding: 1rem;
}

/* Dark mode */
:deep(.dark) .lead-pane {
  background-color: #111827;
  color: #e5e7eb;
}

:deep(.dark) .detail-card,
:deep(.dark) .contact-card {
  background-color: #1f2937;
  border-color: #374151;
}

:deep(.dark) .card-header {
  background-color: #1f2937;
  border-color: #374151;
}

:deep(.dark) .card-title {
  color: #f3f4f6;
}

:deep(.dark) .detail-item:hover {
  background-color: #374151;
}

:deep(.dark) .detail-label {
  color: #9ca3af;
}

:deep(.dark) .detail-value {
  color: #f3f4f6;
}

:deep(.dark) .contact-icon {
  background-color: #374151;
  color: #d1d5db;
}

:deep(.dark) .empty-state {
  border-color: #374151;
}

/* PrimeVue TabView customizations */
:deep(.p-tabview-nav) {
  border-color: #e5e7eb !important;
}

:deep(.dark) .p-tabview-nav {
  border-color: #374151 !important;
}

:deep(.p-tabview-nav-link) {
  color: #4b5563 !important;
}

:deep(.dark) .p-tabview-nav-link {
  color: #9ca3af !important;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
  color: #111827 !important;
  border-color: #111827 !important;
}

:deep(.dark) .p-tabview-selected .p-tabview-nav-link {
  color: #f3f4f6 !important;
  border-color: #f3f4f6 !important;
}
</style>
