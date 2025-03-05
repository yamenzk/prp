<template>
  <div v-if="!currentLead" class="m-auto">
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
    <ScrollPanel style="width: 100%; height: 85%">
      <Tabs v-model:value="value">
        <TabPanels pt:root:class="!bg-white dark:!bg-zinc-800 !p-0">
          <TabPanel value="0" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <div class="flex flex-col gap-4">
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
            </div>
          </TabPanel>
          <TabPanel value="1">
            <div class="p-4">
              <PhonebookTable 
                :phonebook="currentLead.phonebook || []"
                @update:phonebook="updatePhonebook"
              />
            </div>
          </TabPanel>
          <TabPanel value="2">
            <div class="h-[65px] border-b flex items-center px-4 py-3 justify-between">
              <h3 class="text-lg font-medium">Preferences</h3>
              <div class="flex gap-4">
                <Select 
                  v-model="selectedPreference" 
                  :options="leadPreferences" 
                  optionLabel="name" 
                  placeholder="Select a preference" 
                  class="w-48"
                >
                  <template #option="slotProps">
                    <div class="flex items-center">
                      <span class="mr-2">{{ slotProps.option.type || 'Unnamed' }}</span>
                      <small class="text-tertiary">{{ slotProps.option.name }}</small>
                    </div>
                  </template>
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ slotProps.value.type || 'Unnamed' }}
                    </div>
                    <span v-else>Select a preference</span>
                  </template>
                </Select>
                <Button type="button" icon="pi pi-plus" @click="openCreatePreferenceDialog()" />
              </div>
            </div>
            
            <div v-if="selectedPreference" class="p-4">
              <div class="flex flex-col gap-4">
                <EditableFieldset 
                  legend="Property Type"
                  :fields="propertyTypeFields"
                  :data="selectedPreference"
                  :columns="3"
                  customClass="mb-2"
                  @edit="openPreferenceEditDialog"
                />

                <EditableFieldset
                  legend="Property Size"
                  :fields="propertySizeFields"
                  :data="selectedPreference"
                  :columns="3"
                  customClass="mb-2"
                  @edit="openPreferenceEditDialog"
                />

                <EditableFieldset
                  legend="Community Features"
                  :fields="communityFeatureFields"
                  :data="selectedPreference"
                  :columns="4"
                  customClass="mb-2"
                  @edit="openPreferenceEditDialog"
                  @update="handleDirectUpdate"
                />
                
                <EditableFieldset
                  legend="Interior Features"
                  :fields="interiorFeatureFields"
                  :data="selectedPreference"
                  :columns="4"
                  customClass="mb-2"
                  @edit="openPreferenceEditDialog"
                  @update="handleDirectUpdate"
                />
                
                <EditableFieldset
                  legend="Views"
                  :fields="viewFields"
                  :data="selectedPreference"
                  :columns="3"
                  customClass="mb-2"
                  @edit="openPreferenceEditDialog"
                  @update="handleDirectUpdate"
                />
              </div>
              
              <div class="flex justify-end mt-4">
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  label="Delete Preference" 
                  @click="openDeletePreferenceDialog()"
                />
              </div>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center p-16">
              <FeatherIcon name="home" class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4" />
              <h3 class="text-xl font-medium text-tertiary mb-2">No Preference Selected</h3>
              <p class="text-tertiary max-w-sm text-center">
                Select an existing preference or create a new one to help match this lead with properties.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ScrollPanel>
  </div>

  <!-- Lead Edit Dialog -->
  <EditDialog
    v-model:visible="dialogVisible"
    :field-name="editingField"
    :field-type="editingFieldType"
    :value="editValue"
    :title="dialogTitle"
    :options="dialogOptions"
    :validation="dialogValidation"
    :doctype="dialogDoctype"
    @save="handleDialogSave"
  />

  <!-- Lead Delete Confirmation Dialog -->
  <DeleteDialog
    v-model:visible="deleteDialogVisible"
    title="Delete Lead"
    message="This action cannot be undone. To confirm deletion, please type the lead name below:"
    confirm-field="name"
    :confirm-value="currentLead?.name"
    delete-button-label="Delete Lead"
    @confirm="confirmDeleteLead"
  />
  
  <!-- Preference Create Dialog -->
  <CreateDialog
    v-model:visible="createPreferenceDialogVisible"
    title="Create New Preference"
    :fields="preferenceCreateFields"
    submit-button-label="Create Preference"
    @submit="createPreference"
  />
  
  <!-- Preference Edit Dialog -->
  <EditDialog
    v-model:visible="preferenceDialogVisible"
    :field-name="editingPreferenceField"
    :field-type="editingPreferenceFieldType"
    :value="editPreferenceValue"
    :title="preferenceDialogTitle"
    :options="preferenceDialogOptions"
    :validation="preferenceDialogValidation"
    :doctype="preferenceDialogDoctype"
    @save="handlePreferenceDialogSave"
  />
  
  <!-- Preference Delete Dialog -->
  <DeleteDialog
    v-model:visible="deletePreferenceDialogVisible"
    title="Delete Preference"
    message="Are you sure you want to delete this preference? This action cannot be undone."
    confirm-field="name"
    :confirm-value="selectedPreference?.name"
    delete-button-label="Delete Preference"
    @confirm="confirmDeletePreference"
  />

