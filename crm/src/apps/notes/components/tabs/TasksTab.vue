<template>
  <div class="overflow-hidden flex-1 flex flex-col">
    <TaskBoardHeader
      :task-filter="taskFilter"
      :task-priority-filter="taskPriorityFilter"
      @update:task-filter="$emit('update:task-filter', $event)"
      @update:task-priority-filter="$emit('update:task-priority-filter', $event)"
      @create-new-task="$emit('create-new-task')"
    />
    
    <div class="flex-1 overflow-hidden">
      <div class="task-board h-full flex">
        <div 
          v-for="status in visibleStatuses" 
          :key="status"
          class="task-column flex-1 min-w-[250px] h-full flex flex-col"
          :class="{'border-r border-zinc-200 dark:border-zinc-800': status !== visibleStatuses[visibleStatuses.length - 1]}"
        >
          <div class="p-2 text-xs font-medium text-center border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1">
            <FeatherIcon :name="getStatusFeatherIcon(status)" class="w-3 h-3" />
            <span>{{ status }}</span>
            <span class="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs px-1.5 py-0.5 rounded-full ml-1">
              {{ getFilteredTasksByStatus(status, taskFilter, taskPriorityFilter).length }}
            </span>
          </div>
          <div 
            class="flex-1 overflow-y-auto p-2 custom-scrollbar task-drop-zone"
            :class="{ 'drag-over': isDragOver && dragOverStatus === status }"
            @dragover.prevent="handleDragOver(status)"
            @dragleave="handleDragLeave"
            @drop="handleDrop(status)"
          >
            <div v-if="getFilteredTasksByStatus(status, taskFilter, taskPriorityFilter).length === 0" class="h-full flex items-center justify-center text-center p-4">
              <div class="text-xs text-zinc-400 dark:text-zinc-500 italic">
                <FeatherIcon name="inbox" class="w-4 h-4 mx-auto mb-1 opacity-40" />
                Drop tasks here
              </div>
            </div>
            <div class="space-y-2">
              <TransitionGroup name="task-list">
                <TaskCard 
                  v-for="task in getFilteredTasksByStatus(status, taskFilter, taskPriorityFilter)" 
                  :key="task.name" 
                  :task="task" 
                  :view-mode="'compact'"
                  draggable="true"
                  @click="$emit('open-task', task)" 
                  @dragstart="handleDragStart($event, task)"
                  @toggle-complete="$emit('toggle-task-complete', task)"
                  @update-priority="$emit('update-task-priority', task, $event)"
                />
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TaskCard from '../cards/TaskCard.vue';
import TaskBoardHeader from '../header/TaskBoardHeader.vue';
import { getStatusFeatherIcon } from '../../utils/noteIcons';

const props = defineProps({
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
  }
});

const emit = defineEmits([
  'update:task-filter',
  'update:task-priority-filter',
  'open-task',
  'toggle-task-complete',
  'update-task-priority',
  'create-new-task',
  'drag-task',
  'drop-task'
]);

// Drag and drop state
const isDragOver = ref(false);
const dragOverStatus = ref(null);

// Handle drag start
const handleDragStart = (event, task) => {
  emit('drag-task', { 
    originalEvent: event,
    detail: task
  });
  
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', task.name);
};

// Handle drag over
const handleDragOver = (status) => {
  isDragOver.value = true;
  dragOverStatus.value = status;
};

// Handle drag leave
const handleDragLeave = () => {
  isDragOver.value = false;
  dragOverStatus.value = null;
};

// Handle drop
const handleDrop = (status) => {
  isDragOver.value = false;
  dragOverStatus.value = null;
  
  emit('drop-task', {
    detail: status
  });
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

/* Task board styling */
.task-board {
  display: flex;
  overflow-x: auto;
}

.task-drop-zone {
  min-height: 100px;
  transition: background-color 0.2s ease;
}

.task-drop-zone.drag-over {
  background-color: rgba(161, 161, 170, 0.1);
}

/* Card animations */
.task-list-enter-active {
  transition: all 0.3s ease-out;
}

.task-list-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>