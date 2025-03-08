<!-- components/projects/ProjectCreationDialog.vue -->
<template>
  <Dialog
    :visible="visible"
    :style="{ width: '85vw', maxWidth: '950px' }"
    :modal="true"
    :closable="currentStep !== 'processing'"
    class="project-creation-dialog"
    @hide="closeDialog"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="p-4">
      <!-- Use Stepper for main workflow -->
      <Stepper v-if="!['processing', 'success', 'phases-detected'].includes(currentStep)" :value="currentStepNumber">
  <StepList>
    <Step value="1">Project Type</Step>
    <Step value="2">Scale</Step>
    <Step value="3">Location</Step>
    <Step value="4">Details</Step>
  </StepList>
        
        <StepPanels class="mt-6">
  <!-- Step 1: Project or Phase selection -->
  <StepPanel value="1">
    <div class="option-group">
      <div
        @click="selectProjectType('project')"
        class="option-item"
        :class="{ selected: projectType === 'project' }"
      >
        <div class="option-icon">
          <i class="pi pi-building"></i>
        </div>
        <div class="option-content">
          <h3>Project</h3>
          <p>Create a new standalone project</p>
        </div>
      </div>

      <div
        @click="selectProjectType('phase')"
        class="option-item"
        :class="{ selected: projectType === 'phase' }"
      >
        <div class="option-icon">
          <i class="pi pi-sitemap"></i>
        </div>
        <div class="option-content">
          <h3>Phase</h3>
          <p>Create a phase within an existing project</p>
        </div>
      </div>
    </div>
  </StepPanel>

  <!-- Step 2: Scale or Parent Selection -->
  <StepPanel value="2">
    <!-- Project Scale (show when projectType is 'project') -->
    <div v-if="projectType === 'project'" class="option-group">
      <div
        @click="selectProjectScale('building')"
        class="option-item"
        :class="{ selected: projectScale === 'building' }"
      >
        <div class="option-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="option-content">
          <h3>Single Building</h3>
          <p>A single building or small plot</p>
        </div>
      </div>

      <div
        @click="selectProjectScale('development')"
        class="option-item"
        :class="{ selected: projectScale === 'development' }"
      >
        <div class="option-icon">
          <i class="pi pi-th-large"></i>
        </div>
        <div class="option-content">
          <h3>Development Area</h3>
          <p>A large development with multiple buildings or phases</p>
        </div>
      </div>
    </div>

    <!-- Parent Project Selection (show when projectType is 'phase') -->
    <div v-if="projectType === 'phase'" class="form-container">
      <FormField
        v-model="selectedParentProject"
        type="link"
        label="Parent Project"
        doctype="PRP Project"
        validation="required"
        placeholder="Select a project"
        icon="pi pi-building"
      />
      <div class="helper-text">
        <i class="pi pi-info-circle mr-2"></i>
        <span>Select the project this phase will belong to</span>
      </div>
    </div>
  </StepPanel>

  <!-- Step 3: Location -->
  <StepPanel value="3">
    <!-- Building Location -->
    <div v-if="projectType === 'project' && projectScale === 'building'">
      <div class="form-container">
        <label class="field-label">Project Name</label>
        <InputText
          v-model="projectName"
          placeholder="Enter project name"
          class="w-full"
        />
      </div>

      <div class="helper-text mb-3">
        <i class="pi pi-map-marker mr-2"></i>
        <span>Click on the map to place the marker at the building location</span>
      </div>

      <div class="map-container">
        <PointSelectionMap 
          v-model:selectedPoint="selectedPoint" 
          :initialZoom="15"
          :mapId="'point-selection-map-' + Math.random().toString(36).substring(2, 9)"
        />
      </div>
    </div>

    <!-- Development Area -->
    <div v-if="projectType === 'project' && projectScale === 'development'">
      <div class="form-container">
        <label class="field-label">Project Name</label>
        <InputText
          v-model="projectName"
          placeholder="Enter project name"
          class="w-full"
        />
      </div>

      <div class="helper-text mb-3">
        <i class="pi pi-pencil mr-2"></i>
        <span>Draw a polygon on the map to define the development boundaries</span>
      </div>

      <div class="map-container">
        <PolygonDrawingMap 
          v-model:drawnGeometry="drawnGeometry" 
          :initialZoom="14"
          :mapId="'polygon-map-' + Math.random().toString(36).substring(2, 9)"
        />
      </div>
    </div>

    <!-- Phase Area -->
    <div v-if="projectType === 'phase'">
      <div class="form-container">
        <label class="field-label">Phase Name</label>
        <InputText
          v-model="projectName"
          placeholder="Enter phase name (e.g. Phase 1)"
          class="w-full"
        />
      </div>

      <div class="helper-text mb-3">
        <i class="pi pi-pencil mr-2"></i>
        <span>Draw a polygon within the parent project boundaries</span>
      </div>

      <div class="map-container">
        <PolygonDrawingMap
          v-model:drawnGeometry="drawnGeometry"
          :boundaryGeometry="parentProjectGeometry"
          :restrictToParent="true"
          :initialZoom="15"
          :mapId="'phase-map-' + Math.random().toString(36).substring(2, 9)"
        />
      </div>
    </div>
  </StepPanel>

  <!-- Step 4: Details panel is handled outside stepper -->