</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLeadStore, usePreferenceStore } from '../../stores'
import { getStatusConfig } from '../../utils/statusConfig'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import PhonebookTable from '@/components/leads/PhonebookTable.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

// Props
const props = defineProps({
  leadId: {
    type: String,
    default: null,
  },
})

// Field definitions with validations
const personalFields = [
  { 
    name: 'first_name', 
    label: 'First Name', 
    type: 'text',
    icon: 'pi pi-user',
    validation: { 
      maxLength: 50, 
      message: 'First name should be less than 50 characters' 
    }
  },
  { 
    name: 'last_name', 
    label: 'Last Name', 
    type: 'text',
    icon: 'pi pi-user',
    validation: { 
      maxLength: 50, 
      message: 'Last name should be less than 50 characters' 
    }
  },
]

// Professional fields with icons
const professionalFields = [
  { name: 'company', label: 'Company', type: 'text', icon: 'pi pi-building' },
  { name: 'position', label: 'Position', type: 'text', icon: 'pi pi-briefcase' },
  { 
    name: 'salary', 
    label: 'Salary', 
    type: 'currency',
    icon: 'pi pi-dollar',
    validation: {
      min: 0,
      message: 'Salary must be a positive amount'
    }
  }
]

// Lead fields with icons
const leadFields = [
  { 
    name: 'name', 
    label: 'ID', 
    type: 'text',
    icon: 'pi pi-id-card',
    validation: 'required',
    readonly: true
  },
  { 
    name: 'lead_source', 
    label: 'Lead Source', 
    type: 'link',
    icon: 'pi pi-filter',
    doctype: 'PRP Lead Source'
  },
  { 
    name: 'owner', 
    label: 'Owner', 
    type: 'link',
    icon: 'pi pi-user-edit',
    doctype: 'User',
    readonly: true
  },
]
// Preference field definitions for display
const propertyTypeFields = [
  { name: 'type', label: 'Property Type', type: 'select', icon: '🏢' },
  { name: 'territory', label: 'Territory', type: 'link', doctype: 'PRP Territory', icon: '📍' },
  { name: 'bedrooms', label: 'Bedrooms', type: 'select', icon: '🛏️' },
]

// Property Size fields with emojis
const propertySizeFields = [
  { name: 'min_sqft', label: 'Min SQFT', type: 'number', icon: '📏' },
  { name: 'max_sqft', label: 'Max SQFT', type: 'number', icon: '📐' },
  { name: 'bathrooms', label: 'Bathrooms', type: 'number', icon: '🚿' },
  { name: 'min_sqm', label: 'Min SQM', type: 'number', icon: '📏' },
  { name: 'max_sqm', label: 'Max SQM', type: 'number', icon: '📐' },
]

// Community Feature fields with emojis
const communityFeatureFields = [
  { name: 'gated_community', label: 'Gated', type: 'boolean', icon: '🔒' },
  { name: 'pet_friendly', label: 'Pet Friendly', type: 'boolean', icon: '🐾' },
  { name: 'walkable', label: 'Walkable', type: 'boolean', icon: '🚶' },
  { name: 'gym', label: 'Gym', type: 'boolean', icon: '🏋️' },
  { name: 'pool', label: 'Pool', type: 'boolean', icon: '🏊' },
  { name: 'sauna', label: 'Sauna', type: 'boolean', icon: '♨️' },
  { name: 'park', label: 'Park', type: 'boolean', icon: '🌳' },
  { name: 'security', label: 'Security', type: 'boolean', icon: '👮' },
]

