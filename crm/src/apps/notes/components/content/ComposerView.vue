<!-- ComposerView.vue -->
<template>
	<div class="h-full flex flex-col bg-white dark:bg-zinc-900">
		<!-- Header section with title, type selector and main actions -->
		<div
			class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
		>
			<!-- Note controls bar -->
			<div class="flex items-center justify-between">
				<!-- Left controls: type selector and metadata -->
				<div class="flex items-center gap-2">
					<!-- Status tag (for all note types) -->
					<div>
						<Tag
							:value="draftNote.status || 'Backlog'"
							:severity="getStatusSeverity(draftNote.status)"
							class="cursor-pointer"
							@click="openStatusMenu($event)"
						>
							<template #icon>
								<i :class="getStatusIcon(draftNote.status)" class="mr-1"></i>
							</template>
						</Tag>

						<Menu ref="statusMenu" :model="statusItems" :popup="true" />
					</div>

					<!-- Priority tag (for Tasks) -->
					<div v-if="noteType === 'task'">
						<Tag
							:value="draftNote.priority || 'Medium'"
							:severity="getPrioritySeverity(draftNote.priority)"
							class="cursor-pointer"
							@click="openPriorityMenu($event)"
						>
							<template #icon>
								<i :class="getPriorityIcon(draftNote.priority)" class="mr-1"></i>
							</template>
						</Tag>

						<Menu ref="priorityMenu" :model="priorityItems" :popup="true" />
					</div>

					<!-- Due date (for Tasks) -->
					<div v-if="noteType === 'task'">
						<Button
							v-if="!draftNote.dueDate"
							icon="pi pi-calendar"
							size="small"
							text
							class="p-button-rounded p-button-secondary"
							@click="openDatePicker($event)"
						/>

						<Tag
							v-else
							:value="formatDateForDisplay(draftNote.dueDate)"
							:severity="isOverdue(draftNote.dueDate) ? 'danger' : 'warning'"
							class="cursor-pointer"
							@click="openDatePicker($event)"
						>
							<template #icon>
								<i class="pi pi-calendar mr-1"></i>
							</template>
						</Tag>

						<Calendar
							v-model="localDueDate"
							:visible="datePickerVisible"
							:inline="true"
							:showTime="true"
							hourFormat="24"
							dateFormat="dd/MM/yy"
							@date-select="handleDateSelect"
							@hide="handleDatePickerHide"
							panelClass="date-picker-panel"
						/>
					</div>
				</div>

				<!-- Right controls: color, icon, pin -->
				<div class="flex items-center gap-2">
					<!-- Note color picker -->
					<ColorPicker
						v-model="localColor"
						@update:modelValue="updateNoteColor"
						:pt="{
							root: { class: 'p-button-rounded' },
							input: { style: { backgroundColor: draftNote.color || '#D1D5DB' } },
						}"
					/>

					<!-- Note icon selector -->
					<Button
						class="p-button-rounded p-button-secondary"
						@click="emojiPickerVisible = true"
					>
						<template #icon>
							<span v-if="draftNote.icon" class="text-lg">{{ draftNote.icon }}</span>
							<i v-else class="pi pi-smile"></i>
						</template>
					</Button>

					<!-- Sticky/pin toggle -->
					<Button
						:icon="draftNote.sticky ? 'pi pi-star-fill' : 'pi pi-star'"
						:class="draftNote.sticky ? 'p-button-warning' : 'p-button-secondary'"
						class="p-button-rounded"
						@click="$emit('update:sticky', !draftNote.sticky)"
					/>
				</div>
			</div>
			<!-- Title input field -->
			<div class="relative my-4">
				<input
					v-model="localTitle"
					type="text"
					placeholder="Untitled"
					class="w-full text-xl font-medium border-0 border-b border-transparent outline-none focus:border-primary-300 dark:focus:border-primary-700 bg-transparent px-0 pb-1 transition-colors"
					@input="$emit('update:title', localTitle)"
				/>
			</div>
		</div>

		<!-- Editor section -->
		<div class="flex-1 overflow-hidden flex flex-col">
			<Editor
				v-model="localDetails"
				placeholder="Type something..."
				class="flex-grow editor-container"
				@text-change="handleEditorChange"
				editorStyle="height: 100%; min-height: 300px; max-height: 500px; overflow-y: auto; padding: 1rem;"
			/>
		</div>

		<!-- Footer section with action buttons -->
		<div class="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
			<Button label="Cancel" icon="pi pi-times" text @click="$emit('cancel-compose')" />
			<div>
				<MultiSelect
					v-model="localTags"
					:options="availableTags"
					:filter="true"
					optionLabel="label"
					optionValue="value"
					placeholder="Add tags"
					display="chip"
					:showToggleAll="false"
					:allowEmpty="true"
					class="w-full"
					@change="handleTagChange"
				>
					<template #option="slotProps">
						<div class="flex items-center">
							<span class="mr-2">#</span>
							<div>{{ slotProps.option.label }}</div>
						</div>
					</template>
					<template #dropdownicon>
						<i class="pi pi-tags" />
					</template>
					<template #header>
						<div class="font-medium px-3 py-2">Available Tags</div>
					</template>
					<template #footer>
						<div class="p-3 flex justify-between">
							<Button
								label="Create Tag"
								severity="secondary"
								text
								size="small"
								icon="pi pi-plus"
								@click="openTagCreationModal"
							/>
						</div>
					</template>
				</MultiSelect>
			</div>
			<Button
				label="Save"
				icon="pi pi-check"
				@click="$emit('save-note')"
				class="p-button-primary"
			/>
		</div>

		<!-- Emoji Picker Dialog -->
		<Dialog
			v-model:visible="emojiPickerVisible"
			header="Choose Icon"
			:style="{ width: '400px' }"
			modal
		>
			<div class="grid grid-cols-8 gap-2 p-3">
				<button
					v-for="emoji in commonEmojis"
					:key="emoji"
					class="w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
					@click="selectEmoji(emoji)"
				>
					{{ emoji }}
				</button>
			</div>
			<div class="px-3 pb-3">
				<InputText
					v-model="customEmoji"
					placeholder="Custom emoji or text"
					class="w-full mb-2"
				/>
				<Button label="Add Custom" @click="addCustomEmoji" class="w-full" />
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { TextEditor } from 'frappe-ui'
import { commonEmojis } from '../../utils/noteIcons'
import {
	getStatusIcon,
	getPriorityIcon,
	getStatusSeverity,
	getPrioritySeverity,
	statusOptions,
	priorityOptions,
} from '../../utils/noteStatusHelpers'
import {
	formatDateForDisplay,
	formatDateForServer,
	isOverdue,
} from '@/apps/notes/utils/noteFormatters'
const availableTags = ref([
	{ label: 'Work', value: 'work' },
	{ label: 'Personal', value: 'personal' },
	{ label: 'Important', value: 'important' },
	{ label: 'Listing', value: 'listing' },
	{ label: 'Lead', value: 'lead' },
	{ label: 'Deal', value: 'deal' },
])

