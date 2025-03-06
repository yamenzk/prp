<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Header -->
    <NotesHeader 
      :active-view="activeView"
      :composing-note="composingNote"
      :header-title="headerTitle"
      :active-tab-index="activeTabIndex"
      :view-mode="viewMode"
      :search-query="searchQuery"
      :hide-completed="hideCompleted"
      :current-context="currentContext"
      @minimize-dialog="$emit('minimize-dialog')"
      @close="$emit('close')"
      @navigate-back="$emit('navigate-back')"
      @set-view-mode="$emit('set-view-mode', $event)"
      @update:search-query="$emit('update:search-query', $event)"
      @update:hide-completed="$emit('update:hide-completed', $event)"
    />
    
    <!-- Main Content with scroll physics -->
    <div class="flex-1 overflow-hidden">
      <!-- Home View -->
      <HomeView 
        v-if="activeView === 'home' && !composingNote"
        :active-tab-index="activeTabIndex"
        :view-mode="viewMode"
        :filtered-sticky-notes="filteredStickyNotes"
        :filtered-regular-notes="filteredRegularNotes"
        :task-filter="taskFilter"
        :task-priority-filter="taskPriorityFilter"
        :visible-statuses="visibleStatuses"
        :get-filtered-tasks-by-status="getFilteredTasksByStatus"
        :journals-by-date="journalsByDate"
        @update:active-tab-index="$emit('update:active-tab-index', $event)"
        @open-note="$emit('open-note', $event)"
        @toggle-sticky="$emit('toggle-sticky', $event)"
        @update:task-filter="$emit('update:task-filter', $event)"
        @update:task-priority-filter="$emit('update:task-priority-filter', $event)"
        @open-task="$emit('open-task', $event)"
        @toggle-task-complete="$emit('toggle-task-complete', $event)"
        @update-task-priority="$emit('update-task-priority', $event, $event.priority)"
        @create-new-task="$emit('create-new-task')"
        @open-journal="$emit('open-journal', $event)"
        @create-new-journal="$emit('create-new-journal')"
        @drag-task="$emit('drag-task', $event)"
        @drop-task="$emit('drop-task', $event)"
      />
      
      <!-- Room View (context-specific) -->
      <RoomView 
        v-if="activeView === 'room' && !composingNote"
        :current-context="currentContext"
        :room-filter-type="roomFilterType"
        :room-notes="roomNotes"
        :room-tasks="roomTasks"
        :room-journals="roomJournals"
        :filtered-room-notes="filteredRoomNotes"
        @update:room-filter-type="$emit('update:room-filter-type', $event)"
        @open-note="$emit('open-note', $event)"
        @toggle-sticky="$emit('toggle-sticky', $event)"
        @open-task="$emit('open-task', $event)"
        @toggle-task-complete="$emit('toggle-task-complete', $event)"
        @update-task-priority="$emit('update-task-priority', $event, $event.priority)"
        @open-journal="$emit('open-journal', $event)"
        @create-new-note="$emit('create-new-note')"
      />
      
      <!-- Detail View -->
      <DetailView 
        v-if="activeView === 'detail' && !composingNote"
        :current-note="currentNote"
        :status-options="statusOptions"
        :priority-options="priorityOptions"
        @toggle-sticky="$emit('toggle-sticky', $event)"
        @edit-note="$emit('edit-note', $event)"
        @delete-note="$emit('delete-note')"
        @duplicate-note="$emit('duplicate-note', $event)"
        @convert-to-task="$emit('convert-to-task')"
        @update-task-status="$emit('update-task-status', $event.task, $event.status)"
        @update-task-priority="$emit('update-task-priority', $event.task, $event.priority)"
      />
      
      <!-- Composer View -->
      <ComposerView 
        v-if="composingNote"
        :draft-note="draftNote"
        :note-type="noteType"
        :show-color-picker="showColorPicker"
        :status-options="statusOptions"
        :priority-options="priorityOptions"
        :icon-picker-items="iconPickerItems"
        @cancel-compose="$emit('cancel-compose')"
        @save-note="$emit('save-note')"
        @toggle-note-type="$emit('toggle-note-type')"
        @toggle-color-picker="$emit('toggle-color-picker')"
        @update:color="$emit('update:color', $event)"
        @update:icon="$emit('update:icon', $event)"
        @update:sticky="$emit('update:sticky', $event)"
        @update:tags="$emit('update:tags', $event)"
        @update:title="$emit('update:title', $event)"
        @update:details="$emit('update:details', $event)"
        @update:status="$emit('update:status', $event)"
        @update:priority="$emit('update:priority', $event)"
        @update:due-date="$emit('update:due-date', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import NotesHeader from '../header/NotesHeader.vue';
import HomeView from './HomeView.vue';
import RoomView from './RoomView.vue';
import DetailView from './DetailView.vue';
import ComposerView from './ComposerView.vue';
import { statusOptions, priorityOptions } from '../../utils/noteStatusHelpers';

defineProps({
  activeView: {
    type: String,
    required: true
  },
  activeTabIndex: {
    type: Number,
    required: true
  },
  composingNote: {
    type: Boolean,
    required: true
  },
  headerTitle: {
    type: String,
    required: true
  },
  currentNote: {
    type: Object,
    default: null
  },
  currentContext: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  hideCompleted: {
    type: Boolean,
    required: true
  },
  roomFilterType: {
    type: String,
    required: true
  },
  draftNote: {
    type: Object,
    required: true
  },
  noteType: {
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
  roomNotes: {
    type: Array,
    required: true
  },
  roomTasks: {
    type: Array,
    required: true
  },
  roomJournals: {
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
  journalsByDate: {
    type: Array,
    required: true
  },
  filteredRoomNotes: {
    type: Array,
    required: true
  },
  showColorPicker: {
    type: Boolean,
    required: true
  },
  iconPickerItems: {
    type: Array,
    required: true
  },
  getFilteredTasksByStatus: {
    type: Function,
    required: true
  }
});

defineEmits([
  'minimize-dialog',
  'close',
  'navigate-back',
  'set-view-mode',
  'update:search-query',
  'update:hide-completed',
  'update:active-tab-index',
  'open-note',
  'open-task',
  'open-journal',
  'toggle-sticky',
  'edit-note',
  'delete-note',
  'duplicate-note',
  'convert-to-task',
  'update-task-status',
  'update-task-priority',
  'toggle-task-complete',
  'update:task-filter',
  'update:task-priority-filter',
  'update:room-filter-type',
  'create-new-task',
  'create-new-journal',
  'cancel-compose',
  'save-note',
  'toggle-note-type',
  'toggle-color-picker',
  'update:color',
  'update:icon',
  'update:sticky',
  'update:tags',
  'update:title',
  'update:details',
  'update:status',
  'update:priority',
  'update:due-date',
  'drag-task',
  'drop-task',
  'create-new-note'
]);
</script>