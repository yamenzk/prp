<template>
	<div class="h-full overflow-auto">
		<!-- Loading State -->
		<div
			v-if="isLoading"
			class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]"
		>
			<div class="loading-spinner"></div>
			<span>Loading activity...</span>
		</div>

		<!-- Error State -->
		<div
			v-else-if="hasError"
			class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="state-icon"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<span>{{ errorMessage }}</span>
		</div>

		<!-- Empty State -->
		<div
			v-else-if="processedTimelineEvents.length === 0"
			class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				class="state-icon"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<polyline points="12 6 12 12 16 14"></polyline>
			</svg>
			<span>No activity history available</span>
		</div>

		<!-- Timeline Content -->
		<div>
			<Timeline
				v-if="processedTimelineEvents.length > 0"
				:value="processedTimelineEvents"
				class="zinc-timeline"
			>
				<!-- Date and User -->
				<template #opposite="slotProps">
					<div class="flex flex-col gap-1 pr-6 text-right">
						<div
							class="text-[0.6875rem] font-medium text-[var(--pd-text-tertiary)] whitespace-nowrap tracking-tight"
						>
							{{ slotProps.item.formattedDate }}
						</div>
						<div class="text-xs font-semibold text-[var(--pd-text-secondary)]">
							{{ slotProps.item.user }}
						</div>
					</div>
				</template>

				<!-- Timeline Content -->
				<template #content="slotProps">
					<div
						class="mb-3 overflow-hidden rounded-xl border border-[var(--pd-border-light)] bg-[var(--pd-bg-surface)] shadow-sm transition-all duration-200"
						:class="{
							'bg-[var(--pd-bg-base)] border-[var(--pd-border-medium)] shadow-md':
								slotProps.item.isCreationEvent,
							'bg-[var(--pd-info-bg)] dark:bg-opacity-15':
								slotProps.item.sourceType === 'Building',
							'bg-[var(--pd-success-bg)] dark:bg-opacity-15':
								slotProps.item.sourceType === 'Project',
						}"
					>
						<!-- Timeline content details here (omitted for brevity) -->
						<div
							class="flex items-center justify-between p-3 cursor-default transition-colors duration-200"
							@click="toggleChanges(slotProps.item.id)"
							:class="{
								'cursor-pointer hover:bg-[var(--pd-bg-surface-hover)]':
									slotProps.item.changes.length > 1,
							}"
						>
							<span
								class="text-[0.8125rem] font-semibold text-[var(--pd-text-primary)]"
							>
								<span v-if="slotProps.item.sourceType === 'Building'" class="mr-1"
									>🏢</span
								>
								<span v-if="slotProps.item.sourceType === 'Project'" class="mr-1"
									>🏗️</span
								>
								<span v-if="slotProps.item.sourceType === 'Listing'" class="mr-1"
									>🏠</span
								>
								{{ slotProps.item.action }}
							</span>

							<div
								v-if="slotProps.item.changes.length > 1"
								class="flex items-center gap-1.5 text-[var(--pd-text-secondary)]"
							>
								<span
									class="min-w-[1.25rem] px-2 py-0.5 text-[0.6875rem] font-semibold text-center bg-[var(--pd-badge-bg)] text-[var(--pd-badge-text)] rounded-full"
									>{{ slotProps.item.changes.length }}</span
								>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									class="transition-transform duration-200"
									:class="{ 'rotate-180': expanded[slotProps.item.id] }"
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</div>
						</div>

						<div
							class="border-t border-[var(--pd-border-light)] bg-[var(--pd-bg-base)]"
							v-if="
								expanded[slotProps.item.id] || slotProps.item.changes.length === 1
							"
						>
							<ul class="p-4 m-0 list-none">
								<li
									v-for="(change, index) in slotProps.item.changes"
									:key="index"
									class="py-1.5 text-xs leading-6 text-[var(--pd-text-secondary)]"
									:class="{
										'border-b border-dashed border-[var(--pd-border-light)]':
											index !== slotProps.item.changes.length - 1,
									}"
								>
									{{ change }}
								</li>
							</ul>
						</div>
					</div>
				</template>

				<!-- Timeline Marker -->
				<template #marker="slotProps">
					<div
						class="flex items-center justify-center rounded-full"
						:class="[
							slotProps.item.isCreationEvent ? 'w-7 h-7' : 'w-6 h-6',
							{
								'bg-[var(--pd-marker-special)]': slotProps.item.isCreationEvent,
								'bg-[var(--pd-marker-bg)]':
									!slotProps.item.isCreationEvent &&
									slotProps.item.sourceType === 'Listing',
								'bg-[var(--pd-info)]': slotProps.item.sourceType === 'Building',
								'bg-[var(--pd-success)]': slotProps.item.sourceType === 'Project',
							},
						]"
					>
						<svg
							v-if="slotProps.item.isCreationEvent"
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--pd-bg-base)"
							stroke-width="2.5"
						>
							<path
								d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
							></path>
						</svg>
						<svg
							v-else-if="slotProps.item.action.includes('Modified')"
							xmlns="http://www.w3.org/2000/svg"
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--pd-bg-base)"
							stroke-width="2.5"
						>
							<path
								d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
							></path>
							<path
								d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
							></path>
						</svg>
						<svg
							v-else
							xmlns="http://www.w3.org/2000/svg"
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--pd-bg-base)"
							stroke-width="2.5"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M12 8v8"></path>
							<path d="M8 12h8"></path>
						</svg>
					</div>
				</template>
			</Timeline>
		</div>
	</div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useVersionStore } from '@/stores'
