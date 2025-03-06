<template>
  <div class="h-full flex flex-col">
    <TabMenu 
      :model="tabs" 
      :activeIndex="activeTabIndex" 
      @tab-change="$emit('update:active-tab-index', $event.index)" 
      class="border-b border-zinc-200 dark:border-zinc-800"
      pt:menuitem:class="transition-colors"
    />
    
    <!-- Notes Tab -->
    <NotesTab 
      v-if="activeTabIndex === 0" 
      :view-mode="viewMode"
      :sticky-notes="filteredStickyNotes"
      :regular-notes="filteredRegularNotes"
      @open-note="$emit('open-note', $event)"
      @toggle-sticky="$emit('toggle-sticky', $event)"
    />
    
    <!-- Tasks Tab -->
    <TasksTab 
      v-if="activeTabIndex === 1"
      :task-filter="taskFilter"
      :task-priority-filter="taskPriorityFilter"
      :visible-statuses="visibleStatuses"
      :get-filtered-tasks-by-status="getFilteredTasksByStatus"
      @update:task-filter="$emit('update:task-filter', $event)"
      @update:task-priority-filter="$emit('update:task-priority-filter', $event)"
      @open-task="$emit('open-task', $event)"
      @toggle-task-complete="$emit('toggle-task-complete', $event)"
      @update-task-priority="$emit('update-task-priority', $event, $event.priority)"
      @create-new-task="$emit('create-new-task')"
      @drag-task="$emit('drag-task', $event)"
      @drop-task="$emit('drop-task', $event)"
    />
    
    <!-- Journal Tab -->
    <JournalTab
      v-if="activeTabIndex === 2"
      :journals-by-date="journalsByDate"
      @open-journal="$emit('open-journal', $event)"
      @create-new-journal="$emit('create-new-journal')"
    />
  </div>
</template>

<script setup>
import NotesTab from '../tabs/NotesTab.vue';
import TasksTab from '../tabs/TasksTab.vue';
import JournalTab from '../tabs/JournalTab.vue';

defineProps({
  activeTabIndex: {
    type: Number,
    required: true
  },
  viewMode: {
    type: String,
    required: true
  },
  filteredStickyNotes: {
    type: Array,
    required: true
  },
  filteredRegularNotes: {
    type: Array,
    required: true
  },
  taskFilter: {
    type: String,
    required: true
  },
  taskPriorityFilter: {
    type: String,
    required: true
  },
  visibleStatuses: {
    type: Array,
    required: true
  },
  getFilteredTasksByStatus: {
    type: Function,
    required: true
  },
  journalsByDate: {
    type: Array,
    required: true
  }
});

defineEmits([
  'update:active-tab-index',
  'open-note',
  'toggle-sticky',
  'update:task-filter',
  'update:task-priority-filter',
  'open-task',
  'toggle-task-complete',
  'update-task-priority',
  'create-new-task',
  'open-journal',
  'create-new-journal',
  'drag-task',
  'drop-task'
]);

const tabs = [
  { label: 'Notes', icon: 'pi pi-file' },
  { label: 'Tasks', icon: 'pi pi-check-square' },
  { label: 'Journal', icon: 'pi pi-book' }
];
</script>