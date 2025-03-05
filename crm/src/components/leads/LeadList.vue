<template>
  <DataTable 
  v-model:filters="filters" 
  :value="filteredLeads" 
  dataKey="name"
  v-model:selection="selectedLead" 
  filterDisplay="menu" 
  scrollable 
  scrollHeight="flex" 
  :loading="isLoading" 
  :globalFilterFields="['lead_name', 'first_name', 'last_name', 'lead_owner', 'status']"
  selectionMode="single" 
  :metaKeySelection="metaKey" 
>
    <template #header>
      <div class="flex justify-between">
        <div class="flex gap-2">
          <Button type="button" icon="pi pi-filter-slash" outlined @click="resetFilters()" />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
        <Button type="button" icon="pi pi-plus" @click="openCreateDialog()" />
      </div>
    </template>
    
    <template #empty> No leads found. </template>
    <template #loading> Loading leads data. Please wait. </template>
        
    <Column field="lead_name" header="Name" style="min-width: 12rem">
      <template #body="{ data }">
        <a href="#" @click.prevent="selectLead(data)">{{ data.lead_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() }}</a>
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
      </template>
    </Column>
    
    <Column field="lead_owner" header="Owner" style="min-width: 12rem; ">
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" placeholder="Search by owner" />
      </template>
    </Column>
    
    <Column field="status" header="Status" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        <div class="flex items-center">
          <Tag :value="data.status" :severity="getStatusConfig(data.status).severity" :icon="getStatusConfig(data.status).icon" />
        </div>
      </template>
      <template #filter="{ filterModel }">
        <Select 
          v-model="filterModel.value" 
          :options="statusOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Select Status" 
          class="w-full"
          showClear
        >
          <template #option="slotProps">
            <div class="flex items-center">
              <span class="status-indicator" :style="{ backgroundColor: getStatusConfig(slotProps.option.value).color }"></span>
              <span>{{ slotProps.option.label }}</span>
            </div>
          </template>
        </Select>
      </template>
    </Column>
  </DataTable>
  
  <div v-if="hasMoreLeads" class="flex justify-center mt-4">
    <Button type="button" label="Load More" @click="loadMoreLeads()" :loading="isLoading" />
  </div>
  
  <CreateDialog
    v-model:visible="createDialogVisible"
    title="Create New Lead"
    :fields="createLeadFields"
    submit-button-label="Create Lead"
    @submit="createLead"
  />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import { useLeadStore } from '../../stores'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { getStatusConfig, LEAD_STATUSES } from '../../utils/statusConfig'

// Initialize the lead store
const leadStore = useLeadStore()

// Selected lead tracking
const selectedLeadId = ref(null)
const selectedLead = ref(null)
const metaKey = ref(true);
// Create dialog state
const createDialogVisible = ref(false)

// Fields for create lead dialog
const createLeadFields = [
  { 
    name: 'first_name', 
    label: 'First Name', 
    type: 'text',
    icon: 'pi pi-user',
    validation: { 
      required: true,
      maxLength: 50, 
      message: 'First name should be less than 50 characters' 
    }
  },
  { 
    name: 'last_name', 
    label: 'Last Name', 
    type: 'text',
    validation: { 
      required: true,
      maxLength: 50, 
      message: 'Last name is required and should be less than 50 characters' 
    }
  },
  { 
    name: 'email', 
    label: 'Email', 
    type: 'text',
    validation: { 
      required: true,
      pattern: '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$', 
      message: 'Valid email is required' 
    }
  },
  { 
    name: 'phone', 
    label: 'Phone', 
    type: 'text',
    validation: {
      pattern: '^[0-9+\\s-()]{7,20}$',
      message: 'Please enter a valid phone number'
    }
  },
  { 
    name: 'company', 
    label: 'Company', 
    type: 'text',
    fullWidth: true
  },
  { 
    name: 'status', 
    label: 'Status', 
    type: 'status',
    options: LEAD_STATUSES,
    default: 'New'
  },
  { 
    name: 'source', 
    label: 'Lead Source', 
    type: 'link', 
    doctype: 'PRP Lead Source'
  }
]

// Define emitted events
const emit = defineEmits(['lead-selected', 'lead-created'])

// Computed properties that read directly from the store
const leads = computed(() => leadStore.leads || [])
const filteredLeads = computed(() => leads.value.filter((lead) => lead.is_deal !== 1))
const isLoading = computed(() => leadStore.isLoading)
const hasMoreLeads = computed(() => leadStore.hasMoreLeads)

// Convert status array to options format for Select component
const statusOptions = computed(() => 
  LEAD_STATUSES.map(status => ({ label: status, value: status }))
)

// Watch for changes in selectedLead and update selectedLeadId
watch(selectedLead, (newValue) => {
  if (newValue) {
    selectedLeadId.value = newValue.name
    emit('lead-selected', newValue.name)
  } else {
    selectedLeadId.value = null
  }
})

// Check if the selected lead still exists and is up to date
watch(() => leadStore.leads, (newLeads) => {
  if (selectedLeadId.value && newLeads) {
    const updatedLead = newLeads.find(lead => lead.name === selectedLeadId.value)
    
    if (updatedLead) {
      // Update the selected lead reference if it's changed
      if (JSON.stringify(selectedLead.value) !== JSON.stringify(updatedLead)) {
        // console.log('📝 Selected lead data has changed, updating reference')
        selectedLead.value = updatedLead
      }
    } else {
      // The lead was deleted or filtered out
      // console.log('🔍 Selected lead no longer exists in list, clearing selection')
      selectedLead.value = null
    }
  }
}, { deep: true })

// Filter setup
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  lead_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  lead_owner: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
})

// Initialize data
onMounted(() => {
  // Init lead list and fetch initial data
  fetchLeads()
})

const fetchLeads = () => {
  leadStore.updateFilters({ is_deal: 0 }).then(() => {
    leadStore.fetchLeads()
  })
}

const loadMoreLeads = () => leadStore.loadMoreLeads()

const resetFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lead_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    lead_owner: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
  }
  
  leadStore.resetFilters().then(() => {
    leadStore.updateFilters({ is_deal: 0 })
    leadStore.fetchLeads()
  })
}

// Component methods
const selectLead = (lead) => {
  selectedLead.value = lead
  selectedLeadId.value = lead.name
  emit('lead-selected', lead.name)
}

// Create lead methods
const openCreateDialog = () => {
  createDialogVisible.value = true
}

const createLead = async (formData) => {
  try {
    createDialogVisible.value = false
    const newLead = await leadStore.createLead(formData)
    // console.log('✅ Lead created successfully:', newLead)
    
    // Server will send realtime update that will trigger list refresh
    // Emit event to notify parent
    emit('lead-created', newLead)
  } catch (error) {
    console.error('❌ Error creating lead:', error)
  }
}
</script>

<style scoped>
.p-datatable {
  width: 100%;
}
</style>