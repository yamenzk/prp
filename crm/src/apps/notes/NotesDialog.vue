<template>
  <Dialog
    :visible="modelValue" 
    @update:visible="$emit('update:modelValue', $event)"
    :modal="false"
    :closable="false"
    :resizable="true"
    :draggable="true"
    position="top-right"
    :style="{ width: '900px', height: '70vh'}"
    pt:root:class="notes-dialog !rounded-xl !border !border-zinc-200 dark:!border-zinc-700 !bg-zinc-50 dark:!bg-zinc-900 !shadow-xl"
    pt:content:class="!p-0"
  >
    <template #container="{ closeCallback }">
      <div class="flex h-full">
        <!-- Sidebar Navigation -->
        <NotesSidebar 
          :active-view="activeView"
          :active-tab-index="activeTabIndex"
          :current-context="currentContext"
          :auto-rooms="autoRooms"
          :popular-tags="popularTags"
          :task-notes="taskNotes"
          @go-to-home="goToHome"
          @set-active-tab="activeTabIndex = $event"
          @switch-to-context="switchToContext"
          @filter-by-tag="filterByTag"
          @create-new-note="createNewNote"
        />
        
        <!-- Main Content Area -->
        <NotesContent 
          :active-view="activeView"
          :active-tab-index="activeTabIndex"
          :composing-note="composingNote"
          :header-title="headerTitle"
          :current-note="currentNote"
          :current-context="currentContext"
          :view-mode="viewMode"
          :search-query="searchQuery"
          :hide-completed="hideCompleted"
          :room-filter-type="roomFilterType"
          :draft-note="draftNote"
          :note-type="noteType"
          :filtered-sticky-notes="filteredStickyNotes"
          :filtered-regular-notes="filteredRegularNotes"
          :room-notes="roomNotes"
          :room-tasks="roomTasks"
          :room-journals="roomJournals"
          :task-filter="taskFilter"
          :task-priority-filter="taskPriorityFilter"
          :visible-statuses="visibleStatuses"
          :journals-by-date="journalsByDate"
          :filtered-room-notes="filteredRoomNotes"
          :show-color-picker="showColorPicker"
          :icon-picker-items="iconPickerItems"
          :get-filtered-tasks-by-status="getFilteredTasksByStatus"
          @minimize-dialog="minimizeDialog"
          @close="closeCallback"
          @navigate-back="navigateBack"
          @update:active-tab-index="activeTabIndex = $event"
          @set-view-mode="viewMode = $event"
          @update:search-query="searchQuery = $event"
          @update:hide-completed="hideCompleted = $event"
          @open-note="openNote"
          @open-task="openTask"
          @open-journal="openJournal"
          @toggle-sticky="toggleStickyHandler"
          @edit-note="editNote"
          @delete-note="deleteCurrentNote"
          @duplicate-note="duplicateNote"
          @convert-to-task="convertToTask"
          @toggle-task-complete="toggleTaskComplete"
          @update-task-status="updateTaskStatus"
          @update-task-priority="updateTaskPriority"
          @update:task-filter="taskFilter = $event"
          @update:task-priority-filter="taskPriorityFilter = $event"
          @update:room-filter-type="roomFilterType = $event"
          @create-new-task="createNewTask"
          @create-new-journal="createNewJournal"
          @cancel-compose="cancelCompose"
          @save-note="saveNoteHandler"
          @toggle-note-type="toggleNoteType"
          @toggle-color-picker="showColorPicker = !showColorPicker"
          @update:color="draftNote.color = $event"
          @update:icon="draftNote.icon = $event"
          @update:sticky="draftNote.sticky = $event"
          @update:tags="updateTags($event)"
          @update:title="draftNote.title = $event"
          @update:details="draftNote.details = $event"
          @update:status="draftNote.status = $event"
          @update:priority="draftNote.priority = $event"
          @update:due-date="draftNote.dueDate = $event"
          @drag-task="dragTask($event.originalEvent, $event.detail)"
          @drop-task="dropTask($event.originalEvent, $event.detail)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import NotesSidebar from './components/sidebar/NotesSidebar.vue';
