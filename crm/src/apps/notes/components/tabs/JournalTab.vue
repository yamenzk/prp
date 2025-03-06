<template>
  <div class="overflow-y-auto flex-1 p-3 custom-scrollbar">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-zinc-800 dark:text-zinc-200">Daily Journal</h3>
      <Button 
        label="New Entry" 
        class="p-button-sm !bg-zinc-800 dark:!bg-zinc-200 !text-white dark:!text-zinc-900"
        @click="$emit('create-new-journal')"
      >
        <template #icon>
          <FeatherIcon name="plus" class="w-4 h-4 mr-1" />
        </template>
      </Button>
    </div>
    
    <div class="space-y-6">
      <TransitionGroup name="journal-list">
        <div v-if="journalsByDate.length === 0" key="empty-journal" class="text-center p-6 text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg">
          <FeatherIcon name="book" class="w-8 h-8 mx-auto mb-2 opacity-40" />
          No journal entries yet. Start documenting your thoughts.
        </div>
        
        <div v-for="(group, index) in journalsByDate" :key="group.date" class="mb-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 rounded-full">
                {{ formatJournalDate(group.date) }}
              </span>
            </div>
          </div>
          
          <div class="mt-4 space-y-3">
            <JournalCard 
              v-for="journal in group.entries" 
              :key="journal.name" 
              :journal="journal" 
              @click="$emit('open-journal', journal)" 
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import JournalCard from '../cards/JournalCard.vue';
import { formatJournalDate } from '../../utils/noteFormatters';

defineProps({
  journalsByDate: {
    type: Array,
    required: true
  }
});

defineEmits(['open-journal', 'create-new-journal']);
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
.journal-list-enter-active {
  transition: all 0.3s ease-out;
}

.journal-list-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
}

.journal-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.journal-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>