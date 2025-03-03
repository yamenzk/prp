<template>
  <div class="lead-pane">
    <!-- Lead details section -->
    <div v-if="currentLead" class="lead-details">
      <!-- Header section (visible across all tabs) -->
      <div class="lead-header mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold">
              {{ currentLead.lead_name || `${currentLead.first_name || ''} ${currentLead.last_name || ''}` }}
            </h2>
            <div class="text-sm text-tertiary">
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
        
        <div class="mt-3 text-sm text-tertiary flex items-center flex-wrap gap-x-4 gap-y-1">
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

      <!-- Tabs with icons -->
      <TabView class="lead-tabs">
        <!-- Details Tab -->
        <TabPanel>
          <template #header>
            <div class="flex items-center gap-2 p-2">
              <FeatherIcon name="info" class="tab-icon" />
              <span class="hidden sm:inline">Details</span>
            </div>
          </template>
          
          <div class="tab-content">
            <!-- Lead details in cards -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Personal Information Card -->
              <Card>
                <template #title>
                  <div class="flex items-center gap-2">
                    <FeatherIcon name="user" class="card-icon" />
                    <span>Personal Information</span>
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <DetailField 
                      label="First Name" 
                      :value="currentLead.first_name"
                      @click="openEditDialog('first_name', currentLead.first_name, 'First Name')" 
                    />
                    <DetailField 
                      label="Last Name" 
                      :value="currentLead.last_name"
                      @click="openEditDialog('last_name', currentLead.last_name, 'Last Name')" 
                    />
                    <DetailField 
                      label="Position" 
                      :value="currentLead.position"
                      @click="openEditDialog('position', currentLead.position, 'Position')" 
                    />
                    <DetailField 
                      label="Salary" 
                      :value="currentLead.salary"
                      @click="openEditDialog('salary', currentLead.salary, 'Salary')" 
                    />
                  </div>
                </template>
              </Card>

              <!-- Company Information Card -->
              <Card>
                <template #title>
                  <div class="flex items-center gap-2">
                    <FeatherIcon name="briefcase" class="card-icon" />
                    <span>Company Information</span>
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <DetailField 
                      label="Company" 
                      :value="currentLead.company"
                      @click="openEditDialog('company', currentLead.company, 'Company')" 
                    />
                  </div>
                </template>
              </Card>

              <!-- Lead Management Card -->
              <Card>
                <template #title>
                  <div class="flex items-center gap-2">
                    <FeatherIcon name="settings" class="card-icon" />
                    <span>Lead Management</span>
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <DetailField 
                      label="Lead Owner" 
                      :value="currentLead.lead_owner"
                      @click="openEditDialog('lead_owner', currentLead.lead_owner, 'Lead Owner', 'User')" 
                    />
                    <DetailField 
                      label="Lead Source" 
                      :value="currentLead.lead_source"
                      @click="openEditDialog('lead_source', currentLead.lead_source, 'Lead Source', 'PRP Lead Source')" 
                    />
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Contacts Tab -->
        <TabPanel>
          <template #header>
            <div class="flex items-center gap-2 p-2">
              <FeatherIcon name="phone" class="tab-icon" />
              <span class="hidden sm:inline">Contacts</span>
            </div>
          </template>
          
          <div class="tab-content">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Contact Information</h3>
              <Button 
                icon="plus" 
                class="p-button-sm" 
                @click="openAddPhonebookDialog"
                label="Add Contact"
              />
            </div>

            <div v-if="currentLead.phonebook && currentLead.phonebook.length" class="contact-grid">
              <ContactCard
                v-for="(contact, index) in currentLead.phonebook" 
                :key="index"
                :type="contact.type"
                :value="contact.value"
              >
                <template #actions>
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
                </template>
              </ContactCard>
            </div>

            <div v-else class="empty-state">
              <FeatherIcon name="phone-missed" class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
              <p class="text-tertiary">No contact information available</p>
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
        <TabPanel>
          <template #header>
            <div class="flex items-center gap-2 p-2">
              <FeatherIcon name="alert-triangle" class="tab-icon text-red-500" />
              <span class="hidden sm:inline">Danger Zone</span>
            </div>
          </template>
          
          <div class="tab-content">
            <Card class="danger-card">
              <template #title>
                <div class="text-red-600 dark:text-red-400 font-semibold">
                  Delete this lead
                </div>
              </template>
              <template #content>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1 mb-4">
                  Once you delete a lead, there is no going back. Please be certain.
                </p>
                
                <Button 
                  label="Delete this lead" 
                  severity="danger" 
                  icon="trash-2" 
                  @click="openDeleteDialog" 
                />
              </template>
            </Card>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty state when no lead is selected -->
    <div v-else class="flex flex-col items-center justify-center h-full text-center py-12">
      <FeatherIcon name="users" class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 class="text-xl font-medium text-tertiary mb-2">No Lead Selected</h3>
      <p class="text-tertiary max-w-sm">
        Select a lead from the list to view their details here
      </p>
    </div>

    <!-- Edit Dialog for regular fields -->
    <Dialog v-model:visible="dialogVisible" modal :header="dialogTitle" :style="{ width: '30rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-6">Update lead information</span>
      
      <!-- Status field (select) -->
      <div v-if="editingField === 'status'" class="mb-4">
        <label :for="editingField" class="block font-medium mb-2">{{ dialogTitle }}</label>
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
          <label :for="editingField" class="ml-2">{{ dialogTitle }}</label>
        </div>
      </div>
      
      <!-- Link field (dropdown) -->
      <div v-else-if="editingField && editingFieldType === 'link'" class="mb-4">
        <label :for="editingField" class="block font-medium mb-2">{{ dialogTitle }}</label>
        <Dropdown v-model="editValue" :options="linkOptions" optionLabel="label" 
                  optionValue="value" class="w-full" :filter="true" />
      </div>
      
      <!-- Regular input field -->
      <div v-else class="mb-4">
        <label :for="editingField" class="block font-medium mb-2">{{ dialogTitle }}</label>
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
        <label for="contact-type" class="block font-medium mb-2">Contact Type</label>
        <Dropdown v-model="phonebookEditData.type" id="contact-type" class="w-full" :options="contactTypeOptions" />
      </div>
      
      <div class="mb-4">
        <label for="contact-value" class="block font-medium mb-2">Contact Value</label>
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
          <label class="block font-medium mb-2">
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
import DetailField from '../common/DetailField.vue'
import ContactCard from '../common/ContactCard.vue'

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

