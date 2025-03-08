<!-- components/projects/ProjectCreationDialog.vue -->
<template>
  <Dialog 
    :visible="visible" 
    :header="dialogTitle" 
    :style="{ width: '85vw', maxWidth: '950px' }"
    :modal="true"
    :closable="currentStep !== 'processing'"
    class="project-creation-dialog"
    @hide="closeDialog"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- Dialog header with steps -->
    <template #header>
      <div class="stepper" v-if="showStepper">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': currentStepIndex >= index, 
            'current': currentStepIndex === index 
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
    </template>

    <!-- Dialog content -->
    <div class="creation-dialog-content">
      <!-- Step 1: Project or Phase selection -->
      <div v-if="currentStep === 'type-selection'" class="step-container">
        <div class="option-cards">
          <Card 
            @click="selectProjectType('project')" 
            class="option-card"
            :class="{ 'selected': projectType === 'project' }"
          >
            <template #content>
              <div class="card-content">
                <div class="icon-container">
                  <i class="pi pi-building"></i>
                </div>
                <h3>Project</h3>
                <p>Create a new standalone project</p>
              </div>
            </template>
          </Card>
          
          <Card 
            @click="selectProjectType('phase')" 
            class="option-card"
            :class="{ 'selected': projectType === 'phase' }"
          >
            <template #content>
              <div class="card-content">
                <div class="icon-container">
                  <i class="pi pi-sitemap"></i>
                </div>
                <h3>Phase</h3>
                <p>Create a phase within an existing project</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
      
      <!-- Step 2a: Project Scale Selection -->
      <div v-if="currentStep === 'project-scale'" class="step-container">
        <div class="option-cards">
          <Card 
            @click="selectProjectScale('building')" 
            class="option-card"
            :class="{ 'selected': projectScale === 'building' }"
          >
            <template #content>
              <div class="card-content">
                <div class="icon-container">
                  <i class="pi pi-home"></i>
                </div>
                <h3>Single Building</h3>
                <p>A single building or small plot</p>
              </div>
            </template>
          </Card>
          
          <Card 
            @click="selectProjectScale('development')" 
            class="option-card"
            :class="{ 'selected': projectScale === 'development' }"
          >
            <template #content>
              <div class="card-content">
                <div class="icon-container">
                  <i class="pi pi-th-large"></i>
                </div>
                <h3>Development Area</h3>
                <p>A large development with multiple buildings or phases</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
      
      <!-- Step 2b: Project Selection (for phase) -->
      <div v-if="currentStep === 'parent-selection'" class="step-container">
        <div class="form-section">
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
      </div>
      
      <!-- Step 3a: Building Location -->
      <div v-if="currentStep === 'building-location'" class="step-container">
        <div class="form-section mb-3">
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
          />
        </div>
      </div>
      
      <!-- Step 3b: Development Area -->
      <div v-if="currentStep === 'development-area'" class="step-container">
        <div class="form-section mb-3">
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
          />
        </div>
      </div>
      
      <!-- Step 3c: Phase Area -->
      <div v-if="currentStep === 'phase-area'" class="step-container">
        <div class="form-section mb-3">
          <label class="field-label">Phase Name</label>
          <InputText 
            v-model="projectName" 
            placeholder="Enter phase name" 
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
          />
        </div>
      </div>
      
      <!-- Phases Detection Step -->
      <div v-if="currentStep === 'phases-detected'" class="step-container">
        <div class="info-box mb-4">
          <i class="pi pi-info-circle text-blue-500 mr-2"></i>
          <span>We detected {{ potentialPhases.length }} existing projects that appear to be phases of this project.</span>
        </div>
        
        <div class="phases-list">
          <ul class="phase-items">
            <li v-for="phase in potentialPhases" :key="phase.id" class="phase-item">
              <i class="pi pi-building mr-2"></i>
              {{ phase.name }}
            </li>
          </ul>
        </div>
        
        <div class="question-prompt text-center mt-4">
          <p>Would you like to convert these to phases of your new project?</p>
        </div>
      </div>
      
      <!-- Processing Step -->
      <div v-if="currentStep === 'processing'" class="step-container processing-container">
        <div class="processing-content">
          <ProgressSpinner class="mb-4" />
          <h3 class="mb-2">Processing</h3>
          <p>{{ processingMessage }}</p>
        </div>
      </div>
      
      <!-- Success Step -->
      <div v-if="currentStep === 'success'" class="step-container success-container">
        <div class="success-content">
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
      
      <!-- Using CreateDialog for the project details step -->
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
        v-if="currentStep === 'phases-detected'"
        label="Skip" 
        class="p-button-text mr-2" 
        @click="skipPhaseConversion"
      />
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
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { useProjectStore } from '@/stores/project';
import { useTerritoryStore } from '@/stores/territory';
import FormField from '@/components/common/FormField.vue';
import PointSelectionMap from './maps/PointSelectionMap.vue';
import PolygonDrawingMap from './maps/PolygonDrawingMap.vue';
import CreateDialog from '@/components/dialogs/CreateDialog.vue';

