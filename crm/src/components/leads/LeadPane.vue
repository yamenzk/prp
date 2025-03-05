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
      <Tabs v-model:value="value" >
        <TabPanels pt:root:class="!bg-white dark:!bg-zinc-800">
          <TabPanel value="0" pt:root:class="!bg-white dark:!bg-zinc-800">
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
    :validation="dialogValidation"
    :doctype="dialogDoctype"
    @save="handleDialogSave"
  />

  <!-- Delete Confirmation Dialog -->
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
import { useLeadStore } from '../../stores'
import { LEAD_STATUSES, getStatusConfig } from '../../utils/statusConfig'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
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
    validation: { 
      maxLength: 50, 
      message: 'First name should be less than 50 characters' 
    }
  },
  { 
    name: 'last_name', 
    label: 'Last Name', 
    type: 'text',
    validation: { 
      maxLength: 50, 
      message: 'Last name should be less than 50 characters' 
    }
  },
]

const professionalFields = [
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'position', label: 'Position', type: 'text' },
  { 
    name: 'salary', 
    label: 'Salary', 
    type: 'currency',
    validation: {
      min: 0,
      message: 'Salary must be a positive amount'
    }
  }
]

const leadFields = [
  { 
    name: 'name', 
    label: 'ID', 
    type: 'text',
    validation: 'required',
    readonly: true
  },
  { 
    name: 'lead_source', 
    label: 'Lead Source', 
    type: 'link', 
    doctype: 'PRP Lead Source'
  },
  { 
    name: 'owner', 
    label: 'Owner', 
    type: 'link', 
    doctype: 'User',
    readonly: true
  },
  // { 
  //   name: 'status', 
  //   label: 'Status', 
  //   type: 'status',
  //   options: LEAD_STATUSES
  // }
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
const dialogValidation = ref(null)
const dialogDoctype = ref('')

// Delete confirmation dialog state
const deleteDialogVisible = ref(false)


// Computed
const currentLead = computed(() => leadStore.currentLead)
const emit = defineEmits(['lead-deleted']);
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

// Methods
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

// Method to update phonebook from the PhonebookTable component
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

// Delete lead methods
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

</script>