// Interior Feature fields with emojis
const interiorFeatureFields = [
  { name: 'smart_home', label: 'Smart Home', type: 'boolean', icon: '🏠' },
  { name: 'furnished', label: 'Furnished', type: 'boolean', icon: '🪑' },
  { name: 'balcony', label: 'Balcony', type: 'boolean', icon: '🏞️' },
  { name: 'walkin_closet', label: 'Walk-in Closet', type: 'boolean', icon: '👔' },
  { name: 'open_kitchen', label: 'Open Kitchen', type: 'boolean', icon: '🍳' },
  { name: 'kitchen_appliances', label: 'Kitchen Appliances', type: 'boolean', icon: '🍽️' },
  { name: 'central_ac', label: 'Central AC', type: 'boolean', icon: '❄️' },
  { name: 'chiller_free', label: 'Chiller Free', type: 'boolean', icon: '💰' },
  { name: 'service_provider', label: 'Chiller Provider', type: 'link', icon:'⚡', doctype:'PRP Service Provider'}
]

// View fields with emojis
const viewFields = [
  { name: 'city_view', label: 'City View', type: 'boolean', icon: '🏙️' },
  { name: 'sea_view', label: 'Sea View', type: 'boolean', icon: '🌊' },
  { name: 'garden_view', label: 'Garden View', type: 'boolean', icon: '🌸' },
]

// Preference fields for create dialog
const preferenceCreateFields = [
  { 
    name: 'type', 
    label: 'Property Type', 
    type: 'select',
    options: ['Flat', 'Townhouse', 'Villa', 'Penthouse'],
    validation: 'required'
  },
  { 
    name: 'territory', 
    label: 'Territory', 
    type: 'link', 
    doctype: 'PRP Territory' 
  },
  { 
    name: 'bedrooms', 
    label: 'Bedrooms', 
    type: 'select',
    options: ['Studio', '1-BR', '2-BR', '3-BR', '4-BR', '5-BR', '6-BR', '7-BR', '7+'],
  },
  { 
    name: 'min_sqft', 
    label: 'Min SQFT', 
    type: 'number',
    validation: {
      min: 0,
      message: 'Min SQFT must be a positive number'
    }
  },
  { 
    name: 'max_sqft', 
    label: 'Max SQFT', 
    type: 'number',
    validation: {
      min: 0,
      message: 'Max SQFT must be a positive number'
    }
  },
  { 
    name: 'bathrooms', 
    label: 'Bathrooms', 
    type: 'number',
    validation: {
      min: 0,
      message: 'Bathrooms must be a positive number'
    }
  },
]

// Store references
const leadStore = useLeadStore()
const preferenceStore = usePreferenceStore()
const value = ref('0')

// Lead dialog state
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const dialogOptions = ref([])
const dialogValidation = ref(null)
const dialogDoctype = ref('')

// Lead delete dialog state
const deleteDialogVisible = ref(false)

// Preference state
const preferences = ref([])
const selectedPreference = ref(null)
const createPreferenceDialogVisible = ref(false)

// Preference edit dialog state
const preferenceDialogVisible = ref(false)
const preferenceDialogTitle = ref('')
const editingPreferenceField = ref(null)
const editingPreferenceFieldType = ref('text')
const editPreferenceValue = ref(null)
const preferenceDialogOptions = ref([])
const preferenceDialogValidation = ref(null)
const preferenceDialogDoctype = ref('')

// Preference delete dialog state
const deletePreferenceDialogVisible = ref(false)

// Computed properties
const currentLead = computed(() => leadStore.currentLead)
const leadPreferences = computed(() => {
  return preferences.value.filter(pref => 
    pref.lead === currentLead.value?.name
  )
})

// Emitted events
const emit = defineEmits(['lead-deleted']);

// Watch for changes in leadId prop
watch(
  () => props.leadId,
  async (newLeadId) => {
    if (newLeadId) {
      await leadStore.fetchLead(newLeadId)
      // Set default tab to info tab when loading a new lead
      value.value = '0'
    } else {
      // Clear the current lead when no ID is provided
      leadStore.currentLead = null
    }
  },
  { immediate: true },
)

// Watch for changes in currentLead to load preferences
watch(
  () => currentLead.value,
  async (newLead) => {
    if (newLead) {
      await loadLeadPreferences()
    } else {
      preferences.value = []
      selectedPreference.value = null
    }
  }
)

// Methods for Lead Management
const openEditDialog = (fieldName, currentValue, title) => {
  // Find the field definition in any of the field arrays
  const allFields = [...leadFields, ...personalFields, ...professionalFields]
  const fieldDef = allFields.find(field => field.name === fieldName) || {}
  
  editingField.value = fieldName
  dialogTitle.value = title
  editingFieldType.value = fieldDef.type || 'text'
  
  // Set all properties from the field definition
  dialogOptions.value = fieldDef.options || []
  dialogValidation.value = fieldDef.validation || null
  dialogDoctype.value = fieldDef.doctype || ''
  
  editValue.value = currentValue || ''
  dialogVisible.value = true
}

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