// Props and emits
const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'project-created']);

// Initialize stores and utilities
const projectStore = useProjectStore();
const territoryStore = useTerritoryStore();
const toast = useToast();
const router = useRouter();

// State variables
const currentStep = ref('type-selection');
const projectType = ref(null);
const projectScale = ref(null);
const selectedParentProject = ref(null);
const parentProjectGeometry = ref(null);
const parentProjectTerritory = ref(null);
const selectedPoint = ref(null);
const drawnGeometry = ref(null);
const createdTerritory = ref(null);
const projectName = ref('');
const processing = ref(false);
const loadingParentProject = ref(false);
const potentialPhases = ref([]);
const processingMessage = ref('Creating territory...');
const successMessage = ref('Your project has been created successfully.');
const createdProjectId = ref(null);
const showDetailsDialog = ref(true);

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
  cover_image: null
});

// Project detail fields for CreateDialog
const projectDetailFields = computed(() => [
  {
    name: 'project_name',
    label: 'Project Name',
    type: 'text',
    validation: 'required',
    icon: 'pi pi-bookmark',
    fullWidth: true
  },
  {
    name: 'developer',
    label: 'Developer',
    type: 'link',
    doctype: 'PRP Developer',
    validation: 'required',
    icon: 'pi pi-building',
    fullWidth: false
  },
  {
    name: 'project_amenities',
    label: 'Project Amenities',
    type: 'link',
    doctype: 'PRP Preference',
    validation: 'required',
    icon: 'pi pi-star',
    fullWidth: false
  },
  {
    name: 'handover_quarter',
    label: 'Handover Quarter',
    type: 'select',
    options: [1, 2, 3, 4],
    icon: 'pi pi-calendar',
    fullWidth: false
  },
  {
    name: 'handover_year',
    label: 'Handover Year',
    type: 'int',
    icon: 'pi pi-calendar',
    fullWidth: false
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: statusOptions,
    icon: 'pi pi-flag',
    fullWidth: false
  },
  {
    name: 'availability',
    label: 'Availability',
    type: 'select',
    options: availabilityOptions,
    icon: 'pi pi-tag',
    fullWidth: true
  },
  // Cover image field would need special handling in the CreateDialog component
  // or could be added afterwards
]);

// Step definitions for stepper
const steps = [
  { key: 'type-selection', label: 'Type' },
  { key: 'project-scale', label: 'Scale' },
  { key: 'building-location', label: 'Location' },
  { key: 'project-details', label: 'Details' }
];

// Options for select fields
const statusOptions = [
  'Off-plan',
  'Due for Handover',
  'Handover Completed'
];

const availabilityOptions = [
  'Available',
  'Sold',
  'Available for Secondhand'
];

