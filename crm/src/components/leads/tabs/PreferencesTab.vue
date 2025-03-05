<template>
  <div>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePreferenceStore, globalStore } from '@/stores'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

// Props
const props = defineProps({
  leadId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['preference-created'])

// Store references
const preferenceStore = usePreferenceStore()

// Preference state
const preferences = ref([])
const selectedPreference = ref(null)
const selectedPreferenceId = ref(null)
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
const leadPreferences = computed(() => {
  return preferences.value.filter(pref => 
    pref.lead === props.leadId
  )
})

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

// Initialize and watch for store updates
onMounted(() => {
  loadLeadPreferences()
  
  // Set up socket listener for realtime preference updates
  const global = globalStore()
  if (global.socket) {
    global.socket.on('prp:refetch_resource', (data) => {
      if (data.cache_key === 'prp:prp_preference') {
        // console.log('🔄 Preference data changed, refreshing preferences')
        loadLeadPreferences()
        
        // Update selected preference if it was the one that changed
        if (selectedPreferenceId.value && data.event === 'doc_update' && data.doc === selectedPreferenceId.value) {
          updateSelectedPreference()
        }
      }
    })
  }
})

// Watch for changes in preferences store to update the selected preference
watch(() => preferenceStore.preferences, () => {
  updateSelectedPreference()
}, { deep: true })

// Update selected preference from the store when it changes
function updateSelectedPreference() {
  if (selectedPreferenceId.value) {
    const updatedPref = preferenceStore.preferences.find(p => p.name === selectedPreferenceId.value)
    if (updatedPref) {
      // console.log('🔄 Updating selected preference with latest data')
      selectedPreference.value = updatedPref
    }
  }
}

// Watch for changes in selectedPreference to track the ID
watch(selectedPreference, (newValue) => {
  selectedPreferenceId.value = newValue?.name || null
})

// Methods for Preference Management
const loadLeadPreferences = async () => {
  if (!props.leadId) return
  
  try {
    // Fetch preferences for this lead
    await preferenceStore.updateFilters({ lead: props.leadId })
    await preferenceStore.fetchPreferences()
    preferences.value = preferenceStore.preferences
    
    // Auto-select the most recent preference if available
    if (preferences.value.length > 0 && !selectedPreference.value) {
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
    formData.lead = props.leadId
    
    const result = await preferenceStore.createPreference(formData)
    createPreferenceDialogVisible.value = false
    
    // Reload preferences and select the new one
    await loadLeadPreferences()
    selectedPreference.value = preferences.value.find(p => p.name === result.name)
    
    // Notify parent component that preference was created
    emit('preference-created')
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
    // console.log(`✅ Updated ${fieldName} successfully, waiting for server refresh`)
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