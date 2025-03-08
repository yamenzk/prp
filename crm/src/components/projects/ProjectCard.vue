<template>
  <div class="pd-project-card" @click="navigateToProject">
    <!-- Image section -->
    <div class="pd-card-image-container">
      <img 
        v-if="project.cover_image" 
        :src="project.cover_image" 
        :alt="project.project_name" 
        class="pd-card-image"
      />
      <!-- Placeholder when no image is available -->
      <div v-else class="pd-card-image-placeholder">
        <i class="pi pi-building"></i>
      </div>
      
      <!-- Status badge -->
      <div class="pd-status-badge" :class="statusClass">
        {{ project.status || 'Off-plan' }}
      </div>
    </div>
    
    <!-- Content section -->
    <div class="pd-card-content">
      <!-- Parent project indicator -->
      <div v-if="project.is_phase && project.parent_project" class="pd-parent-project">
        <div class="pd-avatar">
          <i class="pi pi-building"></i>
        </div>
        <span>{{ project.parent_project }}</span>
      </div>
      
      <!-- Title and developer -->
      <h3 class="pd-card-title">{{ project.project_name }}</h3>
      <p class="pd-card-developer">{{ project.developer }}</p>
      
      <!-- Details -->
      <div class="pd-card-details">
        <div class="pd-detail-item">
          <i class="pi pi-map-marker"></i>
          <span>{{ project.territory }}</span>
        </div>
        
        <div class="pd-detail-item">
          <i class="pi pi-calendar"></i>
          <span>{{ getHandoverText(project.handover_quarter, project.handover_year) }}</span>
        </div>
        
        <div class="pd-detail-item">
          <i class="pi pi-tag"></i>
          <span>{{ project.availability || 'Unknown' }}</span>
        </div>
      </div>
    </div>
    
    <!-- View button (visible on hover) -->
    <div class="pd-card-hover-content">
      <button class="pd-view-button">View Details</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

// Compute status class for the badge
const statusClass = computed(() => {
  if (!props.project.status) return 'pd-status-info';
  
  switch(props.project.status) {
    case 'Off-plan':
      return 'pd-status-info';
    case 'Due for Handover':
      return 'pd-status-warning';
    case 'Handover Completed':
      return 'pd-status-success';
    default:
      return 'pd-status-info';
  }
});

// Format handover text nicely
const getHandoverText = (quarter, year) => {
  if (!quarter || !year) return 'Handover date not specified';
  return `Q${quarter} ${year}`;
};

// Navigate to project details
const navigateToProject = () => {
  router.push(`/projects/${props.project.name}`);
};
</script>

<style scoped>
.pd-project-card {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--pd-bg-base);
  box-shadow: 0 1px 3px var(--pd-shadow-color);
  transition: all 0.3s ease;
  cursor: pointer;
}

.pd-project-card:hover {
  box-shadow: 0 8px 24px var(--pd-shadow-color-strong);
  transform: translateY(-4px);
}

/* Image section */
.pd-card-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.pd-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.pd-project-card:hover .pd-card-image {
  transform: scale(1.05);
}

/* Image placeholder */
.pd-card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--pd-bg-surface) 0%, var(--pd-bg-surface-hover) 100%);
  position: relative;
  overflow: hidden;
}

.pd-card-image-placeholder::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.03) 10px,
    rgba(0, 0, 0, 0.03) 20px
  );
  animation: placeholderAnimation 30s linear infinite;
  opacity: 0.5;
}

.pd-card-image-placeholder i {
  font-size: 2.5rem;
  color: var(--pd-text-tertiary);
  z-index: 1;
  opacity: 0.6;
}

@keyframes placeholderAnimation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Status badge */
.pd-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pd-status-info {
  background-color: rgba(0, 122, 255, 0.2);
  color: rgb(0, 122, 255);
}

.pd-status-warning {
  background-color: rgba(255, 149, 0, 0.2);
  color: rgb(255, 149, 0);
}

.pd-status-success {
  background-color: rgba(52, 199, 89, 0.2);
  color: rgb(52, 199, 89);
}

/* Content section */
.pd-card-content {
  padding: 1.25rem;
}

.pd-parent-project {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.pd-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--pd-badge-bg);
  color: var(--pd-badge-text);
  font-size: 0.65rem;
}

.pd-parent-project span {
  font-size: 0.75rem;
  color: var(--pd-text-tertiary);
  font-weight: 500;
}

.pd-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--pd-text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.pd-card-developer {
  font-size: 0.9rem;
  color: var(--pd-text-secondary);
  margin: 0 0 1rem 0;
  font-weight: 400;
}

/* Details section */
.pd-card-details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pd-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--pd-text-tertiary);
}

.pd-detail-item i {
  font-size: 0.875rem;
  color: var(--pd-text-tertiary);
  width: 16px;
  display: flex;
  justify-content: center;
}

/* Hover content with view button */
.pd-card-hover-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.25rem;
  background: linear-gradient(to top, var(--pd-bg-base) 60%, transparent);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.pd-project-card:hover .pd-card-hover-content {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.pd-view-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background-color: var(--pd-text-primary);
  color: var(--pd-bg-base);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pd-view-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--pd-shadow-color);
}

/* Dark mode specific adjustments */
.dark .pd-status-info {
  background-color: rgba(10, 132, 255, 0.25);
  color: rgb(10, 132, 255);
}

.dark .pd-status-warning {
  background-color: rgba(255, 159, 10, 0.25);
  color: rgb(255, 159, 10);
}

.dark .pd-status-success {
  background-color: rgba(48, 209, 88, 0.25);
  color: rgb(48, 209, 88);
}

.dark .pd-card-image-placeholder {
  background: linear-gradient(135deg, var(--pd-bg-surface) 0%, var(--pd-bg-surface-hover) 100%);
}

.dark .pd-card-image-placeholder::before {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.03) 20px
  );
}
</style>