<template>
  <div class="h-full flex flex-col">
    <div class="p-3 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="getContextColor(currentContext.doctype)"
          >
            <FeatherIcon :name="getContextFeatherIcon(currentContext.doctype)" class="w-4 h-4 text-white" />
          </div>
          <div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ currentContext.doctype }}</div>
            <div class="text-md font-medium text-zinc-700 dark:text-zinc-300">{{ currentContext.docname }}</div>
          </div>
        </div>
        <Select
          v-model="localRoomFilterType"
          :options="roomFilterOptions"
          optionLabel="label"
          optionValue="value"
          class="w-32 text-sm"
        />
      </div>
    </div>
    
    <div class="overflow-y-auto flex-1 p-3 custom-scrollbar">
      <div v-if="filteredRoomNotes.length === 0" class="text-center p-6 text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg mt-4">
        <FeatherIcon name="inbox" class="w-8 h-8 mx-auto mb-2 opacity-40" />
        No {{ localRoomFilterType === 'all' ? 'notes' : localRoomFilterType }} for this document yet. Click + to create one.
      </div>
      
      <template v-else>
        <div class="space-y-3">
          <TransitionGroup name="note-list">
            <template v-if="localRoomFilterType === 'all' || localRoomFilterType === 'notes'">
              <div v-if="roomNotes.length > 0" class="mb-4" key="room-notes">
                <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2 px-2 flex items-center">
                  <FeatherIcon name="file-text" class="w-3 h-3 mr-1" />
                  <span>Notes</span>
                </div>
                <div class="space-y-2">
                  <NoteCard 
                    v-for="note in roomNotes" 
                    :key="note.name" 
                    :note="note"
                    :view-mode="'list'" 
                    @click="$emit('open-note', note)" 
                    @toggle-sticky="$emit('toggle-sticky', note.name)"
                  />
                </div>
              </div>
            </template>
            
            <template v-if="localRoomFilterType === 'all' || localRoomFilterType === 'tasks'">
              <div v-if="roomTasks.length > 0" class="mb-4" key="room-tasks">
                <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2 px-2 flex items-center">
                  <FeatherIcon name="check-square" class="w-3 h-3 mr-1" />
                  <span>Tasks</span>
                </div>
                <div class="space-y-2">
                  <TaskCard 
                    v-for="task in roomTasks" 
                    :key="task.name" 
                    :task="task"
                    :view-mode="'list'"  
                    @click="$emit('open-task', task)" 
                    @toggle-complete="$emit('toggle-task-complete', task)"
                    @update-priority="$emit('update-task-priority', task, $event)"
                  />
                </div>
              </div>
            </template>
            
            <template v-if="localRoomFilterType === 'all' || localRoomFilterType === 'journals'">
              <div v-if="roomJournals.length > 0" class="mb-4" key="room-journals">
                <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2 px-2 flex items-center">
                  <FeatherIcon name="book" class="w-3 h-3 mr-1" />
                  <span>Journal</span>
                </div>
                <div class="space-y-2">
                  <JournalCard 
                    v-for="journal in roomJournals" 
                    :key="journal.name" 
                    :journal="journal" 
                    @click="$emit('open-journal', journal)" 
                  />
                </div>
              </div>
            </template>
          </TransitionGroup>
        </div>
      </template>
    </div>
    
    <div class="p-3 border-t border-zinc-200 dark:border-zinc-800">
      <Button 
        label="New Note" 
        class="w-full !bg-zinc-800 dark:!bg-zinc-200 !text-white dark:!text-zinc-900"
        @click="$emit('create-new-note')"
      >
        <template #icon>
          <FeatherIcon name="plus" class="w-4 h-4 mr-1" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import NoteCard from '../cards/NoteCard.vue';
import TaskCard from '../cards/TaskCard.vue';
import JournalCard from '../cards/JournalCard.vue';
import { getContextColor, getContextFeatherIcon } from '../../utils/noteIcons';
import { roomFilterOptions } from '../../utils/noteStatusHelpers';

const props = defineProps({
  currentContext: {
    type: Object,
    required: true
  },
  roomFilterType: {
    type: String,
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
  filteredRoomNotes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  'update:room-filter-type',
  'open-note',
  'toggle-sticky',
  'open-task',
  'toggle-task-complete',
  'update-task-priority',
  'open-journal',
  'create-new-note'
]);

// Local state for room filter type
const localRoomFilterType = ref(props.roomFilterType);

// Watch for changes in local filter and emit to parent
watch(localRoomFilterType, (newValue) => {
  emit('update:room-filter-type', newValue);
});

// Watch for changes in prop to update local state
watch(() => props.roomFilterType, (newValue) => {
  localRoomFilterType.value = newValue;
});
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

/* Card animations */
.note-list-enter-active {
  transition: all 0.3s ease-out;
}

.note-list-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
}

.note-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.note-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>