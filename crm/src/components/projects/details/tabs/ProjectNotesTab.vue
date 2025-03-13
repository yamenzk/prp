<template>
	<NotesView :doctype="'PRP Project'" :docname="projectId" title="Project Notes" />
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import NotesView from '@/apps/notes/common/NotesView.vue'

// Use the store
const projectStore = useProjectStore()

// Use computed property for project ID
const projectId = computed(() => projectStore.currentProject?.name || '')
</script>