import NotesContent from './components/content/NotesContent.vue';
import { globalStore } from '@/stores/global';

// Import composables
import { useNotes } from './composables/useNotes';
import { useTasks } from './composables/useTasks';
import { useJournals } from './composables/useJournals';
import { useSearch } from './composables/useSearch';
import { useTagsAndContexts } from './composables/useTagsAndContexts';
import { useNoteEditor } from './composables/useNoteEditor';
import { useKeyboardShortcuts } from './utils/keyboardShortcuts';

// Props and emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialContext: {
    type: Object,
    default: () => ({ doctype: 'User', docname: '' }) 
  },
  // New props
  noteToOpen: {
    type: Object,
    default: null
  },
  noteTypeToCreate: {
    type: String,
    default: null,
    validator: (value) => value === null || ['note', 'task', 'journal'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'update:context']);

// Initialize context
const currentContext = ref({ ...props.initialContext });
if (!currentContext.value.docname && globalStore.user) {
  currentContext.value.docname = globalStore.user.name;
}

// Basic state
const activeView = ref('home'); // home, room, detail
const activeTabIndex = ref(0);
const currentNote = ref(null);
const viewMode = ref('list'); // list or grid
const searchQuery = ref('');
const hideCompleted = ref(false);
const roomFilterType = ref('all'); // all, notes, tasks, journals
const taskFilter = ref('all');
const taskPriorityFilter = ref('');

// Setup notes composable
const { 
  noteStore, 
  loadNotes, 
  toggleSticky, 
  deleteNote, 
  duplicateNote: duplicateNoteAction, 
  stickyNotes: allStickyNotes, 
  regularNotes: allRegularNotes
} = useNotes();

// Setup tasks composable
const {
  taskNotes,
  draggingTask,
  visibleStatuses,
  getStatusFeatherIcon,
  getFilteredTasksByStatus,
  updateTaskStatus: updateTaskStatusAction,
  updateTaskPriority: updateTaskPriorityAction,
  toggleTaskComplete: toggleTaskCompleteAction,
  convertToTask: convertToTaskAction,
  dragTask,
  dropTask
} = useTasks(noteStore);

// Setup journals composable
const {
  journalNotes,
  journalsByDate
} = useJournals(noteStore);

// Setup search composable for filtering notes
const {
  filteredNotes: filteredStickyNotes,
  filterNotesBySearch: filterStickyNotesBySearch
} = useSearch(allStickyNotes, hideCompleted);

const {
  filteredNotes: filteredRegularNotes,
  filterNotesBySearch: filterRegularNotesBySearch
} = useSearch(allRegularNotes, hideCompleted);

const searchResults = ref({
  stickyNotes: [],
  regularNotes: []
});

// Update search filters when query changes
watch(searchQuery, () => {
  filteredStickyNotes.value = filterStickyNotesBySearch(allStickyNotes.value);
  filteredRegularNotes.value = filterRegularNotesBySearch(allRegularNotes.value);
});

// Setup tags and contexts composable
const {
  autoRooms,
  popularTags,
  isActiveContext,
  getContextColor,
  getContextFeatherIcon
} = useTagsAndContexts(noteStore);

// Setup note editor composable
const {
  composingNote,
  noteType,
  draftNote,
  showColorPicker,
  iconPickerItems,
  getNoteTypeClass,
  createNewNote: initNewNote,
  createNewTask: initNewTask,
  createNewJournal: initNewJournal,
  editNote: startEditNote,
  cancelCompose,
  toggleNoteType,
  updateTags,
  saveNote
} = useNoteEditor(currentContext.value);

// Room-specific notes
const roomNotes = computed(() => 
  noteStore.notes.filter(note => 
    note.rel_doctype === currentContext.value.doctype && 
    note.rel_docname === currentContext.value.docname &&
    !note.task && !note.journal
  )
);

const roomTasks = computed(() => 
  noteStore.notes.filter(note => 
    note.rel_doctype === currentContext.value.doctype && 
    note.rel_docname === currentContext.value.docname &&
    note.task
  )
);