</StepPanels>
      </Stepper>

      <!-- Project details step handled outside stepper -->
      <CreateDialog
        v-if="currentStep === 'project-details'"
        v-model:visible="showDetailsDialog"
        :title="projectType === 'phase' ? 'Phase Details' : 'Project Details'"
        :fields="projectDetailFields"
        :initialData="projectData"
        :submitButtonLabel="projectType === 'phase' ? 'Create Phase' : 'Create Project'"
        @submit="onProjectDetailsSubmit"
        @cancel="goToPreviousStep"
      />

      <!-- Phases Detection Step -->
      <div v-if="currentStep === 'phases-detected'" class="phases-detected-container">
        <div class="result-icon">
          <i class="pi pi-sitemap"></i>
        </div>
        <h3 class="result-title">Phases Detected</h3>
        
        <div class="info-box mb-4">
          <i class="pi pi-info-circle text-blue-500 mr-2"></i>
          <span>We detected {{ potentialPhases.length }} existing projects that appear to
            be phases of this project.</span>
        </div>

        <div class="phases-list">
          <ul class="phase-items">
            <li v-for="phase in potentialPhases" :key="phase.id" class="phase-item">
              <i class="pi pi-building mr-2"></i>
              {{ phase.name }}
            </li>
          </ul>
        </div>

        <div class="question-prompt text-center mt-4 mb-4">
          <p>Would you like to convert these to phases of your new project?</p>
        </div>

        <div class="flex justify-between">
          <Button 
            label="Skip" 
            class="p-button-text" 
            @click="skipPhaseConversion"
          />
          <Button 
            label="Convert to Phases" 
            icon="pi pi-sitemap"
            @click="convertToPhases"
          />
        </div>
      </div>

      <!-- Processing Step -->
      <div v-if="currentStep === 'processing'" class="processing-container">
        <ProgressSpinner class="mb-4" />
        <h3 class="processing-title">{{ processingTitle }}</h3>
        <p class="processing-message">{{ processingMessage }}</p>
        
        <div v-if="processingResults.length > 0" class="processing-results">
          <div v-for="(result, index) in processingResults" :key="index" class="result-item">
            <i :class="result.icon"></i>
            <span>{{ result.message }}</span>
          </div>
        </div>
      </div>

      <!-- Success Step -->
      <div v-if="currentStep === 'success'" class="success-container">
        <div class="success-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <h3 class="mt-3 mb-2">Success!</h3>
        <p class="mb-4">{{ successMessage }}</p>
        <div class="action-buttons">
          <Button
            label="Add Another"
            icon="pi pi-plus"
            class="p-button-outlined mr-2"
            @click="resetForm"
          />
          <Button
            label="View Project"
            icon="pi pi-external-link"
            @click="viewCreatedProject"
          />
        </div>
      </div>
    </div>

    <!-- Dialog footer with action buttons -->
    <template #footer v-if="showFooter">
      <Button
        v-if="showBackButton"
        label="Back"
        icon="pi pi-arrow-left"
        class="p-button-text"
        @click="goToPreviousStep"
      />
      <div class="flex-grow-1"></div>
      <Button
        :label="nextButtonLabel"
        :icon="nextButtonIcon"
        :disabled="isNextButtonDisabled"
        :loading="processing && currentStep !== 'processing'"
        @click="handleNextAction"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useProjectStore } from '@/stores/project'
