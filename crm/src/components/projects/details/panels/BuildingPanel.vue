<template>
  <div class="flex flex-col h-full bg-[var(--pd-bg-surface)] overflow-hidden">
    <div class="flex justify-between items-center p-4 border-b border-[var(--pd-border-light)]">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-[var(--pd-text-primary)] m-0 tracking-tight">Buildings</h3>
        <button class="text-[var(--pd-text-tertiary)] hover:text-[var(--pd-text-secondary)] hover:bg-[var(--pd-bg-surface-hover)] p-1 rounded-full" @click="toggleInfoPopover">
          <i class="pi pi-info-circle"></i>
        </button>
        <Popover ref="infoPopover">
          <div class="p-4 w-72">
            <h4 class="text-[15px] font-semibold mb-3 text-[var(--pd-text-primary)]">Legend</h4>
            
            <div class="mb-4">
              <div class="text-[13px] font-medium text-[var(--pd-text-secondary)] mb-2">Location Status</div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full text-[var(--pd-primary)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-map-marker"></i>
                </span>
                <span>Building location mapped</span>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="text-[13px] font-medium text-[var(--pd-text-secondary)] mb-2">Construction Status</div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full  text-[var(--pd-info)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-clock"></i>
                </span>
                <span>Off-plan</span>
              </div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full text-[var(--pd-warning)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-clock"></i>
                </span>
                <span>Due for Handover</span>
              </div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full text-[var(--pd-success)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-clock"></i>
                </span>
                <span>Handover Completed</span>
              </div>
            </div>
            
            <div class="mb-2">
              <div class="text-[13px] font-medium text-[var(--pd-text-secondary)] mb-2">Availability Status</div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full text-[var(--pd-success)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-tag"></i>
                </span>
                <span>Available</span>
              </div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full  text-[var(--pd-error)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-tag"></i>
                </span>
                <span>Sold</span>
              </div>
              <div class="flex items-center gap-2.5 mb-1.5 text-[13px] text-[var(--pd-text-secondary)]">
                <span class="w-5 h-5 rounded-full text-[var(--pd-warning)] flex items-center justify-center text-[10px]">
                  <i class="pi pi-tag"></i>
                </span>
                <span>Available for Secondhand</span>
              </div>
            </div>
          </div>
        </Popover>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative w-[200px]">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search buildings..."
            class="w-full h-8 px-8 py-2 rounded-md border border-[var(--pd-border-light)] bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--pd-border-medium)] focus:shadow"
            @input="filterBuildings"
          />
          <i class="pi pi-search absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[var(--pd-text-tertiary)]"></i>
          <button v-if="searchQuery" class="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent text-[var(--pd-text-tertiary)] cursor-pointer w-4 h-4 rounded-full flex items-center justify-center text-xs hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)]" @click="clearSearch">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <button class="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--pd-border-light)] bg-[var(--pd-bg-base)] text-[var(--pd-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)] hover:-translate-y-0.5 hover:shadow-sm" @click="showNewBuildingDialog">
          <i class="pi pi-plus"></i>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <i class="pi pi-spin pi-spinner text-2xl text-[var(--pd-text-tertiary)]"></i>
    </div>

    <!-- Empty state -->
    <div v-else-if="!buildings.length" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center justify-center p-6 text-center">
        <i class="pi pi-building text-2xl text-[var(--pd-text-tertiary)] mb-3"></i>
        <p class="text-sm text-[var(--pd-text-secondary)] mb-4">No buildings found</p>
        <button class="bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] border border-[var(--pd-border-medium)] rounded-md px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:-translate-y-0.5" @click="showNewBuildingDialog">
          <i class="pi pi-plus"></i>
          <span>Add Building</span>
        </button>
      </div>
    </div>

    <!-- Building grid -->
    <div v-else-if="displayedBuildings.length" class="flex-1 overflow-auto p-3">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        <div
          v-for="building in displayedBuildings"
          :key="building.name"
          class="relative flex flex-col items-center justify-end pt-5 pb-3 px-2 rounded-xl bg-[var(--pd-bg-base)] border border-[var(--pd-border-light)] cursor-pointer transition-all duration-200 h-[110px] hover:-translate-y-0.5 hover:shadow-md"
          :class="{ 'bg-[var(--pd-bg-surface-hover)] border-[var(--pd-border-medium)]': selectedBuilding && selectedBuilding.name === building.name }"
          @click="selectBuilding(building)"
          @contextmenu="onRightClick($event, building)"
        >
          <div class="absolute top-1 right-1 flex">
            <span v-if="building.lat && building.lng" class="w-5 h-5 rounded-full  text-[var(--pd-primary)] flex items-center justify-center text-[10px]">
              <i class="pi pi-map-marker" style="font-size: 12px"></i>
            </span>
            <span 
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              :class="{
                ' text-[var(--pd-info)]': !building.status || building.status === 'Off-plan',
                'text-[var(--pd-warning)]': building.status === 'Due for Handover',
                ' text-[var(--pd-success)]': building.status === 'Handover Completed'
              }"
            >
              <i class="pi pi-clock" style="font-size: 12px"></i>
            </span>
            <span 
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              :class="{
                ' text-[var(--pd-success)]': !building.availability || building.availability === 'Available',
                ' text-[var(--pd-error)]': building.availability === 'Sold',
                'text-[var(--pd-warning)]': building.availability === 'Available for Secondhand'
              }"
            >
              <i class="pi pi-tag" style="font-size: 12px"></i>
            </span>
          </div>
          <div class="w-[38px] h-[38px] rounded-lg bg-[var(--pd-badge-bg)] flex items-center justify-center mb-2.5">
            <i class="pi pi-building text-lg text-[var(--pd-badge-text)]"></i>
          </div>
          <div class="text-[13px] font-medium text-[var(--pd-text-primary)] text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
            {{ building.building_name }}
          </div>
        </div>
      </div>
    </div>
    
    <div
      v-else-if="searchQuery && !displayedBuildings.length"
      class="flex-1 flex items-center justify-center"
    >
      <div class="flex flex-col items-center justify-center p-6 text-center">
        <i class="pi pi-search text-2xl text-[var(--pd-text-tertiary)] mb-3"></i>
        <p class="text-sm text-[var(--pd-text-secondary)] mb-4">No buildings found matching "{{ searchQuery }}"</p>
        <button class="bg-[var(--pd-bg-base)] text-[var(--pd-text-primary)] border border-[var(--pd-border-medium)] rounded-md px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:-translate-y-0.5" @click="clearSearch">
          <i class="pi pi-times"></i>
          <span>Clear Search</span>
        </button>
      </div>
    </div>

    <!-- Load more button if needed -->
    <div v-if="hasMoreBuildings" class="p-3 flex justify-center border-t border-[var(--pd-border-light)]">
      <button class="bg-transparent border-none text-[var(--pd-text-secondary)] text-sm px-3 py-2 flex items-center gap-2 cursor-pointer rounded-md transition-all duration-200 hover:bg-[var(--pd-bg-surface-hover)] hover:text-[var(--pd-text-primary)] disabled:opacity-60 disabled:cursor-not-allowed" @click="loadMoreBuildings" :disabled="loadingMore">
        <span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
        <i v-if="!loadingMore" class="pi pi-chevron-down"></i>
        <i v-else class="pi pi-spin pi-spinner"></i>
      </button>
    </div>

    <!-- Context Menu -->
    <ContextMenu ref="buildingMenu" :model="menuItems" />

    <!-- Create Building Dialog -->
    <CreateDialog
      v-model:visible="showCreateDialog"
      title="Add New Building"
      :fields="buildingFields"
      submitButtonLabel="Add Building"
      @submit="createBuilding"
    />

    <!-- Edit Building Dialog -->
    <EditDialog
      v-model:visible="showEditDialog"
      :fieldName="editField.name"
      :fieldType="editField.type"
      :value="editField.value"
      :title="editField.label"
      :options="editField.options"
      :validation="editField.validation"
      @save="updateBuilding"
    />

    <!-- Delete Building Dialog -->
    <DeleteDialog
      v-model:visible="showDeleteDialog"
      title="Delete Building"
      :message="`Are you sure you want to delete building '${selectedBuilding?.building_name}'? This will delete all associated listings and cannot be undone.`"
      :confirmField="'building_name'"
      :confirmValue="selectedBuilding?.building_name"
      @confirm="deleteSelectedBuilding"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildingStore } from '@/stores/building'
import { useTerritoryStore } from '@/stores/territory'
import { useProjectStore } from '@/stores/project'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

// Get project ID from route
const route = useRoute()
const projectId = computed(() => route.params.id)

// Event bus for communication between components
const emitter = inject('emitter')

// Store access
const buildingStore = useBuildingStore()
const territoryStore = useTerritoryStore()
const projectStore = useProjectStore()

// Component state
const selectedBuilding = ref(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const loadingMore = ref(false)
const buildingMenu = ref(null)
const infoPopover = ref(null)
const projectGeoType = ref(null)
const editField = ref({
  name: '',
  type: 'text',
  value: '',
  label: '',
  options: [],
})

// Computed properties
const buildings = computed(() => buildingStore.buildings)
const loading = computed(() => buildingStore.isLoading)
const hasMoreBuildings = computed(() => buildingStore.hasMoreBuildings)

// Filtered list of buildings based on search query
const searchQuery = ref('')
const filteredBuildings = ref([])

// Computed property for buildings to display
const displayedBuildings = computed(() => {
  return searchQuery.value ? filteredBuildings.value : buildings.value
})

// Dynamic menu items for context menu based on project geo type
const menuItems = computed(() => {
  const items = [
    {
      label: 'Edit Building Name',
      icon: 'pi pi-pencil',
      command: () => editBuildingName(),
    },
    {
      label: 'Edit Configuration',
      icon: 'pi pi-cog',
      command: () => editBuildingConfig(),
    },
    {
      label: 'Add Listing',
      icon: 'pi pi-plus',
      command: () =>
        emitter.emit('show-create-listing', { building: selectedBuilding.value }),
    },
  ]

  // Only show Set Location option for polygon project types
  if (projectGeoType.value === 'Polygon') {
    items.push({
      label: 'Set Location',
      icon: 'pi pi-map-marker',
      command: () => emitter.emit('show-location-dialog', selectedBuilding.value),
    })
  }

  items.push({ separator: true })
  items.push({
    label: 'Delete Building',
    icon: 'pi pi-trash',
    class: 'text-red-500',
    command: () => (showDeleteDialog.value = true),
  })

  return items
})

// Building fields for create dialog
const buildingFields = computed(() => [
  {
    name: 'project',
    label: 'Project',
    type: 'link',
    doctype: 'PRP Project',
    validation: 'required',
    default: projectId.value,
    readonly: true,
    fullWidth: false,
  },
  {
    name: 'building_name',
    label: 'Building Name',
    type: 'text',
    validation: 'required',
    fullWidth: false,
  },
  {
    name: 'building_configuration',
    label: 'Building Configuration',
    type: 'text',
    fullWidth: true,
  },
])

// Watch for selected building changes and emit event
watch(selectedBuilding, (building) => {
  if (building) {
    emitter.emit('building-selected', building)
  }
})

// Lifecycle hooks
onMounted(async () => {
  await fetchProjectData()
  await fetchBuildingsForProject()
})

// Toggle info popover
function toggleInfoPopover(event) {
  infoPopover.value.toggle(event)
}

// Fetch project data to determine geometry type
async function fetchProjectData() {
  try {
    // First fetch the project to get its territory field
    await projectStore.fetchProject(projectId.value)
    const project = projectStore.currentProject

    if (!project || !project.territory) {
      console.warn('Project has no territory field:', projectId.value)
      return
    }

    // Now get the territory data using the territory field from the project
    await territoryStore.fetchTerritories()
    const territory = territoryStore.territories.find((t) => t.name === project.territory)

    if (territory && territory.geo) {
      const geo =
        typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo

      console.log('Project territory geo type:', geo.type)
      projectGeoType.value = geo.type // 'Point' or 'Polygon'
    } else {
      console.warn('Territory not found or has no geometry data:', project.territory)
    }
  } catch (error) {
    console.error('Error fetching project data:', error)
  }
}

// Fetch buildings for the current project
async function fetchBuildingsForProject() {
  if (projectId.value) {
    await buildingStore.fetchBuildingsByProject(projectId.value)
  }
}

// Load more buildings
async function loadMoreBuildings() {
  loadingMore.value = true
  try {
    await buildingStore.loadMoreBuildings()
  } finally {
    loadingMore.value = false
  }
}

// Select a building
function selectBuilding(building) {
  selectedBuilding.value = building
}

// Right click handler for context menu
function onRightClick(event, building) {
  selectedBuilding.value = building
  buildingMenu.value.show(event)
}

// Show dialog to create a new building
function showNewBuildingDialog() {
  showCreateDialog.value = true
}

// Edit building name
function editBuildingName() {
  if (!selectedBuilding.value) return

  editField.value = {
    name: 'building_name',
    label: 'Building Name',
    type: 'text',
    value: selectedBuilding.value.building_name,
    validation: 'required',
  }

  showEditDialog.value = true
}

// Edit building configuration
function editBuildingConfig() {
  if (!selectedBuilding.value) return

  editField.value = {
    name: 'building_configuration',
    label: 'Building Configuration',
    type: 'text',
    value: selectedBuilding.value.building_configuration || '',
    validation: null,
  }

  showEditDialog.value = true
}

function filterBuildings() {
  if (!searchQuery.value.trim()) {
    filteredBuildings.value = []
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredBuildings.value = buildings.value.filter(building => 
    building.building_name.toLowerCase().includes(query) ||
    (building.building_configuration && building.building_configuration.toLowerCase().includes(query)) ||
    (building.status && building.status.toLowerCase().includes(query))
  )
}

function clearSearch() {
  searchQuery.value = ''
  filteredBuildings.value = []
}

// Create new building
async function createBuilding(data) {
  try {
    // If project geo type is 'Point', automatically set the building coordinates
    if (projectGeoType.value === 'Point') {
      const territory = territoryStore.territories.find(
        (t) => t.is_project && t.name === projectId.value,
      )

      if (territory && territory.geo) {
        const geo =
          typeof territory.geo === 'string' ? JSON.parse(territory.geo) : territory.geo

        if (geo.type === 'Point') {
          // Add coordinates to building data
          data.lat = geo.coordinates[1]
          data.lng = geo.coordinates[0]
        }
      }
    }

    await buildingStore.createBuilding(data)
  } catch (error) {
    console.error('Error creating building:', error)
  }
}

// Update building
async function updateBuilding({ fieldName, value }) {
  if (!selectedBuilding.value) return

  try {
    const updateData = {
      [fieldName]: value,
    }

    await buildingStore.updateBuilding(selectedBuilding.value.name, updateData)

    // Update local state until server refresh
    selectedBuilding.value = {
      ...selectedBuilding.value,
      [fieldName]: value,
    }
  } catch (error) {
    console.error('Error updating building:', error)
  }
}

// Delete selected building
async function deleteSelectedBuilding() {
  if (!selectedBuilding.value) return

  try {
    await buildingStore.deleteBuilding(selectedBuilding.value.name)
    selectedBuilding.value = null
  } catch (error) {
    console.error('Error deleting building:', error)
  }
}
</script>