// Computed properties
const dialogTitle = computed(() => {
  switch (currentStep.value) {
    case 'type-selection':
      return 'Create New Project';
    case 'project-scale':
      return 'Select Project Type';
    case 'parent-selection':
      return 'Select Parent Project';
    case 'building-location':
      return 'Locate Building';
    case 'development-area':
      return 'Define Development Area';
    case 'phase-area':
      return 'Define Phase Area';
    case 'project-details':
      return 'Project Details';
    case 'phases-detected':
      return 'Phases Detected';
    case 'processing':
      return 'Processing';
    case 'success':
      return 'Success';
    default:
      return 'New Project';
  }
});

const currentStepIndex = computed(() => {
  if (projectType.value === 'phase') {
    const phaseSteps = ['type-selection', 'parent-selection', 'phase-area', 'project-details'];
    return phaseSteps.indexOf(currentStep.value);
  } else {
    const normalSteps = ['type-selection', 'project-scale', 
                        projectScale.value === 'building' ? 'building-location' : 'development-area', 
                        'project-details'];
    return normalSteps.indexOf(currentStep.value);
  }
});

const showStepper = computed(() => {
  // Don't show stepper for processing, success or phases-detected steps
  return !['processing', 'success', 'phases-detected'].includes(currentStep.value);
});

const showFooter = computed(() => {
  // Hide footer in processing, success, and project-details steps
  return !['processing', 'success', 'project-details'].includes(currentStep.value);
});

const showBackButton = computed(() => {
  // Hide back button in the first step
  return currentStep.value !== 'type-selection';
});

const nextButtonLabel = computed(() => {
  switch (currentStep.value) {
    case 'phases-detected':
      return 'Convert to Phases';
    case 'building-location':
    case 'development-area':
    case 'phase-area':
      return 'Continue';
    default:
      return 'Next';
  }
});

const nextButtonIcon = computed(() => {
  if (currentStep.value === 'phases-detected') {
    return 'pi pi-sitemap';
  } else {
    return 'pi pi-arrow-right';
  }
});

const isNextButtonDisabled = computed(() => {
  switch (currentStep.value) {
    case 'type-selection':
      return !projectType.value;
    case 'project-scale':
      return !projectScale.value;
    case 'parent-selection':
      return !selectedParentProject.value;
    case 'building-location':
      return !selectedPoint.value || !projectName.value.trim();
    case 'development-area':
    case 'phase-area':
      return !drawnGeometry.value || !projectName.value.trim();
    default:
      return false;
  }
});

// Watch for visibility changes
watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm();
  }
});

// Watch for project name changes
watch(projectName, (newValue) => {
  projectData.value.project_name = newValue;
});

// Handle the next action based on current step
function handleNextAction() {
  switch (currentStep.value) {
    case 'type-selection':
    case 'project-scale':
      goToNextStep();
      break;
    case 'parent-selection':
      loadParentProject();
      break;
    case 'building-location':
      createBuildingTerritory();
      break;
    case 'development-area':
      createDevelopmentTerritory();
      break;
    case 'phase-area':
      createPhaseTerritory();
      break;
    case 'phases-detected':
      convertToPhases();
      break;
  }
}

// Methods for navigation between steps
function goToNextStep() {
  switch (currentStep.value) {
    case 'type-selection':
      if (projectType.value === 'project') {
        currentStep.value = 'project-scale';
      } else {
        currentStep.value = 'parent-selection';
      }
      break;
      
    case 'project-scale':
      if (projectScale.value === 'building') {
        currentStep.value = 'building-location';
      } else {
        currentStep.value = 'development-area';
      }
      break;
  }
}

