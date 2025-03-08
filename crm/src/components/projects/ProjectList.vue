<template>
  <div class="pd-projects-container">
    <!-- Header section with search bar -->
    <header class="pd-header">
      <div class="pd-search-container">
        <div class="pd-search-input-wrapper">
          <i class="pi pi-search pd-search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search projects..." 
            class="pd-search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" class="pd-search-clear" @click="clearSearch">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      <div class="pd-actions">
        <button 
          class="pd-button-icon" 
          @click="showFilters = !showFilters" 
          :class="{ 'active': showFilters, 'has-active-filters': hasActiveFilters }"
        >
          <i class="pi pi-filter"></i>
        </button>
        <button class="pd-button-icon" style="background: var(--pd-text-primary)" @click="showNewProjectDialog">
          <i class="pi pi-plus text-zinc-100 dark:text-zinc-900"></i>
        </button>
      </div>
    </header>

    <!-- Filters panel with smooth transition -->
    <transition name="slide-fade">
      <div v-if="showFilters" class="pd-filters-panel">
        <div class="pd-filters-grid">
      <div class="pd-filter-item">
        <FormField
          v-model="filters.territory"
          type="select"
          label="Territory"
          :options="territoryOptions"
          icon="pi pi-map-marker"
          id="territory"
          :disabled="loading"
        />
      </div>
      <div class="pd-filter-item">
        <FormField
          v-model="filters.developer"
          type="link"
          label="Developer"
          doctype="PRP Developer"
          displayField="developer_name" 
          icon="pi pi-building"
          id="developer"
          :disabled="loading"
        />
      </div>
      <div class="pd-filter-item">
        <FormField
          v-model="filters.status"
          type="select"
          label="Status"
          :options="statusOptions"
          icon="pi pi-tag"
          id="status"
          :disabled="loading"
        />
      </div>
    </div>
        <div class="pd-filters-actions">
          <button class="pd-button-secondary" @click="clearFilters">
            <i class="pi pi-times"></i>
            <span>Clear</span>
          </button>
          <button class="pd-button-primary" @click="applyFilters">
            <i class="pi pi-check"></i>
            <span>Apply</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Loading skeleton -->
    <div v-if="loading" class="pd-grid">
      <div v-for="i in 6" :key="i" class="pd-grid-item">
        <div class="pd-skeleton-card">
          <div class="pd-skeleton-image"></div>
          <div class="pd-skeleton-content">
            <div class="pd-skeleton-line pd-skeleton-title"></div>
            <div class="pd-skeleton-line"></div>
            <div class="pd-skeleton-line"></div>
            <div class="pd-skeleton-line pd-skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="pd-error-message">
      <i class="pi pi-exclamation-circle"></i>
      <p>{{ errorMessage }}</p>
    </div>
    
    <!-- No results state -->
    <div v-else-if="!projects.length" class="pd-empty-state">
      <div class="pd-empty-icon">
        <i class="pi pi-building"></i>
      </div>
      <h3>No projects found</h3>
      <p>Try adjusting your filters or add a new project.</p>
      <button class="pd-button-primary" @click="showNewProjectDialog">
        <i class="pi pi-plus"></i>
        <span>Add Project</span>
      </button>
    </div>
    
    <!-- Projects grid -->
    <div v-else class="pd-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.name" 
        class="pd-grid-item"
      >
        <ProjectCard :project="project" />
      </div>
    </div>

    <!-- Load more button -->
    <div v-if="hasMoreProjects" class="pd-load-more">
      <button class="pd-button-secondary" @click="loadMore" :disabled="loadingMore">
        <span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
        <i v-if="!loadingMore" class="pi pi-chevron-down"></i>
        <i v-else class="pi pi-spin pi-spinner"></i>
      </button>
    </div>

    <!-- Project creation dialog -->
    <ProjectCreationDialog
      v-model:visible="showCreationDialog"
      @project-created="onProjectCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ProjectCard from './ProjectCard.vue';
import ProjectCreationDialog from './ProjectCreationDialog.vue';
import { useProjectStore } from '@/stores/project';
import { useTerritoryStore } from '@/stores/territory';
import FormField from '@/components/common/FormField.vue';

// State
const showFilters = ref(false);
const filters = ref({
  territory: null,
  developer: null,
  status: null
});
const searchQuery = ref('');
const searchDebounceTimeout = ref(null);
const loadingMore = ref(false);
const showCreationDialog = ref(false);

// Stores
const projectStore = useProjectStore();
const territoryStore = useTerritoryStore();

// Status options
const statusOptions = [' ', 'Off-Plan', 'Due for Handover', 'Handover Completed' ]

const territoryOptions = computed(() => {
  if (!territories.value || !territories.value.length) {
    return [{ value: null, label: 'All Territories' }];
  }
  
  return [
    { value: null, label: 'All Territories' },
    ...territories.value.map(territory => ({
      value: territory.name,
      label: territory.name_en || territory.name
    }))
  ];
});

// Computed properties
const projects = computed(() => projectStore.projects);
const loading = computed(() => projectStore.isLoading);
const error = computed(() => projectStore.hasError);
const errorMessage = computed(() => projectStore.errorMessage);
const hasMoreProjects = computed(() => projectStore.hasMoreProjects);
const territories = computed(() => territoryStore.projectTerritories);

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.territory !== null || 
         filters.value.developer !== null || 
         filters.value.status !== null;
});

