<template>
        <DataTable v-model:filters="filters" :value="filteredLeads" paginator  :rows="10"  dataKey="name"
                filterDisplay="menu" scrollable scrollHeight="flex" :loading="isLoading" :globalFilterFields="['lead_name', 'lead_owner', 'status']">
            <template #header>
                <div class="flex justify-between">
                    <div class="flex gap-2">
                    <Button type="button" icon="pi pi-filter-slash" label="" outlined @click="resetFilters()" />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                    </div>
                    <Button type="button" icon="pi pi-plus" label="" @click="createNewLead()" />
                </div>
            </template>
            <template #empty> No leads found. </template>
            <template #loading> Loading leads data. Please wait. </template>
            <Column selectionMode="single" headerStyle="width: 3rem"></Column>
            <Column field="lead_name" header="Name" style="min-width: 12rem">
                <template #body="{ data }">
                    <a href="#" @click.prevent="selectLead(data)">{{ data.lead_name }}</a>
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template>
            </Column>
            
            <Column field="lead_owner" header="Owner" style="min-width: 12rem">
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
                    <Select v-model="filterModel.value" 
                            :options="statusOptions" 
                            optionLabel="label" 
                            optionValue="value" 
                            placeholder="Select Status" 
                            class="w-full"
                            showClear>
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
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import { useLeadStore } from '../../stores'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { getStatusConfig, LEAD_STATUSES } from '../../utils/statusConfig'

// Initialize the lead store
const leadStore = useLeadStore()

// Selected lead tracking
const selectedLeadId = ref(null)

// Define emitted events
const emit = defineEmits(['lead-selected'])

// Computed properties
const leads = computed(() => leadStore.leads || [])
const filteredLeads = computed(() => leads.value.filter((lead) => lead.is_deal !== 1))
const isLoading = computed(() => leadStore.isLoading)
const hasError = computed(() => leadStore.hasError)
const errorMessage = computed(() => leadStore.errorMessage)
const hasMoreLeads = computed(() => leadStore.hasMoreLeads)

// Convert status array to options format for Select component
const statusOptions = computed(() => 
    LEAD_STATUSES.map(status => ({ label: status, value: status }))
)

// Filter setup
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lead_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    lead_owner: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
})

// Actions
onMounted(() => {
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
    selectedLeadId.value = lead.name
    emit('lead-selected', lead.name)
}

const createNewLead = () => {
    console.log('Create new lead')
}
</script>

<style scoped>
.p-datatable{
    width: 100%
}

</style>