import { useTerritoryStore } from '@/stores/territory'
import FormField from '@/components/common/FormField.vue'
import PointSelectionMap from './maps/PointSelectionMap.vue'
import PolygonDrawingMap from './maps/PolygonDrawingMap.vue'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'

// Props and emits
const props = defineProps({
	visible: Boolean,
})

const emit = defineEmits(['update:visible', 'project-created'])

// Initialize stores and utilities
const projectStore = useProjectStore()
const territoryStore = useTerritoryStore()
const toast = useToast()
const router = useRouter()

// State variables
const currentStep = ref('type-selection')
const projectType = ref(null)
const projectScale = ref(null)
const selectedParentProject = ref(null)
const parentProjectGeometry = ref(null)
const parentProjectTerritory = ref(null)
const selectedPoint = ref(null)
const drawnGeometry = ref(null)
const createdTerritory = ref(null)
const projectName = ref('')
const processing = ref(false)
const loadingParentProject = ref(false)
const potentialPhases = ref([])
const processingMessage = ref('Creating territory...')
const successMessage = ref('Your project has been created successfully.')
const createdProjectId = ref(null)
const showDetailsDialog = ref(true)

// Project data for final step
const projectData = ref({
	project_name: '',
	territory: null,
	developer: null,
	project_amenities: null,
	handover_quarter: null,
	handover_year: null,
	status: 'Off-plan',
	availability: 'Available',
	cover_image: null,
})

// Project detail fields for CreateDialog
const projectDetailFields = computed(() => [
	{
		name: 'project_name',
		label: 'Project Name',
		type: 'text',
		validation: 'required',
		icon: 'pi pi-bookmark',
		fullWidth: true,
	},
	{
		name: 'developer',
		label: 'Developer',
		type: 'link',
		doctype: 'PRP Developer',
		validation: 'required',
		icon: 'pi pi-building',
		fullWidth: false,
	},
	{
		name: 'handover_quarter',
		label: 'Handover Quarter',
		type: 'select',
		options: [1, 2, 3, 4],
		icon: 'pi pi-calendar',
		fullWidth: false,
	},
	{
		name: 'handover_year',
		label: 'Handover Year',
		type: 'select',
		options: yearOptions,
		icon: 'pi pi-calendar',
		fullWidth: false,
	},
	{
		name: 'availability',
		label: 'Availability',
		type: 'select',
		options: availabilityOptions,
		icon: 'pi pi-tag',
		fullWidth: false,
	},
])

// Step definitions for stepper
const currentStepNumber = computed(() => {
  switch (currentStep.value) {
    case 'type-selection':
      return '1'
    case 'project-scale':
    case 'parent-selection':
      return '2'
    case 'building-location':
    case 'development-area':
    case 'phase-area':
      return '3'
    case 'project-details':
      return '4'
    default:
      return '1'
  }
})

const processingTitle = ref('Processing')
const processingResults = ref([])

// Options for select fields
const statusOptions = ['Off-plan', 'Due for Handover', 'Handover Completed']
const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)
const availabilityOptions = ['Available', 'Sold', 'Available for Secondhand']

// Computed properties


const showFooter = computed(() => {
	// Hide footer in processing, success, and project-details steps
	return !['processing', 'success', 'project-details'].includes(currentStep.value)
})

const showBackButton = computed(() => {
	// Hide back button in the first step
	return currentStep.value !== 'type-selection'
})

const nextButtonLabel = computed(() => {
	switch (currentStep.value) {
		case 'phases-detected':
			return 'Convert to Phases'
		case 'building-location':
		case 'development-area':
		case 'phase-area':
			return 'Continue'
		default:
			return 'Next'
	}
})

const nextButtonIcon = computed(() => {
	if (currentStep.value === 'phases-detected') {
		return 'pi pi-sitemap'
	} else {
		return 'pi pi-arrow-right'
	}
})

