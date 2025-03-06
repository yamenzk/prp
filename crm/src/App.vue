<template>
  <div>
    <router-view />
    <NotesDialog 
      v-if="isNotesDialogMounted"
      v-model="showNotesDialog" 
      :initial-context="currentContext"
      :note-to-open="noteToOpen"
      :note-type-to-create="noteTypeToCreate"
      @update:context="handleContextChange"
    />
    <AppDock @open-notes="openNotesDialog" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { globalStore } from '@/stores/global';
import NotesDialog from '@/apps/notes/NotesDialog.vue';
import AppDock from '@/components/layout/AppDock.vue';

// State for NotesDialog
const showNotesDialog = ref(false);
const isNotesDialogMounted = ref(false);
const currentContext = ref({
  doctype: 'User',
  docname: ''
});

// New refs for enhanced functionality
const noteToOpen = ref(null);
const noteTypeToCreate = ref(null);

// Initialize route
const route = useRoute();

// Flag to prevent recursive updates
let isUpdatingContext = false;

// Methods to control the notes dialog
function openNotesDialog(context = null) {
  if (isUpdatingContext) return;
  
  isUpdatingContext = true;
  
  // Reset special state
  noteToOpen.value = null;
  noteTypeToCreate.value = null;
  
  if (context) {
    currentContext.value = { ...context };
  } else {
    // Use current route to determine context if not provided
    const routeContext = getContextFromRoute();
    currentContext.value = { ...routeContext };
  }
  
  nextTick(() => {
    showNotesDialog.value = true;
    isUpdatingContext = false;
  });
}

// New method to open a specific note
function openSpecificNote(note) {
  if (isUpdatingContext) return;
  
  isUpdatingContext = true;
  
  // Set the note to open
  noteToOpen.value = note;
  
  // Set the context from the note if available
  if (note.rel_doctype && note.rel_docname) {
    currentContext.value = {
      doctype: note.rel_doctype,
      docname: note.rel_docname
    };
  }
  
  nextTick(() => {
    showNotesDialog.value = true;
    isUpdatingContext = false;
  });
}

// New method to create a specific note type
function createNoteWithType(type, context) {
  if (isUpdatingContext) return;
  
  isUpdatingContext = true;
  
  // Set the note type to create
  noteTypeToCreate.value = type;
  
  // Set the context if provided
  if (context) {
    currentContext.value = { ...context };
  }
  
  nextTick(() => {
    showNotesDialog.value = true;
    isUpdatingContext = false;
  });
}

function closeNotesDialog() {
  showNotesDialog.value = false;
  // Reset special state
  noteToOpen.value = null;
  noteTypeToCreate.value = null;
}

function setNotesContext(context) {
  if (isUpdatingContext) return;
  
  isUpdatingContext = true;
  currentContext.value = { ...context };
  isUpdatingContext = false;
}

function handleContextChange(newContext) {
  if (isUpdatingContext) return;
  
  isUpdatingContext = true;
  currentContext.value = { ...newContext };
  isUpdatingContext = false;
}

// Extract context from the current route
function getContextFromRoute() {
  if (!route) return { doctype: 'User', docname: globalStore.user?.name || '' };
  
  if (route.name === 'lead-detail' && route.params.id) {
    return {
      doctype: 'PRP Lead',
      docname: route.params.id
    };
  } else if (route.name === 'deal-detail' && route.params.id) {
    return {
      doctype: 'PRP Deal',
      docname: route.params.id
    };
  } else if (route.name === 'customer-detail' && route.params.id) {
    return {
      doctype: 'PRP Customer',
      docname: route.params.id
    };
  } else {
    // Default to user's personal notes
    return {
      doctype: 'User',
      docname: globalStore.user?.name || ''
    };
  }
}

// Initialize user context when available and provide notes API
onMounted(() => {
  if (globalStore.user?.name) {
    currentContext.value.docname = globalStore.user.name;
  }
  
  // Provide enhanced notes-related functionality to child components
  provide('notesDialog', {
    open: openNotesDialog,
    close: closeNotesDialog,
    setContext: setNotesContext,
    openNote: openSpecificNote,
    createWithType: createNoteWithType
  });
  
  // Mount the dialog after setup is complete
  nextTick(() => {
    isNotesDialogMounted.value = true;
  });
});
</script>