<template>
	<div class="resizable-panes" ref="container">
		<div class="pane left-pane" :style="{ width: `${leftPaneWidth}px` }">
			<slot name="left"></slot>
		</div>

		<div class="resize-handle" @mousedown="startResize" :class="{ 'is-resizing': isResizing }">
			<div class="handle-line"></div>
		</div>

		<div class="pane right-pane">
			<slot name="right"></slot>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Minimum width for the left pane (in pixels)
const MIN_LEFT_WIDTH = 250
// Minimum width for the right pane (in pixels)
const MIN_RIGHT_WIDTH = 300

const props = defineProps({
	initialLeftWidth: {
		type: Number,
		default: 500,
	},
})

const container = ref(null)
const leftPaneWidth = ref(props.initialLeftWidth)
const isResizing = ref(false)
let containerWidth = 0

// Set up the resize event
const startResize = (e) => {
	isResizing.value = true

	// Store initial values
	const startX = e.clientX
	const startWidth = leftPaneWidth.value

	// Store container width for calculation limits
	containerWidth = container.value.offsetWidth

	// Handle mouse movement
	const handleMouseMove = (e) => {
		if (!isResizing.value) return

		// Calculate the new width based on mouse position
		const newWidth = startWidth + (e.clientX - startX)

		// Apply constraints
		const maxLeftWidth = containerWidth - MIN_RIGHT_WIDTH
		leftPaneWidth.value = Math.max(MIN_LEFT_WIDTH, Math.min(maxLeftWidth, newWidth))

		// Save the width to local storage for persistence
		localStorage.setItem('leadPaneLeftWidth', leftPaneWidth.value)
	}

	// Handle mouse up
	const handleMouseUp = () => {
		isResizing.value = false
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
	}

	// Add event listeners
	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('mouseup', handleMouseUp)
}

// Load saved width from local storage on mount
onMounted(() => {
	const savedWidth = localStorage.getItem('leadPaneLeftWidth')
	if (savedWidth) {
		leftPaneWidth.value = parseInt(savedWidth, 10)
	}
})

// Cleanup event listeners
onUnmounted(() => {
	document.removeEventListener('mousemove', () => {})
	document.removeEventListener('mouseup', () => {})
})
</script>

<style scoped>
.resizable-panes {
	display: flex;
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
}

.pane {
	height: 100%;
	overflow: auto;
}

.left-pane {
	flex-shrink: 0;
}

.right-pane {
	flex-grow: 1;
}

.resize-handle {
	width: 7px;
	background-color: transparent;
	cursor: col-resize;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.15s ease;
	z-index: 10;
}

.resize-handle:hover,
.resize-handle.is-resizing {
	background-color: rgba(0, 0, 0, 0.05);
}

.handle-line {
	width: 2px;
	height: 30px;
	background-color: #e5e7eb;
	border-radius: 2px;
	transition: background-color 0.15s ease;
}

.resize-handle:hover .handle-line,
.resize-handle.is-resizing .handle-line {
	background-color: #d1d5db;
}

/* Dark mode support */
:deep(.dark) .resize-handle:hover,
:deep(.dark) .resize-handle.is-resizing {
	background-color: rgba(255, 255, 255, 0.1);
}

:deep(.dark) .handle-line {
	background-color: #4b5563;
}

:deep(.dark) .resize-handle:hover .handle-line,
:deep(.dark) .resize-handle.is-resizing .handle-line {
	background-color: #6b7280;
}
</style>