const isNextButtonDisabled = computed(() => {
	switch (currentStep.value) {
		case 'type-selection':
			return !projectType.value
		case 'project-scale':
			return !projectScale.value
		case 'parent-selection':
			return !selectedParentProject.value
		case 'building-location':
			return !selectedPoint.value || !projectName.value.trim()
		case 'development-area':
		case 'phase-area':
			return !drawnGeometry.value || !projectName.value.trim()
		default:
			return false
	}
})

// Watch for visibility changes
watch(
	() => props.visible,
	(newValue) => {
		if (newValue) {
			resetForm()
		}
	},
)

// Watch for project name changes
watch(projectName, (newValue) => {
	projectData.value.project_name = newValue
})

// Handle the next action based on current step
function handleNextAction() {
	switch (currentStep.value) {
		case 'type-selection':
		case 'project-scale':
			goToNextStep()
			break
		case 'parent-selection':
			loadParentProject()
			break
		case 'building-location':
			createBuildingTerritory()
			break
		case 'development-area':
			createDevelopmentTerritory()
			break
		case 'phase-area':
			createPhaseTerritory()
			break
		case 'phases-detected':
			convertToPhases()
			break
	}
}

// Methods for navigation between steps
function goToNextStep() {
	switch (currentStep.value) {
		case 'type-selection':
			if (projectType.value === 'project') {
				currentStep.value = 'project-scale'
			} else {
				currentStep.value = 'parent-selection'
			}
			break

		case 'project-scale':
			if (projectScale.value === 'building') {
				currentStep.value = 'building-location'
			} else {
				currentStep.value = 'development-area'
			}
			break
	}
}

function goToPreviousStep() {
	switch (currentStep.value) {
		case 'project-scale':
			currentStep.value = 'type-selection'
			break

		case 'parent-selection':
			currentStep.value = 'type-selection'
			break

		case 'building-location':
		case 'development-area':
			currentStep.value = 'project-scale'
			break

		case 'phase-area':
			currentStep.value = 'parent-selection'
			break

		case 'project-details':
			if (projectType.value === 'project') {
				if (projectScale.value === 'building') {
					currentStep.value = 'building-location'
				} else {
					currentStep.value = 'development-area'
				}
			} else {
				currentStep.value = 'phase-area'
			}
			break
	}
}

// Type selections
function selectProjectType(type) {
	projectType.value = type
	goToNextStep()
}

function selectProjectScale(scale) {
	projectScale.value = scale
	goToNextStep()
}

// Handle project details submission
function onProjectDetailsSubmit(data) {
	projectData.value = { ...data, territory: projectData.value.territory }
	finalizeProjectCreation()
}

// Load parent project for phase creation
async function loadParentProject() {
	if (!selectedParentProject.value) return

	loadingParentProject.value = true

	try {
		// Get project details
		const project = await projectStore.fetchProject(selectedParentProject.value)

		if (!project || !project.territory) {
			throw new Error('Unable to load project territory')
		}

		// Get territory details
		const territory = await territoryStore.fetchTerritory(project.territory)

		if (!territory || !territory.geo) {
			throw new Error('Project territory has no geometry data')
		}

		// Set parent project geometry
		parentProjectGeometry.value = JSON.parse(territory.geo)
		parentProjectTerritory.value = territory.name

		// Proceed to next step
		currentStep.value = 'phase-area'
	} catch (error) {
		toast.add({
			severity: 'error',
			summary: 'Error',
			detail: error.message || 'Failed to load parent project',
			life: 5000,
		})
		console.error('Error loading parent project:', error)
	} finally {
		loadingParentProject.value = false
	}
}

// Territory creation methods
async function createBuildingTerritory() {
	if (!selectedPoint.value || !projectName.value.trim()) {
		return
	}

	processing.value = true
	currentStep.value = 'processing'
	processingMessage.value = 'Creating building territory...'

	try {
		// Create point geometry
		const pointGeometry = {
			type: 'Point',
			coordinates: [selectedPoint.value.lng, selectedPoint.value.lat],
		}

		// Create territory using the API
		const result = await territoryStore.createTerritoryFromGeometry(
			projectName.value,
			pointGeometry,
			true,
		)

		if (result.success) {
			createdTerritory.value = result.territory_id

			// Set territory in project data
			projectData.value.territory = result.territory_id

			// Proceed to project details step
			currentStep.value = 'project-details'
		} else {
			throw new Error(result.message || 'Failed to create territory')
		}
	} catch (error) {
		handleError(error, 'Failed to create building territory')
	} finally {
		processing.value = false
	}
}

