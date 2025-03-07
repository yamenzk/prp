<template>
  <div class="document-timeline">
    <!-- Loading State -->
    <div v-if="isLoading" class="timeline-loading">
      <div class="loading-spinner"></div>
      <span>Loading activity...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="timeline-error">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="processedTimelineEvents.length === 0" class="timeline-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>No activity history available</span>
    </div>

    <!-- Timeline Content -->
    <Timeline v-else :value="processedTimelineEvents" class="zinc-timeline">
      <!-- Date and User -->
      <template #opposite="slotProps">
        <div class="timeline-metadata">
          <div class="timeline-datetime">{{ slotProps.item.formattedDate }}</div>
          <div class="timeline-user">{{ slotProps.item.user }}</div>
        </div>
      </template>

      <!-- Timeline Content -->
      <template #content="slotProps">
  <div 
    class="timeline-entry" 
    :class="{ 
      'creation-event': slotProps.item.isCreationEvent,
      'preference-event': slotProps.item.sourceType === 'Preference' 
    }"
  ><div
            class="timeline-header"
            @click="toggleChanges(slotProps.item.id)"
            :class="{
              'has-changes': slotProps.item.changes.length > 1
            }"
          >
            <span class="timeline-action">{{ slotProps.item.action }}</span>

            <div v-if="slotProps.item.changes.length > 1" class="timeline-toggle">
              <span class="changes-count">{{ slotProps.item.changes.length }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon" :class="{ 'icon-expanded': expanded[slotProps.item.id] }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div
            class="timeline-changes"
            v-if="expanded[slotProps.item.id] || slotProps.item.changes.length === 1"
          >
            <ul>
              <li v-for="(change, index) in slotProps.item.changes" :key="index">
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Timeline Marker -->
      <template #marker="slotProps">
        <div
          class="timeline-marker"
          :class="{ 'creation-marker': slotProps.item.isCreationEvent }"
        >
          <svg v-if="slotProps.item.isCreationEvent" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="marker-icon">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <svg v-else-if="slotProps.item.action.includes('Modified')" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="marker-icon">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="marker-icon">
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

.timeline-entry.preference-event {
  background-color: var(--bg-surface-alt, #f0f9ff) !important; /* Light blue background */
}

/* For dark mode */
.dark .timeline-entry.preference-event {
  background-color: var(--bg-surface-alt-dark, #075985) !important; /* Darker blue for dark mode */
}

/* Optional: Add indicator for preference source in the header */
.timeline-entry.preference-event .timeline-action::before {
  content: '🏡 '; /* Home emoji or use an icon */
  margin-right: 0.25rem;
}

.document-timeline {
  padding: 4rem 2rem;
  
  /* Light mode variables */
  --bg-base: #ffffff;
  --bg-surface: #fafafa; /* zinc-50 */
  --bg-surface-hover: #f4f4f5; /* zinc-100 */
  --border-light: #e4e4e7; /* zinc-200 */
  --border-medium: #d4d4d8; /* zinc-300 */
  --text-primary: #27272a; /* zinc-800 */
  --text-secondary: #52525b; /* zinc-600 */
  --text-tertiary: #71717a; /* zinc-500 */
  --marker-bg: #52525b; /* zinc-600 */
  --marker-special: #3f3f46; /* zinc-700 */
  --outline-color: #d4d4d8; /* zinc-300 */
  --shadow-color: rgba(0, 0, 0, 0.05);
  --shadow-color-strong: rgba(0, 0, 0, 0.1);
  --badge-bg: #e4e4e7; /* zinc-200 */
  --badge-text: #3f3f46; /* zinc-700 */
}

/* Dark mode variables */
.dark .document-timeline {
  --bg-base: #18181b; /* zinc-900 */
  --bg-surface: #27272a; /* zinc-800 */
  --bg-surface-hover: #3f3f46; /* zinc-700 */
  --border-light: #3f3f46; /* zinc-700 */
  --border-medium: #52525b; /* zinc-600 */
  --text-primary: #f4f4f5; /* zinc-100 */
  --text-secondary: #d4d4d8; /* zinc-300 */
  --text-tertiary: #a1a1aa; /* zinc-400 */
  --marker-bg: #a1a1aa; /* zinc-400 */
  --marker-special: #d4d4d8; /* zinc-300 */
  --outline-color: #52525b; /* zinc-600 */
  --shadow-color: rgba(0, 0, 0, 0.2);
  --shadow-color-strong: rgba(0, 0, 0, 0.3);
  --badge-bg: #52525b; /* zinc-600 */
  --badge-text: #e4e4e7; /* zinc-200 */
}

/* Loading, Error and Empty states */
.timeline-loading,
.timeline-error,
.timeline-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-tertiary);
  gap: 0.625rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
}

.loading-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid var(--border-light);
  border-top-color: var(--text-tertiary);
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.error-icon, .empty-icon {
  color: var(--text-tertiary);
}

/* Timeline metadata styling */
.timeline-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: 1.5rem;
  text-align: right;
}

.timeline-datetime {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-tertiary);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.timeline-user {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Timeline entry */
.timeline-entry {
  margin-bottom: 0.75rem;
  background-color: var(--bg-surface);
  border-radius: 0.75rem;
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px var(--shadow-color);
}

.timeline-entry.creation-event {
  background-color: var(--bg-base);
  border: 1px solid var(--border-medium);
  box-shadow: 0 2px 4px var(--shadow-color);
}

/* Timeline header */
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: default;
  transition: background-color 0.2s ease;
}

.timeline-header.has-changes {
  cursor: pointer;
}

.timeline-header.has-changes:hover {
  background-color: var(--bg-surface-hover);
}

.timeline-action {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.creation-event .timeline-action {
  color: var(--text-primary);
}

.timeline-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
}

.changes-count {
  background: var(--badge-bg);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--badge-text);
  min-width: 1.25rem;
  text-align: center;
}

.toggle-icon {
  transition: transform 0.2s ease;
  color: var(--text-secondary);
}

.toggle-icon.icon-expanded {
  transform: rotate(180deg);
}

/* Timeline change items */
.timeline-changes {
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-base);
}

.timeline-changes ul {
  list-style: none;
  padding: 0.5rem 1rem;
  margin: 0;
}

.timeline-changes li {
  position: relative;
  padding: 0.375rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.75rem;
}

.timeline-changes li:not(:last-child) {
  border-bottom: 1px dashed var(--border-light);
}

/* Custom marker styling */
.timeline-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: var(--marker-bg);
}

.timeline-marker.creation-marker {
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--marker-special);
}

.marker-icon {
  color: var(--bg-base);
}

/* Timeline connector line */
:deep(.p-timeline-event-opposite),
:deep(.p-timeline-event-content) {
  padding: 0 1rem 2rem 1rem;
}

:deep(.p-timeline-event-connector) {
  background: var(--outline-color);
  width: 1px;
}

:deep(.p-timeline) {
  margin: 0;
}

:deep(.p-timeline .p-timeline-event:last-child .p-timeline-event-connector) {
  display: none;
}

/* Smooth animations */
.zinc-timeline {
  --transition-ease: cubic-bezier(0.4, 0, 0.2, 1);
  transition: all 0.3s var(--transition-ease);
}

/* Additional dark mode specific styles for PrimeVue components */
.dark :deep(.p-timeline) {
  color: var(--text-primary);
}
</style>