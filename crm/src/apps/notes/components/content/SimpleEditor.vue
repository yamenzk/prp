<template>
	<div class="simple-editor h-full flex flex-col">
		<!-- Editor toolbar -->
		<div
			v-if="showToolbar"
			class="editor-toolbar flex flex-wrap items-center gap-1 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
		>
			<!-- Text formatting -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden mr-1"
			>
				<Button text class="p-button-sm !rounded-none" @click="execCommand('bold')">
					<template #icon>
						<FeatherIcon name="bold" class="h-4 w-4" />
					</template>
				</Button>
				<Button text class="p-button-sm !rounded-none" @click="execCommand('italic')">
					<template #icon>
						<FeatherIcon name="italic" class="h-4 w-4" />
					</template>
				</Button>
				<Button text class="p-button-sm !rounded-none" @click="execCommand('underline')">
					<template #icon>
						<FeatherIcon name="underline" class="h-4 w-4" />
					</template>
				</Button>
			</div>

			<!-- Text alignment -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden mr-1"
			>
				<Button
					icon="pi pi-align-left"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('justifyLeft')"
				/>
				<Button
					icon="pi pi-align-center"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('justifyCenter')"
				/>
				<Button
					icon="pi pi-align-right"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('justifyRight')"
				/>
			</div>

			<!-- Lists -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden mr-1"
			>
				<Button
					icon="pi pi-list"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('insertUnorderedList')"
				/>
				<Button
					icon="pi pi-list-ol"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('insertOrderedList')"
				/>
			</div>

			<!-- Special formatting -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden mr-1"
			>
				<Button
					icon="pi pi-desktop"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('formatBlock', '<pre>')"
				/>
				<Button
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('formatBlock', '<blockquote>')"
				>
					<template #icon>
						<FeatherIcon name="message-square" class="h-4 w-4" />
					</template>
				</Button>
			</div>

			<!-- Insert objects -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden mr-1"
			>
				<Button
					icon="pi pi-link"
					text
					class="p-button-sm !rounded-none"
					@click="showLinkDialog = true"
				/>
				<Button
					icon="pi pi-image"
					text
					class="p-button-sm !rounded-none"
					@click="showImageDialog = true"
				/>
				<Button text class="p-button-sm !rounded-none" @click="showEmojiDialog = true">
					<template #icon>
						<span class="text-sm">😊</span>
					</template>
				</Button>
			</div>

			<!-- Text color -->
			<div class="mr-1">
				<ColorPicker
					v-model="textColor"
					@update:modelValue="applyTextColor"
					class="text-color-picker"
				/>
			</div>

			<!-- Undo/Redo -->
			<div
				class="flex border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden ml-auto"
			>
				<Button
					icon="pi pi-replay"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('undo')"
				/>
				<Button
					icon="pi pi-refresh"
					text
					class="p-button-sm !rounded-none"
					@click="execCommand('redo')"
				/>
			</div>
		</div>

		<!-- Editable content area -->
		<div
			ref="editorEl"
			class="editor-content flex-1 p-4 overflow-y-auto"
			contenteditable="true"
			:placeholder="placeholder"
			@input="handleInput"
			@paste="handlePaste"
			@keydown="handleKeyDown"
		></div>

		<!-- Link dialog -->
		<Dialog
			v-model:visible="showLinkDialog"
			header="Insert Link"
			:style="{ width: '400px' }"
			modal
			:closable="false"
		>
			<div class="p-4">
				<div class="mb-3">
					<label for="link-text" class="block mb-1 text-sm font-medium">Link Text</label>
					<InputText id="link-text" v-model="linkData.text" class="w-full" />
				</div>
				<div class="mb-3">
					<label for="link-url" class="block mb-1 text-sm font-medium">URL</label>
					<InputText id="link-url" v-model="linkData.url" class="w-full" />
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" text @click="showLinkDialog = false" />
				<Button label="Insert" @click="insertLink" />
			</template>
		</Dialog>

		<!-- Image dialog -->
		<Dialog
			v-model:visible="showImageDialog"
			header="Insert Image"
			:style="{ width: '400px' }"
			modal
			:closable="false"
		>
			<div class="p-4">
				<div class="mb-3">
					<label for="image-url" class="block mb-1 text-sm font-medium">Image URL</label>
					<InputText id="image-url" v-model="imageData.url" class="w-full" />
				</div>
				<div class="mb-3">
					<label for="image-alt" class="block mb-1 text-sm font-medium">Alt Text</label>
					<InputText id="image-alt" v-model="imageData.alt" class="w-full" />
				</div>
			</div>
			<template #footer>
				<Button label="Cancel" text @click="showImageDialog = false" />
				<Button label="Insert" @click="insertImage" />
			</template>
		</Dialog>

		<!-- Emoji dialog -->
		<Dialog
			v-model:visible="showEmojiDialog"
			header="Insert Emoji"
			:style="{ width: '400px' }"
			modal
		>
			<div class="grid grid-cols-8 gap-2 p-3">
				<button
					v-for="emoji in commonEmojis"
					:key="emoji"
					class="w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
					@click="insertEmoji(emoji)"
				>
					{{ emoji }}
				</button>
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { commonEmojis } from '../../utils/noteIcons'

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
	},
	placeholder: {
		type: String,
		default: 'Start typing...',
	},
	showToolbar: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:modelValue'])

// Editor refs and state
const editorEl = ref(null)
const textColor = ref('#000000')
const isUpdatingContent = ref(false)

// Dialog states
const showLinkDialog = ref(false)
const showImageDialog = ref(false)
const showEmojiDialog = ref(false)

