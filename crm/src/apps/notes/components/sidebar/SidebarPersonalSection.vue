<template>
  <div class="p-3">
    <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2">
      Personal
    </div>
    <div 
      @click="$emit('go-to-home'); $emit('set-active-tab', 0)"
      class="sidebar-item flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1"
      :class="activeView === 'home' && activeTabIndex === 0 ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
    >
      <FeatherIcon name="home" class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
      <span class="text-sm text-zinc-800 dark:text-zinc-300">All Notes</span>
    </div>
    <div 
      @click="$emit('go-to-home'); $emit('set-active-tab', 1)"
      class="sidebar-item flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1"
      :class="activeView === 'home' && activeTabIndex === 1 ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
    >
      <FeatherIcon name="check-square" class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
      <span class="text-sm text-zinc-800 dark:text-zinc-300">My Tasks</span>
      <span v-if="taskNotes.length > 0" class="ml-auto bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
        {{ taskNotes.length }}
      </span>
    </div>
    <div 
      @click="$emit('go-to-home'); $emit('set-active-tab', 2)"
      class="sidebar-item flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1"
      :class="activeView === 'home' && activeTabIndex === 2 ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
    >
      <FeatherIcon name="book" class="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
      <span class="text-sm text-zinc-800 dark:text-zinc-300">Journal</span>
    </div>
  </div>
</template>

<script setup>

defineProps({
  activeView: {
    type: String,
    required: true
  },
  activeTabIndex: {
    type: Number,
    required: true
  },
  taskNotes: {
    type: Array,
    required: true
  }
});

defineEmits(['go-to-home', 'set-active-tab']);
</script>

<style scoped>
.sidebar-item {
  transition: all 0.2s ease;
}
</style>