// Helper function to fetch link options
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
  background-color: var(--app-background);
  color: var(--text-primary);
}

.lead-tabs {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
}

/* Text utility classes using CSS variables */
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.text-tertiary {
  color: var(--text-tertiary);
}

.status-tag {
  cursor: pointer;
  border: 2px solid var(--surface-border);
  background: transparent !important;
  --border-color: v-bind('statusConfig.currentTextColor');
  --text-color: v-bind('statusConfig.currentTextColor');
  border-color: var(--border-color);
  color: var (--text-color);
  transition: all 0.2s;
}

.status-tag:hover {
  opacity: 0.9;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.card-icon {
  width: 16px;
  height: 16px;
}

.tab-content {
  padding: 1rem 0.5rem;
  overflow-y: auto;
}

.card-content {
  padding: 0.5rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  border: 2px dashed var(--border-normal);
  border-radius: 0.5rem;
}

.danger-card {
  border-color: var(--red-500);
}

/* Ensure Card components respect CSS variables */
:deep(.p-card) {
  background: var(--card-background);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
}

:deep(.p-card-title) {
  color: var(--text-primary);
}

:deep(.p-card-content) {
  padding: 0.5rem;
}

/* TabView specific styling */
:deep(.p-tabview) {
  height: 100%;
}

:deep(.p-tabview-nav-container) {
  position: relative;
}

:deep(.p-tabview-panels) {
  overflow-y: auto;
  height: calc(100% - 50px);
}

:deep(.p-tabview-nav) {
  border-color: var(--border-normal) !important;
}

:deep(.p-tabview-selected) {
  font-weight: 600;
}

:deep(.p-tabview-nav-link) {
  color: var(--text-tertiary) !important;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
  color: var(--text-primary) !important;
  border-color: var(--primary-color) !important;
}
</style>