async function createDevelopmentTerritory() {
  if (!drawnGeometry.value || !projectName.value.trim()) {
    return
  }

  processing.value = true
  currentStep.value = 'processing'
  processingTitle.value = 'Creating Project Territory'
  processingMessage.value = 'Drawing boundaries and analyzing location...'
  processingResults.value = []

  try {
    // Create territory using the API
    const result = await territoryStore.createTerritoryFromGeometry(
      projectName.value,
      drawnGeometry.value,
      true,
    )

    if (result.success) {
      console.log(result)
      createdTerritory.value = result.territory_id

      // Add processing results for better UX
      processingResults.value.push({
        icon: 'pi pi-map-marker text-green-500',
        message: 'Territory boundaries created successfully'
      })
      
      if (result.hierarchy && result.hierarchy.length > 0) {
        processingResults.value.push({
          icon: 'pi pi-sitemap text-blue-500',
          message: `Location identified: ${result.hierarchy.join(' › ')}`
        })
      }

      // Set territory in project data
      projectData.value.territory = result.territory_id

      // Pause briefly to show results before proceeding
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if potential phases were detected
      if (result.potential_phases && result.potential_phases.length > 0) {
        potentialPhases.value = result.potential_phases
        currentStep.value = 'phases-detected'
      } else {
        // Proceed to project details step
        currentStep.value = 'project-details'
      }
    } else {
      throw new Error(result.message || 'Failed to create territory')
    }
  } catch (error) {
    handleError(error, 'Failed to create development territory')
  } finally {
    processing.value = false
  }
}

async function createPhaseTerritory() {
	if (!drawnGeometry.value || !projectName.value.trim() || !parentProjectTerritory.value) {
		return
	}

	processing.value = true
	currentStep.value = 'processing'
	processingMessage.value = 'Creating phase territory...'

	try {
		// Create phase using the API
		const result = await territoryStore.createPhaseForProject(
			parentProjectTerritory.value,
			projectName.value,
			drawnGeometry.value,
		)

		if (result.success) {
			createdTerritory.value = result.phase_id

			// Set territory in project data
			projectData.value.territory = result.phase_id

			// Proceed to project details step
			currentStep.value = 'project-details'
		} else {
			throw new Error(result.message || 'Failed to create phase')
		}
	} catch (error) {
		handleError(error, 'Failed to create phase territory')
	} finally {
		processing.value = false
	}
}

// Finalize project creation
async function finalizeProjectCreation() {
	if (
		!projectData.value.project_name ||
		!projectData.value.developer ||
		!projectData.value.territory
	) {
		return
	}

	processing.value = true
	currentStep.value = 'processing'
	processingMessage.value = 'Creating project...'

	try {
		// Create project
		const result = await projectStore.createProject(projectData.value)

		createdProjectId.value = result.name

		// Set success message
		if (projectType.value === 'phase') {
			successMessage.value = 'Your phase has been created successfully.'
		} else {
			successMessage.value = 'Your project has been created successfully.'
		}

		// Go to success step
		currentStep.value = 'success'

		// Emit project created event
		emit('project-created', result)
	} catch (error) {
		handleError(error, 'Failed to create project')
	} finally {
		processing.value = false
	}
}

// Convert detected territories to phases
async function convertToPhases() {
	if (!createdTerritory.value) {
		return
	}

	processing.value = true
	processingMessage.value = 'Converting territories to phases...'

	try {
		const result = await territoryStore.convertToPhasesForProject(createdTerritory.value)

		if (result.success) {
			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: result.message || 'Territories converted to phases successfully',
				life: 3000,
			})

			// Proceed to project details step
			currentStep.value = 'project-details'
		} else {
			throw new Error(result.message || 'Failed to convert phases')
		}
	} catch (error) {
		handleError(error, 'Failed to convert territories to phases')
	} finally {
		processing.value = false
	}
}