// Dialog data
const linkData = ref({ text: '', url: '' })
const imageData = ref({ url: '', alt: '' })

// Define updateEditorContent function before using it in watch
const updateEditorContent = (content) => {
	if (editorEl.value) {
		isUpdatingContent.value = true
		editorEl.value.innerHTML = content || ''
		isUpdatingContent.value = false
	}
}

// Watch for external changes to modelValue
watch(
	() => props.modelValue,
	(newValue) => {
		if (!isUpdatingContent.value) {
			updateEditorContent(newValue)
		}
	},
	{ immediate: true },
)

// Initialize editor on mount
onMounted(() => {
	updateEditorContent(props.modelValue)
})

// Handle input event
const handleInput = (event) => {
	if (!isUpdatingContent.value) {
		isUpdatingContent.value = true
		emit('update:modelValue', event.target.innerHTML)
		isUpdatingContent.value = false
	}
}

// Handle paste to strip formatting
const handlePaste = (event) => {
	event.preventDefault()
	const text = event.clipboardData.getData('text/plain')
	document.execCommand('insertText', false, text)
}

// Handle keydown for special commands
const handleKeyDown = (event) => {
	// Special key combinations
	if (event.ctrlKey || event.metaKey) {
		switch (event.key.toLowerCase()) {
			case 'b':
				event.preventDefault()
				execCommand('bold')
				break
			case 'i':
				event.preventDefault()
				execCommand('italic')
				break
			case 'u':
				event.preventDefault()
				execCommand('underline')
				break
		}
	}
}

// Execute command on the editor
const execCommand = (command, value = null) => {
	document.execCommand(command, false, value)
	editorEl.value.focus()
	emit('update:modelValue', editorEl.value.innerHTML)
}

// Apply text color
const applyTextColor = (color) => {
	document.execCommand('foreColor', false, color)
	editorEl.value.focus()
	emit('update:modelValue', editorEl.value.innerHTML)
}

// Link operations
const insertLink = () => {
	if (linkData.value.url) {
		const url = linkData.value.url.startsWith('http')
			? linkData.value.url
			: 'https://' + linkData.value.url

		const text = linkData.value.text || url

		const linkHtml = `<a href="${url}" target="_blank">${text}</a>`
		document.execCommand('insertHTML', false, linkHtml)

		showLinkDialog.value = false
		linkData.value = { text: '', url: '' }

		emit('update:modelValue', editorEl.value.innerHTML)
	}
}

// Image operations
const insertImage = () => {
	if (imageData.value.url) {
		const imgHtml = `<img src="${imageData.value.url}" alt="${imageData.value.alt || ''}" style="max-width: 100%;">`
		document.execCommand('insertHTML', false, imgHtml)

		showImageDialog.value = false
		imageData.value = { url: '', alt: '' }

		emit('update:modelValue', editorEl.value.innerHTML)
	}
}

// Emoji operations
const insertEmoji = (emoji) => {
	document.execCommand('insertText', false, emoji)
	showEmojiDialog.value = false
	emit('update:modelValue', editorEl.value.innerHTML)
}
</script>

<style scoped>
.simple-editor {
	background-color: white;
}

.dark .simple-editor {
	background-color: var(--surface-900, #121212);
}

.editor-content {
	outline: none;
	line-height: 1.6;
	min-height: 200px;
}

.editor-content:empty:before {
	content: attr(placeholder);
	color: #9ca3af;
	pointer-events: none;
}

:deep(.p-colorpicker-preview) {
	width: 1.5rem;
	height: 1.5rem;
}

:deep(.text-color-picker) {
	width: 1.5rem;
	height: 1.5rem;
}

/* Rich text styling */
.editor-content :deep(h1) {
	font-size: 1.5rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
}

.editor-content :deep(h2) {
	font-size: 1.25rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
}

.editor-content :deep(p) {
	margin-bottom: 1rem;
}

.editor-content :deep(blockquote) {
	border-left: 4px solid #e5e7eb;
	padding-left: 1rem;
	margin-left: 0;
	margin-right: 0;
	font-style: italic;
	color: #6b7280;
}

.editor-content :deep(pre) {
	background-color: #f3f4f6;
	padding: 0.5rem;
	border-radius: 0.25rem;
	font-family: monospace;
	white-space: pre-wrap;
}

.dark .editor-content :deep(pre) {
	background-color: #374151;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
	padding-left: 1.5rem;
	margin-bottom: 1rem;
}

.editor-content :deep(li) {
	margin-bottom: 0.25rem;
}

.editor-content :deep(a) {
	color: #3b82f6;
	text-decoration: underline;
}

.dark .editor-content :deep(a) {
	color: #60a5fa;
}

.editor-content :deep(img) {
	max-width: 100%;
	height: auto;
	margin: 1rem 0;
	border-radius: 0.25rem;
}

.editor-content :deep(hr) {
	border: none;
	border-top: 1px solid #e5e7eb;
	margin: 1rem 0;
}

.dark .editor-content :deep(hr) {
	border-top-color: #374151;
}

.editor-content :deep(table) {
	border-collapse: collapse;
	width: 100%;
	margin-bottom: 1rem;
}

.editor-content :deep(th),
.editor-content :deep(td) {
	border: 1px solid #e5e7eb;
	padding: 0.5rem;
}

.dark .editor-content :deep(th),
.dark .editor-content :deep(td) {
	border-color: #374151;
}

.editor-content :deep(th) {
	background-color: #f9fafb;
	font-weight: bold;
}

.dark .editor-content :deep(th) {
	background-color: #1f2937;
}
</style>
