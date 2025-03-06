<template>
  <div class="notes-view">
    <!-- Header with filtering options -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium">{{ title }}</h3>
      
      <div class="flex items-center gap-2">
        <TabMenu 
          v-if="showTabs" 
          :model="tabs" 
          v-model:activeIndex="activeTabIndex"
          class="p-tabmenu-sm" 
        />
        
        <CreateNoteButton 
          :doctype="doctype" 
          :docname="docname"
          size="small"
          buttonClass="p-button-sm"
        />
      </div>
    </div>
    
    <!-- Content based on activeTabIndex -->
    <div v-if="loading" class="flex justify-center p-4">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    
    <div v-else>
      <!-- Notes Tab -->
      <div v-if="activeTabIndex === 0 || !showTabs" class="space-y-3">
        <div v-if="filteredNotes.length === 0" class="text-center p-4 text-gray-500">
          No notes found for this {{ doctype.toLowerCase() }}.
        </div>
        
        <NoteCard 
          v-for="note in filteredNotes" 
          :key="note.name"
          :note="note"
          view-mode="list"
          @click="openNote(note)"
          @toggle-sticky="toggleSticky(note.name)"
        />
      </div>
      
      <!-- Tasks Tab -->
      <div v-if="activeTabIndex === 1 && showTabs" class="space-y-3">
        <div v-if="filteredTasks.length === 0" class="text-center p-4 text-gray-500">
          No tasks found for this {{ doctype.toLowerCase() }}.
        </div>
        
        <TaskCard 
          v-for="task in filteredTasks" 
          :key="task.name"
          :task="task"
          view-mode="list"
          @click="openNote(task)"
          @toggle-complete="toggleTaskComplete(task)"
        />
      </div>
      
      <!-- Journal Tab -->
      <div v-if="activeTabIndex === 2 && showTabs" class="space-y-3">
        <div v-if="filteredJournals.length === 0" class="text-center p-4 text-gray-500">
          No journal entries found for this {{ doctype.toLowerCase() }}.
        </div>
        
        <JournalCard 
          v-for="journal in filteredJournals" 
          :key="journal.name"
          :journal="journal"
          @click="openNote(journal)"
        />
      </div>
    </div>
    
    <!-- Load more button -->
    <div v-if="canLoadMore" class="text-center mt-4">
      <Button 
        label="Load More" 
        icon="pi pi-chevron-down" 
        text 
        @click="loadMore"
        :loading="loadingMore"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import TabMenu from 'primevue/tabmenu';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useNoteStore } from '@/stores/notes';
import NoteCard from '@/apps/notes/components/cards/NoteCard.vue';
import TaskCard from '@/apps/notes/components/cards/TaskCard.vue';
import JournalCard from '@/apps/notes/components/cards/JournalCard.vue';
import CreateNoteButton from './CreateNoteButton.vue';

const props = defineProps({
  doctype: {
    type: String,
    required: true
  },
  docname: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Notes'
  },
  limit: {
    type: Number,
    default: 5
  },
  showTabs: {
    type: Boolean,
    default: true
  },
  filter: {
    type: String,
    default: '' // 'note', 'task', 'journal', or empty for all
  }
});

// Access the notes dialog API
const notesDialog = inject('notesDialog', {
  open: () => console.warn('Notes dialog API not available')
});

// Setup store and state
const noteStore = useNoteStore();
const loading = ref(true);
const loadingMore = ref(false);
const activeTabIndex = ref(0);
const visibleLimit = ref(props.limit);

// Set initial tab based on filter prop
onMounted(() => {
  if (props.filter === 'task') activeTabIndex.value = 1;
  if (props.filter === 'journal') activeTabIndex.value = 2;
  
  loadNotes();
});

// Tab menu model
const tabs = [
  { label: 'Notes', icon: 'pi pi-file' },
  { label: 'Tasks', icon: 'pi pi-check-square' },
  { label: 'Journal', icon: 'pi pi-book' }
];

// Watch for prop changes to reload data
watch(() => [props.doctype, props.docname], () => {
  loading.value = true;
  visibleLimit.value = props.limit;
  loadNotes();
}, { deep: true });

// Filtered data computed properties
const allNotes = computed(() => {
  return noteStore.notes.filter(note => 
    note.rel_doctype === props.doctype && 
    note.rel_docname === props.docname
  );
});

const filteredNotes = computed(() => {
  return allNotes.value
    .filter(note => !note.task && !note.journal)
    .slice(0, visibleLimit.value);
});

const filteredTasks = computed(() => {
  return allNotes.value
    .filter(note => note.task)
    .slice(0, visibleLimit.value);
});

const filteredJournals = computed(() => {
  return allNotes.value
    .filter(note => note.journal)
    .slice(0, visibleLimit.value);
});

const canLoadMore = computed(() => {
  if (activeTabIndex.value === 0 || !props.showTabs) {
    return filteredNotes.value.length < allNotes.value.filter(note => !note.task && !note.journal).length;
  } else if (activeTabIndex.value === 1) {
    return filteredTasks.value.length < allNotes.value.filter(note => note.task).length;
  } else {
    return filteredJournals.value.length < allNotes.value.filter(note => note.journal).length;
  }
});

// Load notes for this context
async function loadNotes() {
  try {
    await noteStore.fetchNotesByContext(props.doctype, props.docname);
    loading.value = false;
  } catch (error) {
    console.error('Failed to load notes:', error);
    loading.value = false;
  }
}

// Load more items
function loadMore() {
  loadingMore.value = true;
  visibleLimit.value += props.limit;
  
  setTimeout(() => {
    loadingMore.value = false;
  }, 300);
}

// Open a note in the dialog
function openNote(note) {
  notesDialog.open({
    doctype: props.doctype,
    docname: props.docname
  });
  
  // We need to modify the notesDialog API to include an openNote method
  if (notesDialog.openNote) {
    notesDialog.openNote(note);
  }
}

// Toggle sticky status
async function toggleSticky(noteName) {
  try {
    await noteStore.toggleSticky(noteName);
  } catch (error) {
    console.error('Failed to toggle sticky:', error);
  }
}

// Toggle task complete status
async function toggleTaskComplete(task) {
  const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
  
  try {
    await noteStore.updateNote(task.name, { status: newStatus });
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
}
</script>

<style scoped>
/* Add custom styling if needed */
.p-tabmenu-sm :deep(.p-tabmenu-nav) {
  font-size: 0.875rem;
}
</style>