function goToPreviousStep() {
  switch (currentStep.value) {
    case 'project-scale':
      currentStep.value = 'type-selection';
      break;
      
    case 'parent-selection':
      currentStep.value = 'type-selection';
      break;
      
    case 'building-location':
    case 'development-area':
      currentStep.value = 'project-scale';
      break;
      
    case 'phase-area':
      currentStep.value = 'parent-selection';
      break;
      
    case 'project-details':
      if (projectType.value === 'project') {
        if (projectScale.value === 'building') {
          currentStep.value = 'building-location';
        } else {
          currentStep.value = 'development-area';
        }
      } else {
        currentStep.value = 'phase-area';
      }
      break;
  }
}

// Type selections
function selectProjectType(type) {
  projectType.value = type;
  goToNextStep();
}

function selectProjectScale(scale) {
  projectScale.value = scale;
  goToNextStep();
}

// Handle project details submission
function onProjectDetailsSubmit(data) {
  projectData.value = { ...data, territory: projectData.value.territory };
  finalizeProjectCreation();
}

// Load parent project for phase creation
async function loadParentProject() {
  if (!selectedParentProject.value) return;
  
  loadingParentProject.value = true;
  
  try {
    // Get project details
    const project = await projectStore.fetchProject(selectedParentProject.value);
    
    if (!project || !project.territory) {
      throw new Error('Unable to load project territory');
    }
    
    // Get territory details
    const territory = await territoryStore.fetchTerritory(project.territory);
    
    if (!territory || !territory.geo) {
      throw new Error('Project territory has no geometry data');
    }
    
    // Set parent project geometry
    parentProjectGeometry.value = JSON.parse(territory.geo);
    parentProjectTerritory.value = territory.name;
    
    // Proceed to next step
    currentStep.value = 'phase-area';
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load parent project',
      life: 5000
    });
    console.error('Error loading parent project:', error);
  } finally {
    loadingParentProject.value = false;
  }
}

// Territory creation methods
async function createBuildingTerritory() {
  if (!selectedPoint.value || !projectName.value.trim()) {
    return;
  }
  
  processing.value = true;
  currentStep.value = 'processing';
  processingMessage.value = 'Creating building territory...';
  
  try {
    // Create point geometry
    const pointGeometry = {
      type: 'Point',
      coordinates: [selectedPoint.value.lng, selectedPoint.value.lat]
    };
    
    // Create territory using the API
    const result = await territoryStore.createTerritoryFromGeometry(
      projectName.value,
      pointGeometry,
      true
    );
    
    if (result.success) {
      createdTerritory.value = result.territory_id;
      
      // Set territory in project data
      projectData.value.territory = result.territory_id;
      
      // Proceed to project details step
      currentStep.value = 'project-details';
    } else {
      throw new Error(result.message || 'Failed to create territory');
    }
    
  } catch (error) {
    handleError(error, 'Failed to create building territory');
  } finally {
    processing.value = false;
  }
}

async function createDevelopmentTerritory() {
  if (!drawnGeometry.value || !projectName.value.trim()) {
    return;
  }
  
  processing.value = true;
  currentStep.value = 'processing';
  processingMessage.value = 'Creating development territory...';
  
  try {
    // Create territory using the API
    const result = await territoryStore.createTerritoryFromGeometry(
      projectName.value,
      drawnGeometry.value,
      true
    );
    
    if (result.success) {
      createdTerritory.value = result.territory_id;
      
      // Set territory in project data
      projectData.value.territory = result.territory_id;
      
      // Check if potential phases were detected
      if (result.potential_phases && result.potential_phases.length > 0) {
        potentialPhases.value = result.potential_phases;
        currentStep.value = 'phases-detected';
      } else {
        // Proceed to project details step
        currentStep.value = 'project-details';
      }
    } else {
      throw new Error(result.message || 'Failed to create territory');
    }
    
  } catch (error) {
    handleError(error, 'Failed to create development territory');
  } finally {
    processing.value = false;
  }
}

