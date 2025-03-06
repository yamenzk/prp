<template>
  <div 
    class="journal-card p-4 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer transition-all transform hover:shadow-md hover:-translate-y-1 relative group"
    :class="journal.color ? 'border-l-4' : 'border-l'"
    :style="journal.color ? {borderLeftColor: journal.color} : {borderLeftColor: '#9333ea'}"
    @click.stop="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <div 
        class="text-xl flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
        :style="journal.color ? {backgroundColor: `${journal.color}20`, color: journal.color} : {backgroundColor: '#9333ea20', color: '#9333ea'}"
      >
        {{ journal.icon || '📔' }}
      </div>
      
      <div class="min-w-0 flex-1">
        <div class="flex justify-between">
          <div class="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {{ journal.title || 'Journal Entry' }}
          </div>
          
          <div class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ formatTime(journal.creation) }}
          </div>
        </div>
        
        <div 
          class="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3"
          v-html="safeHtml(truncateHTML(journal.details, 200))"
        ></div>
        
        <div v-if="journalTags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span 
            v-for="(tag, index) in displayTags" 
            :key="index"
            class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
          >
            #{{ tag }}
          </span>
          <span v-if="journalTags.length > 3" class="text-xs text-zinc-500 dark:text-zinc-400">
            +{{ journalTags.length - 3 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { safeHtml } from '../../utils/htmlHelpers';

const props = defineProps({
  journal: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);

// Extract tags from the journal
const journalTags = computed(() => {
  if (!props.journal || !props.journal.tags) return [];
  
  return typeof props.journal.tags === 'string'
    ? props.journal.tags.split(',').filter(t => t.trim())
    : props.journal.tags;
});

// Display only the first three tags for space
const displayTags = computed(() => {
  return journalTags.value.slice(0, 3);
});

// Format the time part of the datetime
const formatTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (e) {
    return '';
  }
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
.journal-card {
  transition: all 0.2s ease;
}

/* Make line-clamp work in more browsers */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>