<template>
  <div v-if="!currentListing" class="m-auto">
    <Panel class="m-8" pt:root:class="!border-0 !bg-white dark:!bg-zinc-800">
      <div class="flex flex-col items-center justify-center h-full text-center py-12">
        <FeatherIcon
          name="home"
          class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4"
        />
        <h3 class="text-xl font-medium text-tertiary mb-2">No Listing Selected</h3>
        <p class="text-tertiary max-w-sm">
          Select a listing from the grid to view its details.
        </p>
      </div>
    </Panel>
  </div>
  <div v-else class="w-full">
    <div
      class="listing-header border-b border-gray-200 dark:border-zinc-700"
      style="padding: var(--p-datatable-header-padding)"
    >
      <div class="flex items-center justify-between p-4">
        <div>
          <h2 class="text-xl font-bold">
            {{ currentListing.project }} / {{ currentListing.building.substring(currentListing.project.length + 1) }} / {{ currentListing.unit_id }}
          </h2>
        </div>
        <div class="flex gap-1 items-center">
          <Tag
            :value="currentListing.availability || 'Available'"
            :severity="getAvailabilitySeverity(currentListing.availability)"
            :icon="getAvailabilityIcon(currentListing.availability)"
            class="mr-3"
          />
          <Button
            @click="activeTab = '0'"
            rounded
            icon="pi pi-info-circle"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '0'"
            v-tooltip.top="'Info'"
          />
          <Button
            @click="activeTab = '1'"
            rounded
            icon="pi pi-dollar"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '1'"
            v-tooltip.top="'Pricing'"
          />
          <Button
            @click="activeTab = '2'"
            rounded
            icon="pi pi-camera"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '2'"
            v-tooltip.top="'Media'"
          />
          <Button
            @click="activeTab = '3'"
            rounded
            icon="pi pi-history"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '3'"
            v-tooltip.top="'History'"
          />
          <Button
            @click="activeTab = '4'"
            rounded
            icon="pi pi-file"
            class="w-8 h-8 p-0"
            :outlined="activeTab !== '4'"
            v-tooltip.top="'Documents'"
          />
        </div>
      </div>
    </div>
    <ScrollPanel style="width: 100%; height: 85%">
      <Tabs v-model:value="activeTab">
        <TabPanels pt:root:class="!bg-white dark:!bg-zinc-800 !p-0">
          <TabPanel value="0" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <ListingInfoTab :listing="currentListing" @edit-field="openEditDialog" />
          </TabPanel>
          <TabPanel value="1" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <!-- <ListingPricingTab :listing="currentListing" @edit-field="openEditDialog" /> -->
          </TabPanel>
          <TabPanel value="2" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <!-- <ListingMediaTab :listing-id="currentListing.name" /> -->
          </TabPanel>
          <TabPanel value="3" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <!-- <VersionTab :doctype="'PRP Listing'" :docname="currentListing.name" /> -->
          </TabPanel>
          <TabPanel value="4" class="p-4" pt:root:class="!bg-white dark:!bg-zinc-800">
            <!-- <NotesTab :doctype="'PRP Listing'" :docname="currentListing.name" /> -->
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ScrollPanel>
  </div>

  <!-- Listing Edit Dialog -->
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

  <!-- Listing Delete Confirmation Dialog -->
  <DeleteDialog
    v-model:visible="deleteDialogVisible"
    title="Delete Listing"
    message="This action cannot be undone. To confirm deletion, please type the listing ID below:"
    confirm-field="unit_id"
    :confirm-value="currentListing?.unit_id"
    delete-button-label="Delete Listing"
    @confirm="confirmDeleteListing"
  />
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useListingStore } from '@/stores/listing'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import ListingInfoTab from './tabs/ListingInfoTab.vue'
// import ListingPricingTab from '@/components/listings/tabs/ListingPricingTab.vue'
// import ListingMediaTab from '@/components/listings/tabs/ListingMediaTab.vue'
// import VersionTab from '@/components/common/VersionTab.vue'
// import NotesTab from '@/components/common/NotesTab.vue'

// Store references
const listingStore = useListingStore()
const activeTab = ref('0')

// Emitter for component communication
const emitter = inject('emitter')

// Dialog state
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const dialogOptions = ref([])
const dialogValidation = ref(null)
const dialogDoctype = ref('')

// Delete dialog state
const deleteDialogVisible = ref(false)

// Computed properties
const currentListing = computed(() => listingStore.currentListing)

// Listen for listing selection
onMounted(() => {
  emitter.on('listing-selected', async (listing) => {
    await listingStore.fetchListing(listing.name)
    // Reset to Info tab when a new listing is selected
    activeTab.value = '0'
  })
})

// Methods for handling availability status
const getAvailabilitySeverity = (status) => {
  switch(status) {
    case 'Sold': return 'danger'
    case 'Available for Secondhand': return 'warning'
    default: return 'success' // 'Available' is default
  }
}

const getAvailabilityIcon = (status) => {
  return 'pi pi-tag'
}

// Methods for Listing Management
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
    const allFields = [...listingFields, ...pricingFields, ...attributeFields]
    const fieldDef = allFields.find((field) => field.name === fieldName) || {}

    // Set all properties from the field definition
    dialogOptions.value = fieldDef.options || []
    dialogValidation.value = fieldDef.validation || null
    dialogDoctype.value = fieldDef.doctype || ''
  }

  dialogVisible.value = true
}

const handleDialogSave = async ({ fieldName, value }) => {
  if (!currentListing.value || !fieldName) return

  try {
    const updateData = {
      [fieldName]: value,
    }

    await listingStore.updateListing(currentListing.value.name, updateData)
    await listingStore.refreshCurrentListing()  
} catch (error) {
    console.error('Error updating listing field:', error)
    await listingStore.refreshCurrentListing()
  }
}

const confirmDeleteListing = async () => {
  if (!currentListing.value) return

  try {
    await listingStore.deleteListing(currentListing.value.name)
    deleteDialogVisible.value = false
    emitter.emit('listing-deleted')
  } catch (error) {
    console.error('Error deleting listing:', error)
  }
}
</script>