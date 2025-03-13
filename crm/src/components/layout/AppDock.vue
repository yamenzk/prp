<template>
	<div class="dock-container" :class="{ collapsed }">
		<ContextMenu global :model="menuItems" />

		<!-- Map Dialog -->
		<MapDialog
			:visible="showMapDialog"
			@update:visible="showMapDialog = $event"
			@close="showMapDialog = false"
		/>

		<div class="dock" v-if="!collapsed">
			<div
				v-for="item in items"
				:key="item.id"
				class="dock-item cursor-pointer transition-transform duration-200 hover:scale-110"
				@click="handleDockItemClick(item)"
			>
				<img :src="item.icon" :alt="item.label" />
			</div>
		</div>
		<div
			class="dock-handle bg-zinc-600 dark:bg-zinc-200 cursor-pointer"
			@click="toggleDock"
			v-if="collapsed"
		></div>
	</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import ContextMenu from 'primevue/contextmenu'
import MapDialog from '@/apps/map/MapDialog.vue'

const emit = defineEmits(['open-notes'])

// Initialize with a fallback that emits an event
let notesDialog = {
	open: () => emit('open-notes'),
}

// Dialog visibility states
const showMapDialog = ref(false)

// Access the notes dialog API provided by App.vue when available
onMounted(() => {
	const injectedDialog = inject('notesDialog', null)
	if (injectedDialog) {
		notesDialog = injectedDialog
	}
})

// Dock items
const items = ref([
	{
		id: 'notes',
		label: 'Notes',
		icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Notes_icon.svg/2048px-Apple_Notes_icon.svg.png',
	},
	{
		id: 'maps',
		label: 'Maps',
		icon: 'https://icon-library.com/images/ios-maps-icon/ios-maps-icon-21.jpg',
	},
	{
		id: 'messages',
		label: 'Messages',
		icon: 'https://th.bing.com/th/id/R.b1bf299e90702e8b40b30ec3d23f1aba?rik=7FlCDfz1qo2CQA&riu=http%3a%2f%2ffreevector.co%2fwp-content%2fuploads%2f2014%2f05%2fmessages-ios.png&ehk=gJ29GoGdmCOkbX9qk9uNzwQfN%2b%2fBdZuDVD1AQzCkpN0%3d&risl=&pid=ImgRaw&r=0',
	},
	// {
	//   id: 'trash',
	//   label: "Trash",
	//   icon: "https://primefaces.org/cdn/primevue/images/dock/trash.png"
	// }
])

// UI state
const collapsed = ref(false)

// Context menu items
const menuItems = ref([
	{
		label: 'Collapse Dock',
		icon: 'pi pi-angle-double-down',
		command: () => (collapsed.value = true),
	},
])

// Handle clicking on dock items
const handleDockItemClick = (item) => {
	if (item.id === 'notes') {
		// Using emit as a more reliable method instead of inject
		emit('open-notes')
	} else if (item.id === 'maps') {
		// Open the map dialog
		showMapDialog.value = true
	} else if (item.id === 'messages') {
		// Handle other dock items as needed
		console.log('Messages clicked - functionality not implemented yet')
	}
}

// Toggle dock collapsed state
const toggleDock = () => {
	collapsed.value = !collapsed.value
}

// Provide the map dialog functionality for other components to use
const mapDialog = {
	open: () => {
		showMapDialog.value = true
	},
	close: () => {
		showMapDialog.value = false
	},
}

// Make the map dialog available to other components
defineExpose({
	openMapDialog: () => (showMapDialog.value = true),
})
</script>

<style scoped>
/* Styles remain the same */
.dock-container {
	display: flex;
	justify-content: center;
	align-items: flex-end;
	position: fixed;
	bottom: 0.5rem;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;
	transition: transform 0.3s ease;
}

.dock {
	display: flex;
	gap: 12px;
	padding: 12px 20px;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	border-radius: 20px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	transition: background 0.3s ease;
}

@media (prefers-color-scheme: dark) {
	.dock {
		background: rgba(30, 30, 30, 0.6);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
	}
}

.dock-item {
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s ease-in-out;
}

.dock-item img {
	width: 100%;
	height: auto;
}

.dock-item:hover {
	transform: scale(1.2);
}

.dock-container.collapsed {
	transform: translateX(-50%) translateY(80%);
}

.dock-handle {
	width: 80px;
	height: 5px;
	border-radius: 10px;
	cursor: pointer;
	margin-bottom: 5px;
}
</style>
