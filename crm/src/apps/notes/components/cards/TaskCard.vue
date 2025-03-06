<template>
  <div 
    class="task-card p-3 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer transition-all transform hover:shadow-md hover:-translate-y-1 relative group"
    :class="[
      task.color ? 'border-l-4' : 'border-l',
      'task-priority-' + (task.priority ? task.priority.toLowerCase() : 'none'),
      viewMode === 'compact' ? 'mb-2' : ''
    ]"
    :style="task.color ? {borderLeftColor: task.color} : {}"
    @click.stop="$emit('click')"
    :draggable="draggable ? 'true' : 'false'"
    @dragstart="draggable ? $emit('dragstart', $event) : null"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2 min-w-0">
        <div 
          class="p-1 rounded-md cursor-pointer flex-shrink-0"
          @click.stop="$emit('toggle-complete')"
          :class="task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/20' : ''"
        >
          <FeatherIcon 
            :name="task.status === 'Completed' ? 'check-circle' : 'circle'"
            class="w-4 h-4"
            :class="task.status === 'Completed' ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'"
          />
        </div>
        
        <div class="min-w-0 flex-1">
          <div 
            class="font-medium line-clamp-1"
            :class="task.status === 'Completed' ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'"
          >
            {{ task.title || 'Untitled Task' }}
          </div>
          
          <div class="flex flex-wrap items-center mt-1 gap-2 text-xs">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
              :class="statusClasses[task.status] || 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'"
            >
              {{ task.status }}
            </span>
            
            <span 
              v-if="task.priority" 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
              :class="priorityClasses[task.priority] || 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'"
              @click.stop="openPriorityMenu($event)"
            >
              {{ task.priority }}
            </span>
            
            <span 
              v-if="task.due" 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
              :class="isOverdue(task.due) ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'"
            >
              <FeatherIcon name="calendar" class="w-3 h-3 mr-1" />
              {{ formatDueDate(task.due) }}
            </span>
          </div>
          
          <div 
            v-if="viewMode === 'list' && task.details" 
            class="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2"
            v-html="safeHtml(truncateHTML(task.details, 100))"
          ></div>
        </div>
      </div>
      
      <div v-if="viewMode !== 'compact'" class="flex-shrink-0 mt-1">
        <Menu ref="priorityMenu" :model="priorityMenuItems" :popup="true" />
        <button 
          class="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="$emit('toggle-sticky', task.name)"
        >
          <FeatherIcon 
            name="star" 
            class="w-5 h-5"
            :class="task.sticky ? 'fill-amber-500 text-amber-500' : ''" 
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDueDate, isOverdue } from '../../utils/noteFormatters';
import { safeHtml } from '../../utils/htmlHelpers';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'list'
  },
  draggable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'click', 
  'toggle-sticky', 
  'toggle-complete', 
  'update-priority',
  'dragstart'
]);

const priorityMenu = ref(null);

// CSS classes for different statuses
const statusClasses = {
  'Completed': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  'To Do': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  'On Hold': 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  'In Progress': 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  'Delayed': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  'Cancelled': 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
};

// CSS classes for different priorities
const priorityClasses = {
  'High': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  'Medium': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  'Low': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
};

// Priority menu items
const priorityMenuItems = computed(() => [
  {
    label: 'High Priority',
    icon: 'pi pi-flag-fill',
    class: 'text-red-500',
    command: () => emit('update-priority', 'High')
  },
  {
    label: 'Medium Priority',
    icon: 'pi pi-flag',
    class: 'text-yellow-500',
    command: () => emit('update-priority', 'Medium')
  },
  {
    label: 'Low Priority',
    icon: 'pi pi-flag',
    class: 'text-blue-500',
    command: () => emit('update-priority', 'Low')
  }
]);

// Open priority menu
const openPriorityMenu = (event) => {
  priorityMenu.value.toggle(event);
  event.stopPropagation();
};

// Truncate HTML content
const truncateHTML = (html, maxLength) => {
  if (!html) return '';
  
  // Simple HTML truncation
  const textContent = html.replace(/<[^>]*>/g, '');
  
  if (textContent.length <= maxLength) {
    return html;
  }
  
  return textContent.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-priority-high {
  border-left-color: #ef4444 !important;
}

.task-priority-medium {
  border-left-color: #f59e0b !important;
}

.task-priority-low {
  border-left-color: #3b82f6 !important;
}

/* Make line-clamp work in more browsers */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>