// Skip phase conversion
async function skipPhaseConversion() {
  try {
    // Call backend to clear potential phases
    await call(
      'prp.prp.doctype.prp_territory.prp_territory.clear_potential_phases',
      {
        project_id: createdTerritory.value
      }
    )
    
    // Proceed to project details step
    currentStep.value = 'project-details'
  } catch (error) {
    console.error('Error clearing potential phases:', error)
    // Still proceed to next step even if clearing failed
    currentStep.value = 'project-details'
  }
}

// View created project
function viewCreatedProject() {
	if (createdProjectId.value) {
		closeDialog()
		router.push(`/projects/${createdProjectId.value}`)
	}
}

// Handle errors
function handleError(error, defaultMessage) {
	console.error(error)

	toast.add({
		severity: 'error',
		summary: 'Error',
		detail: error.message || defaultMessage,
		life: 5000,
	})

	// Go back to previous step
	goToPreviousStep()
}


// Reset dialog
function resetForm() {
	currentStep.value = 'type-selection'
	projectType.value = null
	projectScale.value = null
	selectedParentProject.value = null
	parentProjectGeometry.value = null
	parentProjectTerritory.value = null
	selectedPoint.value = null
	drawnGeometry.value = null
	createdTerritory.value = null
	projectName.value = ''
	potentialPhases.value = []
	processingMessage.value = 'Creating territory...'
	successMessage.value = 'Your project has been created successfully.'
	createdProjectId.value = null

	projectData.value = {
		project_name: '',
		territory: null,
		developer: null,
		project_amenities: null,
		handover_quarter: null,
		handover_year: null,
		status: 'Off-plan',
		availability: 'Available',
		cover_image: null,
	}
}

// Close dialog
function closeDialog() {
	resetForm()
	emit('update:visible', false)
}
</script>

<style scoped>
.project-creation-dialog :deep(.p-dialog-content) {
  overflow: hidden;
  border-radius: 16px;
  padding: 0;
  background-color: var(--pd-bg-base);
  color: var(--pd-text-primary);
}

.project-creation-dialog :deep(.p-stepper) {
  --stepper-border-width: 1px;
  --stepper-border-color: var(--pd-border-light);
}

.project-creation-dialog :deep(.p-step-header) {
  border-radius: 10px;
  transition: all 0.2s;
  padding: 1rem;
  background-color: var(--pd-bg-surface);
}

.project-creation-dialog :deep(.p-step-header:hover) {
  background-color: var(--pd-bg-surface-hover);
}

.project-creation-dialog :deep(.p-step-header.p-highlight) {
  background-color: var(--pd-bg-surface-hover);
  border-color: var(--pd-outline-color);
}

.project-creation-dialog :deep(.p-step-header .p-step-title) {
  color: var(--pd-text-primary);
}

.project-creation-dialog :deep(.p-step-number) {
  background-color: var(--pd-marker-bg);
  color: var(--pd-bg-base);
}

.project-creation-dialog :deep(.p-step-header.p-highlight .p-step-number) {
  background-color: var(--pd-marker-special);
}

.project-creation-dialog :deep(.p-step-panel) {
  padding: 1.5rem 1rem;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  background-color: var(--pd-bg-base);
}

.project-creation-dialog :deep(.p-dialog-footer) {
  border-top: 1px solid var(--pd-border-light);
  padding: 1rem 1.5rem;
  background-color: var(--pd-bg-base);
}

.option-group {
  display: flex;
  gap: 1.5rem;
  margin: 1rem auto;
  justify-content: center;
  flex-wrap: wrap;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  width: 280px;
  cursor: pointer;
  border: 1px solid var(--pd-border-light);
  border-radius: 12px;
  transition: all 0.2s ease;
  background-color: var(--pd-bg-surface);
  color: var(--pd-text-primary);
}

.option-item:hover {
  border-color: var(--pd-border-medium);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--pd-shadow-color);
}

.option-item.selected {
  border-color: var(--pd-marker-special);
  background-color: var(--pd-bg-surface-hover);
  box-shadow: 0 4px 12px var(--pd-shadow-color-strong);
}