const roomJournals = computed(() => 
  noteStore.notes.filter(note => 
    note.rel_doctype === currentContext.value.doctype && 
    note.rel_docname === currentContext.value.docname &&
    note.journal
  )
);

const filteredRoomNotes = computed(() => {
  let result = [];
  
  if (roomFilterType.value === 'all' || roomFilterType.value === 'notes') {
    result = result.concat(roomNotes.value);
  }
  
  if (roomFilterType.value === 'all' || roomFilterType.value === 'tasks') {
    result = result.concat(roomTasks.value);
  }
  
  if (roomFilterType.value === 'all' || roomFilterType.value === 'journals') {
    result = result.concat(roomJournals.value);
  }
  
  // Hide completed if enabled
  if (hideCompleted.value) {
    result = result.filter(note => note.status !== 'Completed' && note.status !== 'Cancelled');
  }
  
  return result;
});

// Generated header title
const headerTitle = computed(() => {
  if (composingNote.value) {
    return draftNote.value.name ? 'Edit Note' : 'New Note';
  }
  
  if (activeView.value === 'home') {
    if (activeTabIndex.value === 0) return 'Notes';
    if (activeTabIndex.value === 1) return 'Tasks';
    if (activeTabIndex.value === 2) return 'Journal';
    return 'Notes';
  }
  
  if (activeView.value === 'room') {
    return `${currentContext.value.doctype} Notes`;
  }
  
  if (activeView.value === 'detail' && currentNote.value) {
    return currentNote.value.title || 'Untitled';
  }
  
  return 'Notes';
});

// Watch for visibility changes
watch(() => props.modelValue, (newVal) => {
  if (newVal && !noteStore.notes.length) {
    // Load notes when dialog becomes visible
    loadNotes();
  }
  
  // Save state when dialog is closed
  if (!newVal) {
    noteStore.saveViewState(activeView.value, composingNote.value, composingNote.value ? draftNote.value : null);
  }
});

// Watch for context changes
watch(() => props.initialContext, (newContext) => {
  currentContext.value = { ...newContext };
  if (!currentContext.value.docname && globalStore.user) {
    currentContext.value.docname = globalStore.user.name;
  }
  
  // If in room view, refresh to show correct context
  if (activeView.value === 'room') {
    // Reset filter when context changes
    roomFilterType.value = 'all';
  }
  
  // Notify parent about context change
  emit('update:context', currentContext.value);
}, { deep: true });

// Watch for noteToOpen changes
watch(() => props.noteToOpen, (note) => {
  if (note && props.modelValue) {
    handleOpenSpecificNote(note);
  }
}, { deep: true });

// Watch for noteTypeToCreate changes
watch(() => props.noteTypeToCreate, (type) => {
  if (type && props.modelValue) {
    handleCreateWithType(type);
  }
}, { deep: true });

// Watch for dialog becoming visible
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    if (props.noteToOpen) {
      handleOpenSpecificNote(props.noteToOpen);
    } else if (props.noteTypeToCreate) {
      handleCreateWithType(props.noteTypeToCreate);
    }
  }
});

// Function to handle opening a specific note
function handleOpenSpecificNote(note) {
  // Set the view to detail and load the note
  nextTick(() => {
    // Find the note in the store if we only have an ID
    let noteToOpen = note;
    if (typeof note === 'string' || note.name) {
      const noteName = typeof note === 'string' ? note : note.name;
      noteToOpen = noteStore.notes.find(n => n.name === noteName) || note;
    }
    
    // Open the note
    currentNote.value = noteToOpen;
    activeView.value = 'detail';
  });
}

// Function to handle creating with a specific type
function handleCreateWithType(type) {
  nextTick(() => {
    switch (type) {
      case 'note':
        createNewNote();
        break;
      case 'task':
        createNewTask();
        break;
      case 'journal':
        createNewJournal();
        break;
    }
  });
}

