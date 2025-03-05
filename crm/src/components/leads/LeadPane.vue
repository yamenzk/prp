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
            @click="activeTab = '0'"
            rounded
            label="🤵"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '0'"
          />
          <Button
            @click="activeTab = '1'"
            rounded
            label="📞"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '1'"
          />
          <Button
            @click="activeTab = '2'"
            rounded
            label="⭐"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '2'"
          />
        </div>
      </div>
    </div>
    <ScrollPanel style="width: 100%; height: 85%">
      <Tabs v-model:value="activeTab">
        <TabPanels pt:root:class="!bg-white dark:!bg-zinc-800 !p-0">
          <TabPanel value="0" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <LeadInfoTab 
              :lead="currentLead" 
              @edit-field="openEditDialog"
            />
          </TabPanel>
          <TabPanel value="1">
            <PhonebookTab 
              :phonebook="currentLead.phonebook || []" 
              @update:phonebook="updatePhonebook"
            />
          </TabPanel>
          <TabPanel value="2">
            <PreferencesTab 
              :lead-id="currentLead.name"
              @preference-created="handlePreferenceCreated"
            />
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLeadStore, globalStore } from '@/stores'
import { getStatusConfig } from '@/utils/statusConfig'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import LeadInfoTab from '@/components/leads/tabs/LeadInfoTab.vue'
import PhonebookTab from '@/components/leads/tabs/PhonebookTab.vue'
import PreferencesTab from '@/components/leads/tabs/PreferencesTab.vue'

// Props
const props = defineProps({
  leadId: {
    type: String,
    default: null,
  },
})

// Store references
const leadStore = useLeadStore()
const activeTab = ref('0')

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

// Computed properties
const currentLead = computed(() => leadStore.currentLead)

// Emitted events
const emit = defineEmits(['lead-deleted']);

// Watch for changes in leadId prop
watch(
  () => props.leadId,
  async (newLeadId) => {
    if (newLeadId) {
      await leadStore.fetchLead(newLeadId)
      // Set default tab to info tab when loading a new lead
      activeTab.value = '0'
    } else {
      // Clear the current lead when no ID is provided
      leadStore.currentLead = null
    }
  },
  { immediate: true },
)

// Methods for Lead Management
const openEditDialog = (fieldName, currentValue, title, type) => {
  // If fieldName is an object, it's coming from the new component structure
  if (typeof fieldName === 'object' && fieldName !== null) {
    const field = fieldName
    editingField.value = field.fieldName
    editValue.value = field.currentValue
    dialogTitle.value = field.title
    editingFieldType.value = field.type || 'text'
    dialogOptions.value = field.options || []
    dialogValidation.value = field.validation || null
    dialogDoctype.value = field.doctype || ''
  } else {
    // Handle old way for backward compatibility
    editingField.value = fieldName
    editValue.value = currentValue
    dialogTitle.value = title
    editingFieldType.value = type || 'text'
    
    // Find the field definition in any of the field arrays
    const allFields = [...leadFields, ...personalFields, ...professionalFields]
    const fieldDef = allFields.find(field => field.name === fieldName) || {}
    
    // Set all properties from the field definition
    dialogOptions.value = fieldDef.options || []
    dialogValidation.value = fieldDef.validation || null
    dialogDoctype.value = fieldDef.doctype || ''
  }
  
  dialogVisible.value = true
}

const handleDialogSave = async ({ fieldName, value }) => {
  if (!currentLead.value || !fieldName) return

  try {
    const updateData = {
      [fieldName]: value,
    }

    await leadStore.updateLead(currentLead.value.name, updateData)
  } catch (error) {
    console.error('Error updating lead field:', error)
  }
}

const updatePhonebook = async (updatedPhonebook) => {
  if (!currentLead.value) return

  try {
    await leadStore.updatePhonebook(currentLead.value.name, updatedPhonebook)
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

const handlePreferenceCreated = () => {
  // Switch to preference tab if not already there
  activeTab.value = '2'
}
</script>