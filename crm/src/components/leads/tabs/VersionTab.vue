<template>
  <div class="px-8 py-16">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]">
      <div class="loading-spinner"></div>
      <span>Loading activity...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="state-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="processedTimelineEvents.length === 0" class="flex items-center justify-center gap-2.5 p-8 text-sm rounded-xl bg-[var(--pd-bg-surface)] border border-[var(--pd-border-light)] text-[var(--pd-text-tertiary)]">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="state-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>No activity history available</span>
    </div>

    <!-- Timeline Content -->
    <Timeline v-else :value="processedTimelineEvents" class="zinc-timeline">
      <!-- Date and User -->
      <template #opposite="slotProps">
        <div class="flex flex-col gap-1 pr-6 text-right">
          <div class="text-[0.6875rem] font-medium text-[var(--pd-text-tertiary)] whitespace-nowrap tracking-tight">{{ slotProps.item.formattedDate }}</div>
          <div class="text-xs font-semibold text-[var(--pd-text-secondary)]">{{ slotProps.item.user }}</div>
        </div>
      </template>

      <!-- Timeline Content -->
      <template #content="slotProps">
        <div 
          class="mb-3 overflow-hidden rounded-xl border border-[var(--pd-border-light)] bg-[var(--pd-bg-surface)] shadow-sm transition-all duration-200"
          :class="{ 
            'bg-[var(--pd-bg-base)] border-[var(--pd-border-medium)] shadow-md': slotProps.item.isCreationEvent,
            'bg-[var(--pd-info-bg)] dark:bg-opacity-15': slotProps.item.sourceType === 'Preference' 
          }"
        >
          <div
            class="flex items-center justify-between p-3 cursor-default transition-colors duration-200"
            @click="toggleChanges(slotProps.item.id)"
            :class="{
              'cursor-pointer hover:bg-[var(--pd-bg-surface-hover)]': slotProps.item.changes.length > 1
            }"
          >
            <span class="text-[0.8125rem] font-semibold text-[var(--pd-text-primary)]">
              <span v-if="slotProps.item.sourceType === 'Preference'">🏡 </span>
              {{ slotProps.item.action }}
            </span>

            <div v-if="slotProps.item.changes.length > 1" class="flex items-center gap-1.5 text-[var(--pd-text-secondary)]">
              <span class="min-w-[1.25rem] px-2 py-0.5 text-[0.6875rem] font-semibold text-center bg-[var(--pd-badge-bg)] text-[var(--pd-badge-text)] rounded-full">{{ slotProps.item.changes.length }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform duration-200" :class="{ 'rotate-180': expanded[slotProps.item.id] }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div
            class="border-t border-[var(--pd-border-light)] bg-[var(--pd-bg-base)]"
            v-if="expanded[slotProps.item.id] || slotProps.item.changes.length === 1"
          >
            <ul class="p-4 m-0 list-none">
              <li 
                v-for="(change, index) in slotProps.item.changes" 
                :key="index"
                class="py-1.5 text-xs leading-6 text-[var(--pd-text-secondary)]"
                :class="{'border-b border-dashed border-[var(--pd-border-light)]': index !== slotProps.item.changes.length - 1}"
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
          class="flex items-center justify-center rounded-full bg-[var(--pd-marker-bg)]"
          :class="slotProps.item.isCreationEvent ? 'w-7 h-7 bg-[var(--pd-marker-special)]' : 'w-6 h-6'"
        >
          <svg v-if="slotProps.item.isCreationEvent" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pd-bg-base)" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <svg v-else-if="slotProps.item.action.includes('Modified')" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--pd-bg-base)" stroke-width="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--pd-bg-base)" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
      </template>
    </Timeline>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useVersionStore, usePreferenceStore } from '@/stores'
import { format } from 'date-fns'

const props = defineProps({
  doctype: {
    type: String,
    required: true,
  },
  docname: {
    type: String,
    required: true,
  },
})

// Store references
const versionStore = useVersionStore()
const preferenceStore = usePreferenceStore()
const expanded = ref({})