// Initialize and fetch notes
onMounted(async () => {
  if (props.modelValue) {
    await loadNotes();
  }
  
  // Set room view if context is not user's personal notes
  if (props.initialContext.doctype !== 'User') {
    activeView.value = 'room';
  }
  
  // Restore previous state if available
  if (noteStore.lastView) {
    activeView.value = noteStore.lastView;
  }
  
  if (noteStore.lastComposeState) {
    composingNote.value = true;
    if (noteStore.draftNote) {
      draftNote.value = { ...noteStore.draftNote };
      
      // Set note type based on draft
      if (draftNote.value.task) {
        noteType.value = 'task';
      } else if (draftNote.value.journal) {
        noteType.value = 'journal';
      } else {
        noteType.value = 'note';
      }
    }
  }
  
  // Setup keyboard shortcuts
  const { setupKeyboardShortcuts, cleanupKeyboardShortcuts } = useKeyboardShortcuts({
    isDialogVisible: () => props.modelValue,
    composingNote,
    activeView,
    activeTabIndex,
    cancelCompose,
    navigateBack,
    saveNote: saveNoteHandler,
    createNewNote,
    createNewTask,
    createNewJournal
  });
  
  setupKeyboardShortcuts();
  
  return cleanupKeyboardShortcuts;
});

// Core navigation methods
const minimizeDialog = () => {
  emit('update:modelValue', false);
};

const navigateBack = () => {
  if (activeView.value === 'detail') {
    // Go back to home or room view based on where we came from
    activeView.value = currentNote.value.rel_doctype === currentContext.value.doctype && 
                      currentNote.value.rel_docname === currentContext.value.docname ? 
                      'room' : 'home';
  } else if (activeView.value === 'room') {
    activeView.value = 'home';
  }
  
  currentNote.value = null;
};

const goToHome = () => {
  activeView.value = 'home';
  activeTabIndex.value = 0;
};

// Content operation methods
const openNote = (note) => {
  currentNote.value = note;
  activeView.value = 'detail';
};

const openTask = (task) => {
  currentNote.value = task;
  activeView.value = 'detail';
};

const openJournal = (journal) => {
  currentNote.value = journal;
  activeView.value = 'detail';
};

// Action handlers
const toggleStickyHandler = (noteName) => {
  toggleSticky(noteName, currentNote.value);
};

const deleteCurrentNote = async () => {
  if (!currentNote.value) return;
  
  const success = await deleteNote(currentNote.value.name);
  if (success) {
    navigateBack();
  }
};

const duplicateNote = async (note) => {
  await duplicateNoteAction(note);
};

const convertToTask = async () => {
  if (!currentNote.value) return;
  
  const success = await convertToTaskAction(currentNote.value.name);
  if (success && currentNote.value) {
    // Refresh the current note
    await noteStore.fetchNote(currentNote.value.name);
  }
};

const updateTaskStatus = async (task, newStatus) => {
  const success = await updateTaskStatusAction(task, newStatus);
  
  // Update current note if it's the one being modified
  if (success && currentNote.value && currentNote.value.name === task.name) {
    currentNote.value.status = newStatus;
  }
};

const updateTaskPriority = async (task, newPriority) => {
  const success = await updateTaskPriorityAction(task, newPriority);
  
  // Update current note if it's the one being modified
  if (success && currentNote.value && currentNote.value.name === task.name) {
    currentNote.value.priority = newPriority;
  }
};

const toggleTaskComplete = async (task) => {
  await toggleTaskCompleteAction(task);
};

// Create new methods - these delegate to the composable but handle context
const createNewNote = () => {
  initNewNote(currentContext.value);
};

const createNewTask = () => {
  initNewTask(currentContext.value);
};

const createNewJournal = () => {
  initNewJournal(currentContext.value);
};

// Edit note - passes the note to the editor
const editNote = (note) => {
  startEditNote(note);
};

// Save note handler - delegates to the composable
const saveNoteHandler = async () => {
  await saveNote(noteStore);
};

// Method to switch to a specific context (room)
const switchToContext = (context) => {
  currentContext.value = { ...context };
  emit('update:context', currentContext.value);
  activeView.value = 'room';
};

// Handle tag filtering
const filterByTag = (tag) => {
  searchQuery.value = `#${tag}`;
  activeView.value = 'home';
  activeTabIndex.value = 0;
};
</script>

<style scoped>
/* Base dialog styling */
.notes-dialog {
  transition: all 0.2s ease;
}
</style>