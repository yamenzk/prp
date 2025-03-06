<template>
  <div 
    class="note-card p-4 rounded-lg border bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer transition-all transform hover:shadow-md hover:-translate-y-1 relative group"
    :class="[
      note.color ? 'border-l-4' : 'border-l', 
      viewMode === 'list' ? 'mb-2' : ''
    ]"
    :style="note.color ? {borderLeftColor: note.color} : {}"
    @click.stop="$emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex gap-3">
        <div 
          v-if="note.icon" 
          class="text-xl flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
          :style="note.color ? {backgroundColor: `${note.color}20`, color: note.color} : {}"
        >
          {{ note.icon }}
        </div>
        
        <div class="min-w-0 flex-1">
          <div class="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {{ note.title || 'Untitled' }}
          </div>
          
          <div 
            v-if="viewMode === 'list' && note.details" 
            class="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2"
            v-html="safeHtml(truncateHTML(note.details, 150))"
          ></div>
          
          <div class="flex items-center mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{{ formatDate(note.modified) }}</span>
            
            <div v-if="noteTags.length > 0" class="flex flex-wrap gap-1 ml-2">
              <span 
                v-for="(tag, index) in displayTags" 
                :key="index"
                class="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700"
              >
                #{{ tag }}
              </span>
              <span v-if="noteTags.length > 2" class="px-1.5 py-0.5">
                +{{ noteTags.length - 2 }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        class="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="$emit('toggle-sticky', note.name)"
              >
        <FeatherIcon 
          name="star" 
          class="w-5 h-5"
          :class="note.sticky ? 'fill-amber-500 text-amber-500' : ''" 
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate } from '../../utils/noteFormatters';
import { safeHtml } from '../../utils/htmlHelpers';

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'list'
  }
});

defineEmits(['click', 'toggle-sticky']);

// Extract tags from the note
const noteTags = computed(() => {
  if (!props.note || !props.note.tags) return [];
  
  return typeof props.note.tags === 'string'
    ? props.note.tags.split(',').filter(t => t.trim())
    : props.note.tags;
});

// Display only the first two tags for space
const displayTags = computed(() => {
  return noteTags.value.slice(0, 2);
});

// Truncate HTML content
const truncateHTML = (html, maxLength) => {
  if (!html) return '';
  
  // Simple HTML truncation - in a real app you might want a more robust solution
  const textContent = html.replace(/<[^>]*>/g, '');
  
  if (textContent.length <= maxLength) {
    return html;
  }
  
  return textContent.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.note-card {
  transition: all 0.2s ease;
}

/* Make line-clamp work in more browsers */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>