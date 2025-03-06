<template>
  <div class="text-center p-6 text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg">
    <FeatherIcon :name="icon" class="w-8 h-8 mx-auto mb-2 opacity-40" />
    <p>{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup>

defineProps({
  icon: {
    type: String,
    default: 'inbox'
  },
  message: {
    type: String,
    required: true
  }
});
</script>