import { format } from 'date-fns'

const props = defineProps({
	listing: {
		type: Object,
		required: true,
	},
})

// Store references
const versionStore = useVersionStore()
const expanded = ref({})
const combinedTimelineEvents = ref([])
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// Toggle changes visibility
function toggleChanges(id) {
	expanded.value[id] = !expanded.value[id]
}



// Load the combined timeline for listing and related entities
async function loadCombinedTimeline() {
  if (!props.listing || isLoading.value) return;
  
  isLoading.value = true;
  combinedTimelineEvents.value = [];
	hasError.value = false

	try {
		// 1. Load the listing document timeline
		const listingTimeline = await versionStore.loadDocumentTimeline(
			'PRP Listing',
			props.listing.name,
		)
		console.log('Listing timeline:', listingTimeline)

		// Add all listing events to the combined timeline
		combinedTimelineEvents.value.push(
			...listingTimeline.map((event) => ({
				...event,
				sourceType: 'Listing',
				sourceName: props.listing.name,
			})),
		)

		// 2. Load the building timeline if we have a building reference
		if (props.listing.building) {
			const buildingTimeline = await versionStore.loadDocumentTimeline(
				'PRP Building',
				props.listing.building,
			)

			// Add building events to the combined timeline - modify content only for non-creation events
			combinedTimelineEvents.value.push(
				...buildingTimeline.map((event) => ({
					...event,
					// Only add context prefix to non-creation events (to avoid duplication)
					content: `[Building: ${props.listing.building.substring(props.listing.project.length + 1)}] ${event.content}`,
					sourceType: 'Building',
					sourceName: props.listing.building,
				})),
			)
		}
		console.log('Combined timeline:', combinedTimelineEvents.value)

		// 3. Load the project timeline if we have a project reference
		if (props.listing.project) {
			const projectTimeline = await versionStore.loadDocumentTimeline(
				'PRP Project',
				props.listing.project,
			)

			// Add project events to the combined timeline - modify content only for non-creation events
			combinedTimelineEvents.value.push(
				...projectTimeline.map((event) => ({
					...event,
					// Only add context prefix to non-creation events (to avoid duplication)
					content: `[Project: ${props.listing.project}] ${event.content}`,
					sourceType: 'Project',
					sourceName: props.listing.project,
				})),
			)
		}
		console.log('Combined timeline:', combinedTimelineEvents.value)

		// 4. Sort all events by timestamp (newest first)
		combinedTimelineEvents.value.sort((a, b) => b.timestamp - a.timestamp)
	} catch (error) {
		console.error('Error loading combined timeline:', error)
		hasError.value = true
		errorMessage.value = 'Failed to load history. Please try again.'
	} finally {
		isLoading.value = false
	}
}

