<!-- Updated components/projects/ProjectList.vue -->
<template>
  <div class="projects-container">
    <div class="projects-header">
      <h1>Projects</h1>
      <div class="projects-actions">
        <Button 
          label="New Project" 
          icon="pi pi-plus" 
          @click="showNewProjectDialog"
        />
        <Button 
          icon="pi pi-filter" 
          @click="showFilters = !showFilters"
          class="p-button-outlined ml-2"
          :class="{ 'p-button-info': showFilters }"
        />
      </div>
    </div>

    <!-- Filters panel -->
    <div v-if="showFilters" class="filters-panel p-3 mb-3">
      <div class="grid">
        <div class="col-12 md:col-4">
          <span class="p-float-label">
            <Dropdown 
              v-model="filters.territory" 
              :options="territories" 
              optionLabel="name_en"
              optionValue="name"
              inputId="territory"
              @change="applyFilters"
              class="w-full"
            />
            <label for="territory">Territory</label>
          </span>
        </div>
        <div class="col-12 md:col-4">
          <span class="p-float-label">
            <Dropdown 
              v-model="filters.developer" 
              :options="developers" 
              optionLabel="name"
              optionValue="name"
              inputId="developer"
              @change="applyFilters"
              class="w-full"
            />
            <label for="developer">Developer</label>
          </span>
        </div>
        <div class="col-12 md:col-4">
          <span class="p-float-label">
            <Dropdown 
              v-model="filters.status" 
              :options="statusOptions" 
              inputId="status"
              @change="applyFilters"
              class="w-full"
            />
            <label for="status">Status</label>
          </span>
        </div>
      </div>
      <div class="flex justify-content-end mt-3">
        <Button 
          label="Clear" 
          icon="pi pi-times" 
          @click="clearFilters"
          class="p-button-outlined p-button-secondary mr-2"
        />
        <Button 
          label="Apply" 
          icon="pi pi-check" 
          @click="applyFilters"
        />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid">
      <div v-for="i in 6" :key="i" class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
        <Skeleton height="400px" />
      </div>
    </div>
    
    <!-- Error message -->
    <Message 
      v-else-if="error" 
      severity="error" 
      :closable="false" 
      style="margin-bottom: 1rem"
    >
      {{ errorMessage }}
    </Message>
    
    <!-- No results -->
    <div v-else-if="!projects.length" class="empty-state">
      <i class="pi pi-building text-5xl text-color-secondary mb-3"></i>
      <h3>No projects found</h3>
      <p>Try adjusting your filters or add a new project.</p>
      <Button 
        label="Add Project" 
        icon="pi pi-plus" 
        @click="showNewProjectDialog"
        class="mt-3"
      />
    </div>
    
    <!-- Projects grid -->
    <div v-else class="grid">
      <div 
        v-for="project in projects" 
        :key="project.name" 
        class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2"
      >
        <ProjectCard :project="project" />
      </div>
    </div>

    <!-- Load more -->
    <div v-if="hasMoreProjects" class="flex justify-content-center mt-4">
      <Button 
        label="Load More" 
        @click="loadMore"
        :loading="loadingMore"
        class="p-button-outlined"
      />
    </div>

    <!-- Project creation dialog -->
    <ProjectCreationDialog
      v-model:visible="showCreationDialog"
      @project-created="onProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ProjectCard from './ProjectCard.vue';
import ProjectCreationDialog from './ProjectCreationDialog.vue';
import { useProjectStore } from '@/stores/project';
import { useTerritoryStore } from '@/stores/territory';

// State
const showFilters = ref(false);
const filters = ref({
  territory: null,
  developer: null,
  status: null
});
const loadingMore = ref(false);
const showCreationDialog = ref(false);

// Stores
const projectStore = useProjectStore();
const territoryStore = useTerritoryStore();

// Status options
const statusOptions = ref([
  { label: 'All', value: null },
  { label: 'Off-plan', value: 'Off-plan' },
  { label: 'Due for Handover', value: 'Due for Handover' },
  { label: 'Handover Completed', value: 'Handover Completed' }
]);

// Computed properties
const projects = computed(() => projectStore.projects);
const loading = computed(() => projectStore.isLoading);
const error = computed(() => projectStore.hasError);
const errorMessage = computed(() => projectStore.errorMessage);
const hasMoreProjects = computed(() => projectStore.hasMoreProjects);
const territories = computed(() => territoryStore.projectTerritories);

// We'd need to get developers from another store, but for now let's mock it
const developers = ref([
  { label: 'All', value: null },
  // You would populate this from your developer store
]);

// Functions
function showNewProjectDialog() {
  showCreationDialog.value = true;
}

function onProjectCreated(project) {
  // Refresh project list after a new project is created
  projectStore.refetchProjects();
}

const applyFilters = async () => {
  // Convert filters to format expected by the store
  const filterData = {};
  
  if (filters.value.territory) {
    filterData.territory = filters.value.territory;
  }
  
  if (filters.value.developer) {
    filterData.developer = filters.value.developer;
  }
  
  if (filters.value.status) {
    filterData.status = filters.value.status;
  }
  
  // Apply filters
  await projectStore.updateFilters(filterData);
};

const clearFilters = async () => {
  filters.value = {
    territory: null,
    developer: null,
    status: null
  };
  await projectStore.resetFilters();
};

const loadMore = async () => {
  loadingMore.value = true;
  try {
    await projectStore.loadMoreProjects();
  } finally {
    loadingMore.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // Load projects
  if (!projects.value.length) {
    await projectStore.fetchProjects();
  }
  
  // Load territories for filter
  if (!territories.value.length) {
    await territoryStore.fetchTerritories();
  }
  
  // Here you'd also load developers from your developer store
});
</script>


<style scoped>
.projects-container {
  padding: 1rem;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-panel {
  background-color: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: var(--surface-card);
  border-radius: 8px;
  margin-top: 2rem;
}
</style>