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
  </div>
</template>

<script setup>
defineProps({
  headerTitle: {
    type: String,
    required: true
  }
});

defineEmits(['navigate-back']);
</script>