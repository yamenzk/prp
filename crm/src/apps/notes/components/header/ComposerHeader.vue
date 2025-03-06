<template>
  <div class="flex items-center gap-2">
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
</script>