const processedTimelineEvents = computed(() => {
	const groupedEvents = []
	const versionMap = new Map()
	let idCounter = 0

	combinedTimelineEvents.value.forEach((event) => {
		// Create a unique key for this version (timestamp + user)
		const versionKey = `${event.timestamp}-${event.user}`

		if (!versionMap.has(versionKey)) {
			// Create a new grouped event
			const groupedEvent = {
				id: idCounter++,
				formattedDate: versionStore.formatDate(new Date(event.timestamp), true),
				user: event.user,
				icon: event.icon,
				color: event.color,
				timestamp: event.timestamp,
				action: getActionText(event),
				changes: [event.content], // Start with this event's content
				isCreationEvent: event.content.includes('Created'),
				sourceType: event.sourceType,
				sourceName: event.sourceName,
			}

			// Set initial expanded state for events with multiple changes
			expanded.value[groupedEvent.id] = false

			versionMap.set(versionKey, groupedEvent)
			groupedEvents.push(groupedEvent)
		} else {
			// Add to existing grouped event - but only if the content is not already there
			const groupedEvent = versionMap.get(versionKey)
			if (!groupedEvent.changes.includes(event.content)) {
				groupedEvent.changes.push(event.content)
			}
		}
	})

	// Sort by timestamp (newest first)
	return groupedEvents.sort((a, b) => b.timestamp - a.timestamp)
})

// Determine the action text based on the event
function getActionText(event) {
	if (event.content.includes('Created')) {
		// Create just one clean creation message without duplicating
		if (event.sourceType === 'Building') {
			return 'Created building'
		} else if (event.sourceType === 'Project') {
			return 'Created project'
		} else {
			return 'Created listing'
		}
	} else if (event.icon === 'pi pi-plus') {
		return 'Added content'
	} else if (event.icon === 'pi pi-minus') {
		return 'Removed content'
	} else if (event.icon === 'pi pi-pencil') {
		if (event.sourceType === 'Building') {
			return 'Modified building'
		} else if (event.sourceType === 'Project') {
			return 'Modified project'
		} else {
			return 'Modified listing'
		}
	} else {
		if (event.sourceType === 'Building') {
			return 'Updated building'
		} else if (event.sourceType === 'Project') {
			return 'Updated project'
		} else {
			return 'Updated listing'
		}
	}
}

// Load data when listing changes
watch(
	() => props.listing,
	(newListing) => {
		if (newListing) {
			loadCombinedTimeline()
		}
	},
)

// Also load on component mount in case listing is already available
onMounted(() => {
	if (props.listing) {
		loadCombinedTimeline()
	}
})
</script>

<style scoped>
.state-icon {
	color: var(--pd-text-tertiary);
}

.loading-spinner {
	width: 1.125rem;
	height: 1.125rem;
	border: 2px solid var(--pd-border-light);
	border-top-color: var(--pd-text-tertiary);
	border-radius: 50%;
	animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
	to {
		transform: rotate(360deg);
	}
}

/* Timeline connector styling */
:deep(.p-timeline-event-opposite),
:deep(.p-timeline-event-content) {
	padding: 0 1rem 2rem 1rem;
}

:deep(.p-timeline-event-connector) {
	background: var(--pd-outline-color);
	width: 1px;
}

:deep(.p-timeline) {
	margin: 0;
}

:deep(.p-timeline .p-timeline-event:last-child .p-timeline-event-connector) {
	display: none;
}
</style>