// Filter out parent projects that have phases
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    return !project.has_phases;
  });
});


// Functions
function showNewProjectDialog() {
  showCreationDialog.value = true;
}

function onProjectCreated(project) {
  // Refresh project list after a new project is created
  projectStore.refetchProjects();
}

// Search handling with debounce
function handleSearch() {
  clearTimeout(searchDebounceTimeout.value);
  searchDebounceTimeout.value = setTimeout(() => {
    projectStore.updateSearch(searchQuery.value);
  }, 300); // Debounce for 300ms
}

function clearSearch() {
  searchQuery.value = '';
  projectStore.updateSearch('');
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
  
  // Apply filters and close filter panel
  await projectStore.updateFilters(filterData);
  showFilters.value = false;
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

<style>
/* Apple-inspired styling */
.pd-projects-container {
  margin: 0 auto;
  padding: 2rem;
}

/* Header styling */
.pd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--pd-border-light);
}

/* Search styling */
.pd-search-container {
  flex: 1;
  max-width: 600px;
}

.pd-search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.pd-search-icon {
  position: absolute;
  left: 12px;
  color: var(--pd-text-secondary);
  font-size: 1rem;
}

.pd-search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  font-size: 1rem;
  background-color: var(--pd-bg-surface);
  border: 1px solid var(--pd-border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  color: var(--pd-text-primary);
}

.pd-search-input:focus {
  outline: none;
  border-color: var(--pd-border-medium);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

.pd-search-input::placeholder {
  color: var(--pd-text-secondary);
  opacity: 0.7;
}

.pd-search-clear {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--pd-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.pd-search-clear:hover {
  opacity: 1;
  background-color: var(--pd-bg-surface-hover);
}

.pd-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Button styling */
.pd-button-primary {
  background-color: var(--pd-bg-base);
  color: var(--pd-text-primary);
  border: 1px solid var(--pd-border-medium);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px var(--pd-shadow-color);
}

.pd-button-primary:hover {
  background-color: var(--pd-bg-surface-hover);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px var(--pd-shadow-color);
}

.pd-button-primary i {
  font-size: 0.9rem;
}

.pd-button-secondary {
  background-color: transparent;
  color: var(--pd-text-secondary);
  border: 1px solid var(--pd-border-light);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pd-button-secondary:hover {
  background-color: var(--pd-bg-surface-hover);
  color: var(--pd-text-primary);
}

.pd-button-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--pd-border-light);
  background-color: var(--pd-bg-base);
  color: var(--pd-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px var(--pd-shadow-color);
  position: relative;
}

.pd-button-icon:hover {
  background-color: var(--pd-bg-surface-hover);
  color: var(--pd-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px var(--pd-shadow-color);
}

.pd-button-icon.active {
  background-color: var(--pd-text-primary);
  color: var(--pd-bg-base);
  border-color: var(--pd-text-primary);
}

.pd-button-icon.has-active-filters:not(.active)::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: var(--pd-text-primary);
  border-radius: 50%;
  border: 2px solid var(--pd-bg-base);
}

/* Filters panel */
.pd-filters-panel {
  background-color: var(--pd-bg-surface);
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--pd-shadow-color-strong);
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  overflow: hidden;
}

.pd-filters-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .pd-filters-grid {
    grid-template-columns: 1fr;
  }
  
  .pd-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .pd-actions {
    justify-content: flex-end;
  }
  
  .pd-search-container {
    max-width: 100%;
  }
}

.pd-filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pd-filter-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--pd-text-secondary);
}

.pd-dropdown {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--pd-border-medium);
  transition: all 0.2s ease;
  background-color: var(--pd-bg-base);
}

.pd-dropdown:hover {
  border-color: var(--pd-border-medium);
}

.pd-filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--pd-border-light);
}

/* Transition animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Grid layout */
.pd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.pd-grid-item {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.pd-grid-item:hover {
  transform: translateY(-4px);
}

/* Loading skeletons */
.pd-skeleton-card {
  background-color: var(--pd-bg-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px var(--pd-shadow-color);
  height: 100%;
}

.pd-skeleton-image {
  height: 180px;
  background-color: var(--pd-border-light);
  animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.pd-skeleton-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pd-skeleton-line {
  height: 0.875rem;
  background-color: var(--pd-border-light);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.pd-skeleton-title {
  height: 1.25rem;
  width: 70%;
}

.pd-skeleton-button {
  height: 2.5rem;
  margin-top: 0.5rem;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

/* Empty state */
.pd-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: var(--pd-bg-surface);
  border-radius: 12px;
  margin: 2rem 0;
}

.pd-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--pd-badge-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.pd-empty-icon i {
  font-size: 1.75rem;
  color: var(--pd-badge-text);
}

.pd-empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--pd-text-primary);
  margin: 0 0 0.5rem 0;
}

.pd-empty-state p {
  font-size: 1rem;
  color: var(--pd-text-secondary);
  margin: 0 0 1.5rem 0;
  max-width: 320px;
}

/* Error message */
.pd-error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
  border-left: 4px solid rgb(255, 59, 48);
  margin-bottom: 2rem;
}

.pd-error-message i {
  font-size: 1.25rem;
  color: rgb(255, 59, 48);
}

.pd-error-message p {
  margin: 0;
  color: var(--pd-text-primary);
  font-size: 0.95rem;
}

/* Load more button */
.pd-load-more {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}
</style>