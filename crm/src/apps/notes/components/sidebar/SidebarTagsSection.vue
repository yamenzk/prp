<template>
  <div class="p-3 mt-2">
    <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2">
      Tags
    </div>
    <div v-if="popularTags.length === 0" class="text-xs text-zinc-500 dark:text-zinc-500 p-2 text-center italic">
      No tags available
    </div>
    <div v-else class="flex flex-wrap gap-1 mb-2">
      <span 
        v-for="tag in popularTags" 
        :key="tag.name"
        class="text-xs px-2 py-1 rounded-full cursor-pointer transition-colors"
        :style="{ backgroundColor: `${tag.color}20`, color: tag.color }"
        @click="$emit('filter-by-tag', tag.name)"
      >
        {{ tag.name }}
        <span class="ml-1 opacity-60">({{ tag.count }})</span>
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  popularTags: {
    type: Array,
    required: true
  }
});

defineEmits(['filter-by-tag']);
</script>