// Define combined timeline function
function useCombinedLeadTimeline() {
  const combinedTimelineEvents = ref([])
  const isLoading = ref(false)

  async function loadCombinedTimeline(leadId) {
    isLoading.value = true
    combinedTimelineEvents.value = []

    try {
      // 1. Load the lead document timeline
      const leadTimeline = await versionStore.loadDocumentTimeline('PRP Lead', leadId)

      // Add all lead events to the combined timeline
      combinedTimelineEvents.value.push(
        ...leadTimeline.map((event) => ({
          ...event,
          sourceType: 'Lead',
          sourceName: leadId,
        }))
      )

      // 2. Get all preferences for this lead
      await preferenceStore.updateFilters({ lead: leadId })
      await preferenceStore.fetchPreferences()
      const preferences = preferenceStore.preferences

      // 3. Load timeline for each preference
      for (const preference of preferences) {
        const prefTimeline = await versionStore.loadDocumentTimeline(
          'PRP Preference',
          preference.name
        )

        // Add preference events to the combined timeline with context
        combinedTimelineEvents.value.push(
          ...prefTimeline.map((event) => ({
            ...event,
            // Add context to the content field
            content: `[Preference: ${preference.type || preference.name}] ${event.content}`,
            sourceType: 'Preference',
            sourceName: preference.name,
          }))
        )
      }

      // 4. Sort all events by timestamp (newest first)
      combinedTimelineEvents.value.sort((a, b) => b.timestamp - a.timestamp)

      return combinedTimelineEvents.value
    } catch (error) {
      console.error(`Error loading combined timeline for lead ${leadId}:`, error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    combinedTimelineEvents,
    isLoading,
    loadCombinedTimeline,
  }
}

// Call the combined timeline function to get the returned values
const { combinedTimelineEvents, isLoading: combinedIsLoading, loadCombinedTimeline } = useCombinedLeadTimeline()

// Computed properties for UI state
const isLoading = computed(() => 
  props.doctype === 'PRP Lead' ? combinedIsLoading.value : versionStore.isTimelineLoading
)
const hasError = computed(() => versionStore.hasError)
const errorMessage = computed(() => versionStore.errorMessage)

// Toggle changes visibility
function toggleChanges(id) {
  expanded.value[id] = !expanded.value[id]
}

// Format date in the requested format
function formatDateTime(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }
  const dateStr = date.toLocaleDateString('en-US', options)
  const timeStr = format(date, 'hh:mm a') // 12-hour format with AM/PM

  return `${dateStr} • ${timeStr}`
}

const processedTimelineEvents = computed(() => {
  const events = props.doctype === 'PRP Lead' ? combinedTimelineEvents.value : versionStore.timelineEvents
  
  const groupedEvents = []
  const versionMap = new Map()
  let idCounter = 0

  events.forEach((event) => {
    // Create a unique key for this version (timestamp + user)
    const versionKey = `${event.timestamp}-${event.user}`

    if (!versionMap.has(versionKey)) {
      // Create a new grouped event
      const date = new Date(event.timestamp)
      const groupedEvent = {
        id: idCounter++,
        formattedDate: formatDateTime(date),
        user: event.user,
        icon: event.icon,
        color: event.color,
        timestamp: event.timestamp,
        action: getActionText(event),
        changes: [event.content],
        isCreationEvent: event.content.includes('Created'),
        // Pass through the source type if available
        sourceType: event.sourceType || 'Main',
        sourceName: event.sourceName || '',
      }

      // Set initial expanded state for events with multiple changes
      expanded.value[groupedEvent.id] = false

      versionMap.set(versionKey, groupedEvent)
      groupedEvents.push(groupedEvent)
    } else {
      // Add to existing grouped event
      const groupedEvent = versionMap.get(versionKey)
      groupedEvent.changes.push(event.content)
    }
  })

  // Sort by timestamp (newest first)
  return groupedEvents.sort((a, b) => b.timestamp - a.timestamp)
})

// Determine the action text based on the event
function getActionText(event) {
  if (event.content.includes('Created')) {
    if (event.content.includes('Preference')) {
      return 'Created preference'
    } else {
      return 'Created this document'
    }
  } else if (event.icon === 'pi pi-plus') {
    return 'Added content'
  } else if (event.icon === 'pi pi-minus') {
    return 'Removed content'
  } else if (event.icon === 'pi pi-pencil') {
    if (event.content.includes('Preference')) {
      return 'Modified preference'
    } else {
      return 'Modified this document'
    }
  } else {
    return 'Updated document'
  }
}

// Load data on component mount
onMounted(async () => {
  await loadCombinedTimeline(props.docname)
})

// Watch for changes in docname
watch(
  () => props.docname,
  (newDocname) => {
    if (newDocname) {
      loadCombinedTimeline(newDocname)
    }
  },
)
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
  to { transform: rotate(360deg); }
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