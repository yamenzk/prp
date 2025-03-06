<template>
  <div class="inline-block">
    <Button 
      :label="getButtonLabel()"
      :icon="getButtonIcon()"
      :class="buttonClass"
      @click="openNoteCreator"
    />
    <Menu v-if="showMenu" ref="typeMenu" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';

const props = defineProps({
  doctype: {
    type: String,
    default: 'User'
  },
  docname: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: '', // Empty means show menu, otherwise 'note', 'task', or 'journal'
    validator: (value) => ['', 'note', 'task', 'journal'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  tooltip: {
    type: String,
    default: ''
  },
  buttonClass: {
    type: String,
    default: 'p-button-primary'
  },
  size: {
    type: String,
    default: 'normal', // 'small', 'normal', 'large'
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
});

// Access the notes dialog API
const notesDialog = inject('notesDialog', {
  open: () => console.warn('Notes dialog API not available'),
  setContext: () => {}
});

const typeMenu = ref(null);
const showMenu = computed(() => props.type === '');

// Menu items for note type selection
const menuItems = [
  {
    label: 'Create Note',
    icon: 'pi pi-file-edit',
    command: () => createNote('note')
  },
  {
    label: 'Create Task',
    icon: 'pi pi-check-square',
    command: () => createNote('task')
  },
  {
    label: 'Create Journal Entry',
    icon: 'pi pi-book',
    command: () => createNote('journal')
  }
];

// Helper methods
function getButtonLabel() {
  if (props.label) return props.label;
  
  if (props.type === 'note') return 'New Note';
  if (props.type === 'task') return 'New Task';
  if (props.type === 'journal') return 'New Journal';
  
  return 'Create';
}

function getButtonIcon() {
  if (props.type === 'note') return 'pi pi-file-edit';
  if (props.type === 'task') return 'pi pi-check-square';
  if (props.type === 'journal') return 'pi pi-book';
  
  return 'pi pi-plus';
}

// Open the appropriate note creator
function openNoteCreator() {
  if (props.type) {
    createNote(props.type);
  } else {
    typeMenu.value.toggle(event);
  }
}

// Create the specific note type
function createNote(type) {
  // Set context
  const context = {
    doctype: props.doctype,
    docname: props.docname
  };
  
  // Open the dialog with the appropriate noteType
  notesDialog.open(context);
  
  // We'll need to modify the noteEditor interface to accept a type parameter
  // This would be added in the App.vue provider
  if (notesDialog.createWithType) {
    notesDialog.createWithType(type, context);
  }
}
</script>

<style scoped>
/* You can add size-specific styles here if needed */
</style>