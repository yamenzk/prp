<template>
  <Card 
    class="project-card" 
    style="height: 100%" 
    @click="navigateToProject"
  >
    <template #header>
      <div class="project-image-container">
        <img 
          :src="project.cover_image || defaultCoverImage" 
          :alt="project.project_name" 
          class="project-image"
        />
      </div>
    </template>
    <template #title>
      {{ project.project_name }}
    </template>
    <template #subtitle>
      <div class="flex align-items-center gap-2">
        <span>{{ project.developer }}</span>
        <Tag 
          :severity="getStatusSeverity(project.status)" 
          class="ml-auto"
        >
          {{ project.status || 'Off-plan' }}
        </Tag>
      </div>
    </template>
    <template #content>
      <div class="project-details">
        <div class="detail-row">
          <i class="pi pi-map-marker"></i>
          <span>{{ project.territory }}</span>
        </div>
        <div class="detail-row">
          <i class="pi pi-calendar"></i>
          <span v-if="project.handover_year">
            {{ getHandoverText(project.handover_quarter, project.handover_year) }}
          </span>
          <span v-else>Handover date not specified</span>
        </div>
        <div class="detail-row">
          <i class="pi pi-tag"></i>
          <span>{{ project.availability || 'Unknown' }}</span>
        </div>
      </div>
    </template>
    <template #footer>
      <Button 
        label="View Details" 
        class="w-full p-button-outlined"
        @click.stop="navigateToProject"
      />
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const defaultCoverImage = '/images/project-placeholder.jpg'; // Replace with your default image

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

// Compute status severity for the tag color
const getStatusSeverity = (status) => {
  if (!status) return 'info';
  
  switch(status) {
    case 'Off-plan':
      return 'info';
    case 'Due for Handover':
      return 'warning';
    case 'Handover Completed':
      return 'success';
    default:
      return 'info';
  }
};

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
.project-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.project-image-container {
  height: 200px;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row i {
  color: var(--primary-color, #3B82F6);
}
</style>