const updatePhonebook = async (updatedPhonebook) => {
  if (!currentLead.value) return

  try {
    await leadStore.updatePhonebook(currentLead.value.name, updatedPhonebook)
    // Refresh the lead data
    await leadStore.fetchLead(currentLead.value.name)
  } catch (error) {
    console.error('Error updating phonebook:', error)
  }
}

const openDeleteDialog = () => {
  deleteDialogVisible.value = true
}

const confirmDeleteLead = async () => {
  if (!currentLead.value) return

  try {
    await leadStore.deleteLead(currentLead.value.name)
    deleteDialogVisible.value = false
    // Emit an event to notify parent that lead was deleted
    emit('lead-deleted')
  } catch (error) {
    console.error('Error deleting lead:', error)
  }
}

// Methods for Preference Management
const loadLeadPreferences = async () => {
  if (!currentLead.value) return
  
  try {
    // Fetch preferences for this lead
    await preferenceStore.updateFilters({ lead: currentLead.value.name })
    await preferenceStore.fetchPreferences()
    preferences.value = preferenceStore.preferences
    
    // Auto-select the most recent preference if available
    if (preferences.value.length > 0) {
      selectedPreference.value = preferences.value[0]
    }
  } catch (error) {
    console.error('Error loading preferences:', error)
  }
}

const openCreatePreferenceDialog = () => {
  createPreferenceDialogVisible.value = true
}

const createPreference = async (formData) => {
  try {
    // Add the lead reference to the preference
    formData.lead = currentLead.value.name
    
    const result = await preferenceStore.createPreference(formData)
    createPreferenceDialogVisible.value = false
    
    // Reload preferences and select the new one
    await loadLeadPreferences()
    selectedPreference.value = preferences.value.find(p => p.name === result.name)
    
    // Switch to preference tab if not already there
    value.value = '2'
  } catch (error) {
    console.error('Error creating preference:', error)
  }
}

const openPreferenceEditDialog = (fieldName, currentValue, title, fieldType) => {
  // Find the field definition in any of the preference field arrays
  const allFields = [
    ...propertyTypeFields, 
    ...propertySizeFields, 
    ...communityFeatureFields, 
    ...interiorFeatureFields, 
    ...viewFields
  ]
  const fieldDef = allFields.find(field => field.name === fieldName) || {}
  
  editingPreferenceField.value = fieldName
  preferenceDialogTitle.value = title
  editingPreferenceFieldType.value = fieldType || fieldDef.type || 'text'
  
  // Set all properties from the field definition
  preferenceDialogOptions.value = fieldDef.options || []
  preferenceDialogValidation.value = fieldDef.validation || null
  preferenceDialogDoctype.value = fieldDef.doctype || ''
  
  editPreferenceValue.value = currentValue
  preferenceDialogVisible.value = true
}

const handleDirectUpdate = async ({ fieldName, value }) => {
  if (!selectedPreference.value || !fieldName) return

  try {
    const updateData = {
      [fieldName]: value ? 1 : 0, // Convert boolean to 1/0 for database
    }

    await preferenceStore.updatePreference(selectedPreference.value.name, updateData)
    
    // Update the local state to reflect the change immediately
    selectedPreference.value = {
      ...selectedPreference.value,
      [fieldName]: value ? 1 : 0
    }
    
    // Optionally refresh data from server if needed
    // await loadLeadPreferences()
  } catch (error) {
    console.error(`Error toggling ${fieldName}:`, error)
  }
}

const handlePreferenceDialogSave = async ({ fieldName, value }) => {
  if (!selectedPreference.value || !fieldName) return

  try {
    const updateData = {
      [fieldName]: value,
    }

    await preferenceStore.updatePreference(selectedPreference.value.name, updateData)
    
    // Refresh the preference data
    await loadLeadPreferences()
    
    // Re-select the updated preference
    selectedPreference.value = preferences.value.find(p => p.name === selectedPreference.value.name)
  } catch (error) {
    console.error('Error updating preference field:', error)
  }
}

const openDeletePreferenceDialog = () => {
  deletePreferenceDialogVisible.value = true
}

const confirmDeletePreference = async () => {
  if (!selectedPreference.value) return

  try {
    await preferenceStore.deletePreference(selectedPreference.value.name)
    deletePreferenceDialogVisible.value = false
    
    // Reload preferences after deletion
    await loadLeadPreferences()
    
    // Select the first preference if available
    if (preferences.value.length > 0) {
      selectedPreference.value = preferences.value[0]
    } else {
      selectedPreference.value = null
    }
  } catch (error) {
    console.error('Error deleting preference:', error)
  }
}
</script>