// Props
const props = defineProps({
	draftNote: {
		type: Object,
		required: true,
	},
	noteType: {
		type: String,
		required: true,
	},
})

// Emits
const emit = defineEmits([
	'update:title',
	'update:details',
	'update:tags',
	'update:color',
	'update:icon',
	'update:sticky',
	'update:status',
	'update:priority',
	'update:due-date',
	'select-note-type',
	'toggle-note-type',
	'cancel-compose',
	'save-note',
])

// Local state for form values
const localTitle = ref(props.draftNote.title || '')
const localDetails = ref(props.draftNote.details || '')
const localTags = ref(
	props.draftNote.tags
		? props.draftNote.tags
				.map((tag) => availableTags.value.find((t) => t.value === tag)?.value || tag)
				.filter(Boolean) // Remove any undefined values
		: [],
)

const localColor = ref(props.draftNote.color || '')
const localDueDate = ref(props.draftNote.dueDate ? new Date(props.draftNote.dueDate) : null)
const customEmoji = ref('')

// UI state
const colorPickerVisible = ref(false)
const emojiPickerVisible = ref(false)
const datePickerVisible = ref(false)

// Menu refs
const statusMenu = ref(null)
const priorityMenu = ref(null)

// Watch for prop changes
watch(
	() => props.draftNote,
	(newValue) => {
		localTitle.value = newValue.title || ''
		localDetails.value = newValue.details || ''
		localTags.value = Array.isArray(newValue.tags) ? [...newValue.tags] : []
		localColor.value = newValue.color || ''
		localDueDate.value = newValue.dueDate ? new Date(newValue.dueDate) : null
	},
	{ deep: true },
)

// Generate status menu items
const statusItems = computed(() => {
	return statusOptions.map((option) => ({
		label: option.label,
		icon:
			getStatusIcon(option.value).split(' ')[0] +
			' ' +
			getStatusIcon(option.value).split(' ')[1],
		command: () => {
			emit('update:status', option.value)
		},
	}))
})

// Generate priority menu items
const priorityItems = computed(() => {
	return priorityOptions.map((option) => ({
		label: option.label,
		icon:
			getPriorityIcon(option.value).split(' ')[0] +
			' ' +
			getPriorityIcon(option.value).split(' ')[1],
		command: () => {
			emit('update:priority', option.value)
		},
	}))
})

// Menu open methods
const openStatusMenu = (event) => {
	statusMenu.value.toggle(event)
}

