<template>
  <div class="h-full overflow-y-auto custom-scrollbar">
    <div 
      class="p-4 border-b dark:border-zinc-700 sticky top-0 z-10 bg-white dark:bg-zinc-900 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm"
      :style="currentNote.color ? {borderColor: currentNote.color} : {}"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="text-2xl flex items-center justify-center w-12 h-12 rounded-full" 
            v-if="currentNote.icon"
            :style="currentNote.color ? {backgroundColor: `${currentNote.color}20`, color: currentNote.color} : {}"
          >{{ currentNote.icon }}</div>
          <div>
            <div class="text-xl font-medium text-zinc-800 dark:text-zinc-200 mb-1">{{ currentNote.title || 'Untitled' }}</div>
            <div class="text-xs text-zinc-500 flex items-center gap-2">
              <span>{{ formatDate(currentNote.modified) }}</span>
              <span class="inline-block w-1 h-1 rounded-full bg-zinc-400"></span>
              <span>{{ currentNote.rel_doctype }}: {{ currentNote.rel_docname }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-1">
          <Button 
            text 
            rounded 
            @click="$emit('toggle-sticky', currentNote.name)"
          >
            <template #icon>
              <FeatherIcon 
                name="star" 
                class="w-5 h-5"
                :class="currentNote.sticky ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'" 
              />
            </template>
          </Button>
          <Button 
            text 
            rounded 
            class="text-zinc-500" 
            @click="$emit('edit-note', currentNote)"
          >
            <template #icon>
              <FeatherIcon name="edit-2" class="w-5 h-5" />
            </template>
          </Button>
          <Menu ref="noteMenu" :model="noteMenuItems" :popup="true" />
          <Button 
            text 
            rounded 
            class="text-zinc-500" 
            @click="noteMenu.toggle($event)"
          >
            <template #icon>
              <FeatherIcon name="more-horizontal" class="w-5 h-5" />
            </template>
          </Button>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 mt-3">
        <Tag 
          v-if="currentNote.task" 
          icon="pi pi-check-square" 
          severity="info" 
          value="Task"
          class="rounded-full"
        ></Tag>
        <Tag 
          v-if="currentNote.journal" 
          icon="pi pi-book" 
          severity="secondary" 
          value="Journal"
          class="rounded-full"
        ></Tag>
        <Tag 
          v-if="currentNote.status && currentNote.status !== 'Backlog'" 
          :severity="getStatusSeverity(currentNote.status)"
          :value="currentNote.status"
          class="rounded-full"
          @click="currentNote.task && openStatusDropdown($event)"
        ></Tag>
        <Tag 
          v-if="currentNote.priority" 
          :severity="getPrioritySeverity(currentNote.priority)"
          :value="currentNote.priority"
          class="rounded-full"
          @click="currentNote.task && openPriorityDropdown($event)"
        ></Tag>
        <Tag 
          v-if="currentNote.due" 
          :severity="isOverdue(currentNote.due) ? 'danger' : 'warn'"
          :value="formatDueDate(currentNote.due)"
          class="rounded-full"
        >
          <template #icon>
            <FeatherIcon name="calendar" class="w-3 h-3 mr-1" />
          </template>
        </Tag>
      </div>
      
      <!-- Tags display -->
      <div v-if="noteTags.length > 0" class="flex flex-wrap gap-1 mt-3">
        <span 
          v-for="(tag, index) in noteTags" 
          :key="index"
          class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
    
    <div v-html="safeHtml(currentNote.details)" class="prose prose-zinc dark:prose-invert max-w-none p-4 content-area"></div>
    
    <!-- Status dropdown -->
    <Menu ref="statusDropdown" :model="statusDropdownItems" :popup="true" />
    
    <!-- Priority dropdown -->
    <Menu ref="priorityDropdown" :model="priorityDropdownItems" :popup="true" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDate, formatDueDate, isOverdue } from '../../utils/noteFormatters';
import { getStatusSeverity, getPrioritySeverity } from '../../utils/noteStatusHelpers';
import { safeHtml } from '../../utils/htmlHelpers';

const props = defineProps({
  currentNote: {
    type: Object,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  },
  priorityOptions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  'toggle-sticky',
  'edit-note',
  'delete-note',
  'duplicate-note',
  'convert-to-task',
  'update-task-status',
  'update-task-priority'
]);

const noteMenu = ref(null);
const statusDropdown = ref(null);
const priorityDropdown = ref(null);

// Extract tags from current note
const noteTags = computed(() => {
  if (!props.currentNote || !props.currentNote.tags) return [];
  
  return typeof props.currentNote.tags === 'string'
    ? props.currentNote.tags.split(',').filter(t => t.trim())
    : props.currentNote.tags;
});

// Context menu items for notes
const noteMenuItems = computed(() => {
  const items = [
    {
      label: 'Duplicate',
      icon: 'pi pi-copy',
      command: () => emit('duplicate-note', props.currentNote)
    },
    {
      separator: true
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      class: 'text-red-500',
      command: () => emit('delete-note')
    }
  ];
  
  if (props.currentNote && !props.currentNote.task) {
    items.splice(1, 0, {
      label: 'Convert to Task',
      icon: 'pi pi-check-square',
      command: () => emit('convert-to-task')
    });
  }
  
  return items;
});

// Status dropdown items
const statusDropdownItems = computed(() => {
  return props.statusOptions.map(option => ({
    label: option.label,
    command: () => emit('update-task-status', { 
      task: props.currentNote, 
      status: option.value 
    })
  }));
});

// Priority dropdown items
const priorityDropdownItems = computed(() => {
  return props.priorityOptions.map(option => ({
    label: option.label,
    command: () => emit('update-task-priority', { 
      task: props.currentNote, 
      priority: option.value 
    })
  }));
});

// Open status dropdown
const openStatusDropdown = (event) => {
  statusDropdown.value.toggle(event);
};

// Open priority dropdown
const openPriorityDropdown = (event) => {
  priorityDropdown.value.toggle(event);
};
</script>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(161, 161, 170, 0.3);
  border-radius: 6px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(113, 113, 122, 0.4);
}

/* Content area typography */
.content-area {
  line-height: 1.6;
}

.content-area h1, .content-area h2, .content-area h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.content-area p {
  margin-bottom: 1em;
}
</style>