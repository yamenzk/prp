<template>
  <div class="flex items-center gap-4">
    <span class="text-lg font-medium text-zinc-800 dark:text-zinc-200">
      New
    </span>
    <!-- Note Type Selector -->
    <div class="flex h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden">
      <button
        @click="$emit('toggle-note-type', 'note')"
        class="px-3 h-full flex items-center transition-colors"
        :class="
          noteType === 'note'
            ? 'bg-blue-500 text-white'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        "
      >
        <i class="pi pi-file text-sm mr-1"></i>
        <span class="text-xs font-medium">Note</span>
      </button>

      <button
        @click="$emit('toggle-note-type', 'task')"
        class="px-3 h-full flex items-center transition-colors"
        :class="
          noteType === 'task'
            ? 'bg-green-500 text-white'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        "
      >
        <i class="pi pi-check-square text-sm mr-1"></i>
        <span class="text-xs font-medium">Task</span>
      </button>

      <button
        @click="$emit('toggle-note-type', 'journal')"
        class="px-3 h-full flex items-center transition-colors"
        :class="
          noteType === 'journal'
            ? 'bg-purple-500 text-white'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        "
      >
        <i class="pi pi-book text-sm mr-1"></i>
        <span class="text-xs font-medium">Journal</span>
      </button>
    </div>

  </div>
</template>

<script setup>
defineProps({
  headerTitle: {
    type: String,
    required: true
  },
  noteType: {
    type: String,
    default: 'note'  // Add a default value
  }
});

defineEmits(['toggle-note-type']);
</script>