const openPriorityMenu = (event) => {
	priorityMenu.value.toggle(event)
}

const openDatePicker = (event) => {
	datePickerVisible.value = true
}

// Tag methods
const removeTag = (index) => {
	const newTags = [...localTags.value]
	newTags.splice(index, 1)
	localTags.value = newTags
	emit('update:tags', newTags)
}

// Color picker methods
const updateNoteColor = (color) => {
	// Ensure the color has a # prefix when sending to the server
	const formattedColor = color.startsWith('#') ? color : `#${color}`
	emit('update:color', formattedColor)
}

// Emoji picker methods
const selectEmoji = (emoji) => {
	emit('update:icon', emoji)
	emojiPickerVisible.value = false
}

const addCustomEmoji = () => {
	if (customEmoji.value.trim()) {
		emit('update:icon', customEmoji.value)
		customEmoji.value = ''
		emojiPickerVisible.value = false
	}
}

// Date picker methods
const handleDateSelect = () => {
	if (localDueDate.value) {
		// We send the raw Date object to the parent component
		// The parent will use formatDateForServer when sending to backend
		emit('update:due-date', localDueDate.value)
	}
}

const handleDatePickerHide = () => {
	datePickerVisible.value = false

	// Ensure we update the date when closing
	if (localDueDate.value) {
		emit('update:due-date', localDueDate.value)
	}
}

// Add this handler for TextEditor changes
const handleEditorChange = (content) => {
	// Log what we're getting from the editor
	console.log('Editor content:', content)

	let htmlContent = ''

	// If it's a string, use it directly
	if (typeof content === 'string') {
		htmlContent = content
	}
	// If it's an object with htmlValue (common in PrimeVue Editor)
	else if (content && typeof content === 'object') {
		if (content.htmlValue) {
			htmlContent = content.htmlValue
		} else if (content.innerHTML) {
			htmlContent = content.innerHTML
		} else if (content.textContent) {
			htmlContent = content.textContent
		} else {
			// If we can't find HTML content, log this for debugging
			console.warn('Editor content structure:', content)
			htmlContent = String(content)
		}
	}

	localDetails.value = htmlContent
	emit('update:details', htmlContent)
}

// Add this new method to handle note type changes
const handleNoteTypeChange = (type) => {
	emit('toggle-note-type', type) // Use the correct event name
}

const handleTagChange = () => {
	// Ensure we're always working with values
	const tagValues = localTags.value
		.map((tag) => (typeof tag === 'object' ? tag.value : tag))
		.filter(Boolean)

	emit('update:tags', tagValues)
}
// Open modal/prompt for creating new tag
const openTagCreationModal = () => {
	const newTag = prompt('Enter a new tag name:')
	if (newTag && newTag.trim()) {
		const formattedTag = newTag.trim().toLowerCase()
		// Check if tag already exists
		const existingTag = availableTags.value.find((t) => t.value === formattedTag)

		if (!existingTag) {
			const newTagObject = { label: formattedTag, value: formattedTag }
			availableTags.value.push(newTagObject)

			// Add to selected tags
			localTags.value = [...localTags.value, newTagObject]

			// Emit updated tags
			emit(
				'update:tags',
				localTags.value.map((tag) => tag.value),
			)
		}
	}
}
</script>

<style scoped>
/* Custom styling for the form elements */

:deep(.p-multiselect-label-container) {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
}

:deep(.p-multiselect-token) {
	background-color: rgba(0, 0, 0, 0.1);
	color: rgba(0, 0, 0, 0.7);
	padding: 0.25rem 0.5rem;
	border-radius: 9999px;
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
}

:deep(.p-multiselect-token-label) {
	margin-right: 0.25rem;
}

:deep(.p-tag) {
	height: 24px;
}

:deep(.p-tag .p-tag-value) {
	font-size: 12px;
}

:deep(.p-datepicker) {
	font-size: 0.875rem;
}

:deep(.date-picker-panel) {
	position: absolute;
	z-index: 1000;
}

/* Remove the old color-picker-panel styling that was positioning it incorrectly */
.color-picker-panel {
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
	border-radius: 0.375rem;
	overflow: hidden;
}

/* Style the color picker button to be rounded and use correct size */
:deep(.p-colorpicker) {
	width: 2rem;
	height: 2rem;
}

:deep(.p-colorpicker-preview) {
	width: 2rem;
	height: 2rem;
	border-radius: 9999px;
}

/* Editor styling */
.editor-container {
	height: 100%;
	display: flex;
	flex-direction: column;
}

:deep(.ProseMirror) {
	min-height: 300px;
	max-height: 500px;
	overflow-y: auto;
	padding: 1rem;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

:deep(.editor-content-wrapper) {
	display: flex;
	flex-direction: column;
	height: 100%;
}
</style>
