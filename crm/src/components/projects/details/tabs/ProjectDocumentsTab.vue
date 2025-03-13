<template>
  <div class="documents-tab">
    <DocumentViewer
      :relDoctype="'PRP Project'"
      :relDocname="projectId"
      title="Project Documents"
      :recommendedTags="['cover_image', 'project_brochure', 'contract']"
      :showExpiryDate="false"
      :showIssueDate="false"
      :showPlaceOfIssue="false"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import DocumentViewer from '@/components/common/DocumentViewer.vue'

// Use the store
const projectStore = useProjectStore()

// Use computed properties instead of local state
const currentProject = computed(() => projectStore.currentProject)
const projectId = computed(() => currentProject.value?.name || '')
</script>

<style scoped>
.documents-tab {
  height: 100%;
  overflow: auto;
}
</style>