async function createPhaseTerritory() {
  if (!drawnGeometry.value || !projectName.value.trim() || !parentProjectTerritory.value) {
    return;
  }
  
  processing.value = true;
  currentStep.value = 'processing';
  processingMessage.value = 'Creating phase territory...';
  
  try {
    // Create phase using the API
    const result = await territoryStore.createPhaseForProject(
      parentProjectTerritory.value,
      projectName.value,
      drawnGeometry.value
    );
    
    if (result.success) {
      createdTerritory.value = result.phase_id;
      
      // Set territory in project data
      projectData.value.territory = result.phase_id;
      
      // Proceed to project details step
      currentStep.value = 'project-details';
    } else {
      throw new Error(result.message || 'Failed to create phase');
    }
    
  } catch (error) {
    handleError(error, 'Failed to create phase territory');
  } finally {
    processing.value = false;
  }
}

// Finalize project creation
async function finalizeProjectCreation() {
  if (!projectData.value.project_name || !projectData.value.developer || !projectData.value.territory) {
    return;
  }
  
  processing.value = true;
  currentStep.value = 'processing';
  processingMessage.value = 'Creating project...';
  
  try {
    // Create project
    const result = await projectStore.createProject(projectData.value);
    
    createdProjectId.value = result.name;
    
    // Set success message
    if (projectType.value === 'phase') {
      successMessage.value = 'Your phase has been created successfully.';
    } else {
      successMessage.value = 'Your project has been created successfully.';
    }
    
    // Go to success step
    currentStep.value = 'success';
    
    // Emit project created event
    emit('project-created', result);
    
  } catch (error) {
    handleError(error, 'Failed to create project');
  } finally {
    processing.value = false;
  }
}

// Convert detected territories to phases
async function convertToPhases() {
  if (!createdTerritory.value) {
    return;
  }
  
  processing.value = true;
  processingMessage.value = 'Converting territories to phases...';
  
  try {
    const result = await territoryStore.convertToPhasesForProject(createdTerritory.value);
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: result.message || 'Territories converted to phases successfully',
        life: 3000
      });
      
      // Proceed to project details step
      currentStep.value = 'project-details';
    } else {
      throw new Error(result.message || 'Failed to convert phases');
    }
    
  } catch (error) {
    handleError(error, 'Failed to convert territories to phases');
  } finally {
    processing.value = false;
  }
}

// Skip phase conversion
function skipPhaseConversion() {
  // Just proceed to project details step
  currentStep.value = 'project-details';
}

// View created project
function viewCreatedProject() {
  if (createdProjectId.value) {
    closeDialog();
    router.push(`/projects/${createdProjectId.value}`);
  }
}

// Handle errors
function handleError(error, defaultMessage) {
  console.error(error);
  
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: error.message || defaultMessage,
    life: 5000
  });
  
  // Go back to previous step
  goToPreviousStep();
}

// Reset dialog
function resetForm() {
  currentStep.value = 'type-selection';
  projectType.value = null;
  projectScale.value = null;
  selectedParentProject.value = null;
  parentProjectGeometry.value = null;
  parentProjectTerritory.value = null;
  selectedPoint.value = null;
  drawnGeometry.value = null;
  createdTerritory.value = null;
  projectName.value = '';
  potentialPhases.value = [];
  processingMessage.value = 'Creating territory...';
  successMessage.value = 'Your project has been created successfully.';
  createdProjectId.value = null;
  
  projectData.value = {
    project_name: '',
    territory: null,
    developer: null,
    project_amenities: null,
    handover_quarter: null,
    handover_year: null,
    status: 'Off-plan',
    availability: 'Available',
    cover_image: null
  };
}

// Close dialog
function closeDialog() {
  resetForm();
  emit('update:visible', false);
}
</script>

<style scoped>
.project-creation-dialog :deep(.p-dialog-content) {
  overflow: hidden;
  border-radius: 8px;
  padding: 0 0 1rem 0;
}

.stepper {
  display: flex;
  margin: 0.5rem 0 0;
}

