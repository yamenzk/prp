<template>
  <div class="flex items-center gap-2">
    <Button
      text
      rounded
      @click="$emit('navigate-back')"
      class="text-zinc-600 dark:text-zinc-300 transition-colors"
    >
      <template #icon>
        <FeatherIcon name="chevron-left" class="w-5 h-5" />
      </template>
    </Button>
    <span class="text-lg font-medium text-zinc-800 dark:text-zinc-200">
      {{ headerTitle }}
    </span>
    
    <div class="flex items-center text-xs text-zinc-500 dark:text-zinc-400 ml-2">
      <span v-if="currentContext.doctype">{{ currentContext.doctype }}:</span>
      <span v-if="currentContext.docname" class="ml-1 font-medium">{{ currentContext.docname }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  headerTitle: {
    type: String,
    required: true
  },
  currentContext: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['navigate-back']);
</script>