<template>
	<div v-if="!currentProject" class="m-auto h-full">
		<Panel class="m-8" pt:root:class="!border-0 !bg-white dark:!bg-zinc-800">
			<div class="flex flex-col items-center justify-center h-full text-center py-12">
				<FeatherIcon
					name="layout"
					class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4"
				/>
				<h3 class="text-xl font-medium text-tertiary mb-2">No Project Selected</h3>
				<p class="text-tertiary max-w-sm">Select a project to view its details.</p>
			</div>
		</Panel>
	</div>
	<div v-else class="w-full h-full flex flex-col">
		<div
			class="project-header border-b border-gray-200 dark:border-zinc-700 flex-none"
			style="padding: var(--p-datatable-header-padding)"
		>
			<div class="flex items-center justify-between p-4">
				<div>
					<h2 class="text-xl font-bold">
						{{ currentProject.project_name }}
					</h2>
				</div>
				<div class="flex gap-1 items-center">
					<Button
						@click="switchTab('info')"
						rounded
						icon="pi pi-info-circle"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'info'"
						v-tooltip.top="'Info'"
					/>
					<Button
						@click="switchTab('notes')"
						rounded
						icon="pi pi-clipboard"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'notes'"
						v-tooltip.top="'Notes'"
					/>
					<Button
						@click="switchTab('version')"
						rounded
						icon="pi pi-history"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'version'"
						v-tooltip.top="'History'"
					/>
					<Button
						@click="switchTab('documents')"
						rounded
						icon="pi pi-file"
						class="w-8 h-8 p-0"
						:outlined="currentTab !== 'documents'"
						v-tooltip.top="'Documents'"
					/>
				</div>
			</div>
		</div>
		<div class="flex-grow overflow-hidden">
			<Tabs v-model:value="currentTab" class="h-full flex flex-col">
				<TabPanels class="h-full">
					<TabPanel value="info">
						<div class="h-full overflow-auto">
							<div class="p-4">
								<ProjectInfoTab
									:project="currentProject"
									@edit-field="openEditDialog"
								/>
							</div>
						</div>
					</TabPanel>
					<TabPanel value="notes">
						<div class="h-full overflow-auto">
							<NoteTab :doctype="'PRP Project'" :docname="currentProject.name" />
						</div>
					</TabPanel>
					<TabPanel value="version">
						<div class="h-full overflow-hidden">
							<ProjectVersionTab :project="currentProject" />
						</div>
					</TabPanel>
					<TabPanel value="documents">
						<div class="h-full overflow-auto">
							<ProjectDocumentsTab :project="currentProject" />
						</div>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</div>
	</div>

	<!-- Project Edit Dialog -->
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

	<!-- Project Delete Confirmation Dialog -->
	<DeleteDialog
		v-model:visible="deleteDialogVisible"
		title="Delete Project"
		message="This action cannot be undone. To confirm deletion, please type the project name below:"
		confirm-field="project_name"
		:confirm-value="currentProject?.project_name"
		delete-button-label="Delete Project"
		@confirm="confirmDeleteProject"
	/>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import ProjectInfoTab from './tabs/ProjectInfoTab.vue'
import ProjectDocumentsTab from './tabs/ProjectDocumentsTab.vue'
import NoteTab from './tabs/NoteTab.vue'
import ProjectVersionTab from './tabs/ProjectVersionTab.vue'

// Store references
const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()

// Emitter for component communication
const emitter = inject('emitter')

// Tab state
const currentTab = ref('info')

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
const currentProject = computed(() => projectStore.currentProject)

// Handle tab switching with routing
const switchTab = (tabId) => {
	if (currentProject.value) {
		currentTab.value = tabId
		router.push({
			name: 'ProjectTabDetails',
			params: {
				id: currentProject.value.name,
				tabId: tabId,
			},
		})
	}
}

// Listen for project selection and router changes
onMounted(() => {
	// Listen for project selection events
	emitter.on('project-selected', async (project) => {
		await projectStore.fetchProject(project.name)

		// If we have a tab in the URL params, use that
		if (route.params.tabId) {
			// Update active tab based on route
			currentTab.value = route.params.tabId
		}

		// If we're not on the project tab route, update URL to include current tab
		if (route.name !== 'ProjectTabDetails') {
			const tabId = route.params.tabId || currentTab.value
			router.push({
				name: 'ProjectTabDetails',
				params: {
					id: project.name,
					tabId: tabId,
				},
			})
		}
	})

	// Check for tab param on initial load
	if (route.params.tabId) {
		currentTab.value = route.params.tabId
	}
})

// Watch for route changes to update the active tab
watch(
	() => route.params.tabId,
	(newTabId) => {
		if (newTabId) {
			currentTab.value = newTabId
		}
	},
)

// Methods for handling project status
const getStatusSeverity = (status) => {
	switch (status) {
		case 'Completed':
			return 'success'
		case 'On Hold':
			return 'warning'
		case 'Canceled':
			return 'danger'
		default:
			return 'info' // 'Active' is default
	}
}

const getStatusIcon = (status) => {
	switch (status) {
		case 'Completed':
			return 'pi pi-check-circle'
		case 'On Hold':
			return 'pi pi-pause'
		case 'Canceled':
			return 'pi pi-times-circle'
		default:
			return 'pi pi-clock' // 'Active' is default
	}
}

// Methods for Project Management
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
	}

	dialogVisible.value = true
}

const handleDialogSave = async ({ fieldName, value }) => {
	if (!currentProject.value || !fieldName) return

	try {
		const updateData = {
			[fieldName]: value,
		}

		await projectStore.updateProject(currentProject.value.name, updateData)
		await projectStore.refreshCurrentProject()
	} catch (error) {
		console.error('Error updating project field:', error)
		await projectStore.refreshCurrentProject()
	}
}

const confirmDeleteProject = async () => {
	if (!currentProject.value) return

	try {
		await projectStore.deleteProject(currentProject.value.name)
		deleteDialogVisible.value = false
		emitter.emit('project-deleted')

		// Navigate back to projects list
		router.push({ name: 'Projects' })
	} catch (error) {
		console.error('Error deleting project:', error)
	}
}
</script>

<style scoped>
/* Ensure all height-related containers properly cascade the height */
:deep(.p-tabs),
:deep(.p-tabpanels),
:deep(.p-tabpanel) {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

:deep(.p-tabpanel) > div {
	flex: 1;
}
</style>