.step-item {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-item:not(:last-child):after {
  content: '';
  position: absolute;
  height: 2px;
  background-color: var(--surface-300);
  left: 3rem;
  right: 0;
  top: 1.25rem;
  z-index: 0;
}

.step-item.active:not(:last-child):after {
  background-color: var(--primary-color);
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--surface-200);
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
  z-index: 1;
  transition: all 0.2s ease;
}

.step-item.active .step-number {
 background-color: var(--primary-color);
 color: var(--primary-color-text);
}

.step-item.current .step-number {
 box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.2);
}

.step-label {
 font-weight: 500;
 color: var(--text-color-secondary);
 transition: all 0.2s ease;
}

.step-item.current .step-label {
 color: var(--text-900);
 font-weight: 600;
}

.creation-dialog-content {
 min-height: 320px;
 padding: 1.5rem;
}

.step-container {
 min-height: 280px;
 display: flex;
 flex-direction: column;
}

.option-cards {
 display: flex;
 justify-content: center;
 gap: 1.5rem;
 margin: 1rem 0;
 flex-wrap: wrap;
}

.option-card {
 width: 240px;
 cursor: pointer;
 transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
 border: 2px solid transparent;
 border-radius: 12px;
 overflow: hidden;
}

.option-card:hover {
 transform: translateY(-4px);
 box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.1);
}

.option-card.selected {
 border-color: var(--primary-color);
 background-color: rgba(var(--primary-color-rgb), 0.05);
 transform: translateY(-4px);
}

.card-content {
 display: flex;
 flex-direction: column;
 align-items: center;
 text-align: center;
 padding: 1.5rem 1rem;
}

.icon-container {
 display: flex;
 justify-content: center;
 align-items: center;
 height: 60px;
 width: 60px;
 border-radius: 50%;
 background-color: rgba(var(--primary-color-rgb), 0.1);
 color: var(--primary-color);
 margin-bottom: 1rem;
}

.icon-container i {
 font-size: 1.5rem;
}

.card-content h3 {
 margin: 0 0 0.5rem 0;
 font-size: 1.1rem;
 font-weight: 600;
}

.card-content p {
 margin: 0;
 font-size: 0.9rem;
 color: var(--text-color-secondary);
 line-height: 1.4;
}

.form-section {
 margin-bottom: 1.5rem;
}

.field-label {
 display: block;
 margin-bottom: 0.5rem;
 font-weight: 500;
 color: var(--text-700);
}

.helper-text {
 display: flex;
 align-items: center;
 font-size: 0.875rem;
 color: var(--text-color-secondary);
 margin: 0.5rem 0;
}

.map-container {
 height: 380px;
 border-radius: 8px;
 overflow: hidden;
 border: 1px solid var(--surface-200);
 flex-grow: 1;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-box {
 padding: 1rem;
 background-color: rgba(var(--blue-100), 0.5);
 border-radius: 8px;
 display: flex;
 align-items: center;
}

.phase-items {
 list-style: none;
 padding: 0;
 margin: 1rem 0;
}

.phase-item {
 padding: 0.75rem 1rem;
 margin-bottom: 0.5rem;
 background-color: var(--surface-50);
 border-radius: 6px;
 display: flex;
 align-items: center;
 border-left: 3px solid var(--primary-color);
}

.question-prompt {
 font-size: 1.1rem;
 color: var(--text-700);
 font-weight: 500;
}

.processing-container, .success-container {
 display: flex;
 justify-content: center;
 align-items: center;
 min-height: 260px;
}

.processing-content, .success-content {
 display: flex;
 flex-direction: column;
 align-items: center;
 text-align: center;
 padding: 2rem;
}

.success-icon {
 display: flex;
 justify-content: center;
 align-items: center;
 height: 80px;
 width: 80px;
 border-radius: 50%;
 background-color: rgba(var(--green-500), 0.1);
 color: var(--green-500);
}

.success-icon i {
 font-size: 2.5rem;
}

.action-buttons {
 display: flex;
 gap: 0.5rem;
}

.flex-grow-1 {
 flex-grow: 1;
}
</style>