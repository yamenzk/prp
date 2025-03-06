<template>
  <div class="sticky-notes-widget">
    <div class="flex flex-wrap gap-1 items-center">
      <div v-if="loading" class="p-2">
        <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
      </div>
      
      <template v-else>
        <div v-if="stickyNotes.length === 0" class="text-sm text-gray-500 p-1">
          No sticky notes
        </div>
        
        <div
          v-for="(note, index) in stickyNotes"
          :key="note.name"
          class="sticky-note-dot cursor-pointer relative transition-transform hover:scale-110"
          :style="getDotStyle(note)"
          @click="openPopover($event, index)"
        >
          <span 
            v-if="note.task && note.status !== 'Completed'" 
            class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
          ></span>
        </div>
      </template>
    </div>
    
    <!-- Popover for note content -->
    <Popover 
      ref="popover" 
      :showCloseIcon="true"
      :closeOnEscape="true"
      class="sticky-note-popover"
    >
      <template v-if="activeNote">
        <div class="sticky-note-content" :style="getContentStyle(activeNote)">
          <div class="sticky-note-header flex justify-between items-center mb-2">
            <h3 class="text-lg font-medium">{{ activeNote.title || 'Untitled' }}</h3>
            <div v-if="activeNote.icon" class="text-2xl">{{ activeNote.icon }}</div>
          </div>
          
          <div 
            v-if="activeNote.task"
            class="sticky-note-status mb-2 flex items-center"
          >
            <Tag 
              :value="activeNote.status" 
              :severity="getStatusSeverity(activeNote.status)"
              class="mr-2"
            />
            <Tag 
              v-if="activeNote.priority"
              :value="activeNote.priority" 
              :severity="getPrioritySeverity(activeNote.priority)"
            />
          </div>
          
          <div 
            class="sticky-note-details mb-3 max-h-40 overflow-y-auto text-sm"
            v-html="safeHtml(activeNote.details)"
          ></div>
          
          <div class="sticky-note-footer flex justify-between">
            <div class="text-xs text-gray-500">
              {{ formatDate(activeNote.modified) }}
            </div>
            
            <div class="flex gap-2">
              <Button
                v-if="activeNote.task && activeNote.status !== 'Completed'"
                label="Mark Complete"
                size="small"
                @click="markComplete(activeNote)"
                class="p-button-sm p-button-success"
              />
              <Button
                label="View"
                size="small"
                @click="openNote(activeNote)"
                class="p-button-sm p-button-secondary"
              />
            </div>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import Popover from 'primevue/popover';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import { useNoteStore } from '@/stores/notes';
import { formatDate } from '@/apps/notes/utils/noteFormatters';
import { getStatusSeverity, getPrioritySeverity } from '@/apps/notes/utils/noteStatusHelpers';
import { safeHtml } from '@/apps/notes/utils/htmlHelpers';

const props = defineProps({
  doctype: {
    type: String,
    default: '' // Optional - if not provided, show all sticky notes
  },
  docname: {
    type: String,
    default: '' // Optional - if not provided, show all sticky notes
  },
  limit: {
    type: Number,
    default: 5
  }
});

// Access the notes dialog API
const notesDialog = inject('notesDialog', {
  open: () => console.warn('Notes dialog API not available')
});

// Setup store and state
const noteStore = useNoteStore();
const loading = ref(true);
const popover = ref(null);
const activeNoteIndex = ref(null);

// Load notes on mount
onMounted(() => {
  loadStickyNotes();
});

// Watch for prop changes
watch(() => [props.doctype, props.docname], () => {
  loading.value = true;
  loadStickyNotes();
}, { deep: true });

// Computed active note
const activeNote = computed(() => {
  if (activeNoteIndex.value === null) return null;
  return stickyNotes.value[activeNoteIndex.value] || null;
});

// Filter sticky notes
const stickyNotes = computed(() => {
  // Return all sticky notes if no context is provided
  if (!props.doctype || !props.docname) {
    return noteStore.notes
      .filter(note => note.sticky)
      .slice(0, props.limit);
  }
  
  // Return context-specific sticky notes
  return noteStore.notes
    .filter(note => 
      note.sticky && 
      note.rel_doctype === props.doctype && 
      note.rel_docname === props.docname
    )
    .slice(0, props.limit);
});

// Load sticky notes
async function loadStickyNotes() {
  try {
    if (props.doctype && props.docname) {
      await noteStore.fetchNotesByContext(props.doctype, props.docname);
    } else {
      await noteStore.fetchNotes();
    }
    loading.value = false;
  } catch (error) {
    console.error('Failed to load sticky notes:', error);
    loading.value = false;
  }
}

// Get dot style based on note
function getDotStyle(note) {
  const color = note.color || '#9ca3af'; // Default gray color
  return {
    backgroundColor: color,
    borderColor: note.task && note.status !== 'Completed' ? 'rgba(239, 68, 68, 0.5)' : 'transparent'
  };
}

// Get content style for popover
function getContentStyle(note) {
  const color = note.color || '#9ca3af';
  return {
    borderLeft: `4px solid ${color}`
  };
}

// Open popover
function openPopover(event, index) {
  activeNoteIndex.value = index;
  popover.value.toggle(event);
}

// Mark task as complete
async function markComplete(note) {
  if (!note.task) return;
  
  try {
    await noteStore.updateNote(note.name, { status: 'Completed' });
    popover.value.hide();
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
}

// Open note in the dialog
function openNote(note) {
  notesDialog.open({
    doctype: note.rel_doctype,
    docname: note.rel_docname
  });
  
  // We need to modify the notesDialog API to include an openNote method
  if (notesDialog.openNote) {
    notesDialog.openNote(note);
  }
  
  popover.value.hide();
}
</script>

<style scoped>
.sticky-note-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid transparent;
}

.sticky-note-content {
  width: 300px;
  padding: 12px;
  border-radius: 4px;
}

.sticky-note-details {
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
}

.sticky-note-details::-webkit-scrollbar {
  width: 4px;
}

.sticky-note-details::-webkit-scrollbar-track {
  background: transparent;
}

.sticky-note-details::-webkit-scrollbar-thumb {
  background-color: rgba(161, 161, 170, 0.3);
  border-radius: 4px;
}

.dark .sticky-note-details::-webkit-scrollbar-thumb {
  background-color: rgba(113, 113, 122, 0.4);
}
</style>