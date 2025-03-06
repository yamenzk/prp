<template>
  <div class="overflow-y-auto flex-1 p-3 custom-scrollbar">
    <div class="space-y-2">
      <TransitionGroup name="note-list">
        <div 
          v-if="stickyNotes.length > 0" 
          class="col-span-full mb-3"
          key="sticky-header"
        >
          <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2 px-2 flex items-center">
            <FeatherIcon name="star" class="w-3 h-3 mr-1 text-amber-400" />
            <span>Pinned</span>
          </div>
          <div :class="viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'">
            <NoteCard 
              v-for="note in stickyNotes" 
              :key="note.name" 
              :note="note" 
              :view-mode="viewMode"
              @click="$emit('open-note', note)" 
              @toggle-sticky="$emit('toggle-sticky', note.name)"
            />
          </div>
        </div>
        
        <div 
          class="col-span-full"
          :class="stickyNotes.length > 0 ? 'mt-6' : ''"
          key="notes-header"
        >
          <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2 px-2 flex items-center justify-between">
            <div class="flex items-center">
              <FeatherIcon name="file-text" class="w-3 h-3 mr-1" />
              <span>Notes</span>
            </div>
            <div class="text-xs text-zinc-500">{{ regularNotes.length }} notes</div>
          </div>
          <div v-if="regularNotes.length === 0" class="text-center p-6 text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg">
            <FeatherIcon name="inbox" class="w-8 h-8 mx-auto mb-2 opacity-40" />
            {{ searchActive ? 'No matching notes found' : 'No notes yet. Click + to create one.' }}
          </div>
          <div :class="viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'">
            <NoteCard 
              v-for="note in regularNotes" 
              :key="note.name" 
              :note="note" 
              :view-mode="viewMode"
              @click="$emit('open-note', note)" 
              @toggle-sticky="$emit('toggle-sticky', note.name)"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import NoteCard from '../cards/NoteCard.vue';

const props = defineProps({
  viewMode: {
    type: String,
    required: true
  },
  stickyNotes: {
    type: Array,
    required: true
  },
  regularNotes: {
    type: Array,
    required: true
  }
});

defineEmits(['open-note', 'toggle-sticky']);

// Determine if search is active
const searchActive = computed(() => {
  // Check if regularNotes is filtered due to search
  // This is a simple check based on the assumption that if there are sticky notes
  // but no regular notes, it's likely because of a search filter
  return props.stickyNotes.length > 0 && props.regularNotes.length === 0;
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