<template>
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
</template>

<script setup>
defineEmits(['create-new-note']);
</script>