.option-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: var(--pd-badge-bg);
  color: var(--pd-badge-text);
  margin-right: 1rem;
  flex-shrink: 0;
}

.option-icon i {
  font-size: 1.5rem;
}

.option-content {
  flex-grow: 1;
}

.option-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--pd-text-primary);
}

.option-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--pd-text-secondary);
  line-height: 1.4;
}

.form-container {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--pd-text-primary);
}

.helper-text {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--pd-text-secondary);
  margin: 0.5rem 0;
}

.map-container {
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--pd-border-light);
  flex-grow: 1;
  box-shadow: 0 2px 8px var(--pd-shadow-color);
}

.map-container {
  position: relative;
  height: 380px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--pd-border-light);
  flex-grow: 1;
  z-index: 1; /* Ensure proper z-index */
}

.map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

/* Target Leaflet's specific CSS to override any conflicts */
.project-creation-dialog :deep(.leaflet-container) {
  z-index: 1;
  background: var(--pd-bg-surface) !important; /* Override leaflet's background */
}

.project-creation-dialog :deep(.leaflet-control-container) {
  z-index: 2;
}

.project-creation-dialog :deep(.leaflet-pane) {
  z-index: 1;
}

.phases-detected-container, 
.processing-container, 
.success-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  min-height: 400px;
  background-color: var(--pd-bg-base);
  color: var(--pd-text-primary);
}

.result-icon,
.success-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.result-icon {
  background-color: var(--pd-badge-bg);
  color: var(--pd-badge-text);
}

.success-icon {
  background-color: #d1fae5; /* green-100 */
  color: #065f46; /* green-800 */
}

.dark .success-icon {
  background-color: #064e3b; /* green-900 */
  color: #a7f3d0; /* green-200 */
}

.result-icon i,
.success-icon i {
  font-size: 2rem;
}

.result-title,
.processing-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--pd-text-primary);
}

.info-box {
  padding: 1rem;
  background-color: var(--pd-bg-surface);
  border-radius: 10px;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  border: 1px solid var(--pd-border-light);
}

.phase-items {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  width: 100%;
}

.phase-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background-color: var(--pd-bg-surface);
  border-radius: 8px;
  display: flex;
  align-items: center;
  border-left: 3px solid var(--pd-marker-special);
  text-align: left;
  color: var(--pd-text-primary);
}

.question-prompt {
  font-size: 1.1rem;
  color: var(--pd-text-primary);
  font-weight: 500;
}

.processing-message {
  margin-bottom: 1.5rem;
  color: var(--pd-text-secondary);
}

.processing-results {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 500px;
  background-color: var(--pd-bg-surface);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--pd-border-light);
}

.result-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--pd-border-light);
  text-align: left;
  color: var(--pd-text-primary);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item i {
  margin-right: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Fix for InputText to use our custom variables */
.project-creation-dialog :deep(.p-inputtext) {
  background-color: var(--pd-bg-surface);
  color: var(--pd-text-primary);
  border-color: var(--pd-border-medium);
}

.project-creation-dialog :deep(.p-inputtext:focus) {
  border-color: var(--pd-marker-special);
}

/* Fix for Button to use our custom variables */
.project-creation-dialog :deep(.p-button) {
  background-color: var(--pd-marker-special);
  color: var(--pd-bg-base);
  border-color: var(--pd-marker-special);
}

.project-creation-dialog :deep(.p-button:hover) {
  background-color: var(--pd-marker-bg);
  border-color: var(--pd-marker-bg);
}

.project-creation-dialog :deep(.p-button.p-button-text) {
  background-color: transparent;
  color: var(--pd-text-secondary);
  border-color: transparent;
}

.project-creation-dialog :deep(.p-button.p-button-text:hover) {
  background-color: var(--pd-bg-surface-hover);
  color: var(--pd-text-primary);
}

.project-creation-dialog :deep(.p-button.p-button-outlined) {
  background-color: transparent;
  color: var(--pd-marker-special);
  border-color: var(--pd-marker-special);
}

.project-creation-dialog :deep(.p-button.p-button-outlined:hover) {
  background-color: var(--pd-bg-surface-hover);
}
</style>>