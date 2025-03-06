<template>
  <div class="p-3 mt-2">
    <div class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium mb-2">
      Rooms
    </div>
    
    <!-- Auto-generated from existing notes -->
    <div v-if="autoRooms.length === 0" class="text-xs text-zinc-500 dark:text-zinc-500 p-2 text-center italic">
      No rooms available
    </div>
    
    <div 
      v-for="(context, index) in autoRooms" 
      :key="index"
      @click="$emit('switch-to-context', context)"
      class="sidebar-item flex items-center gap-2 p-2 rounded-lg cursor-pointer mb-1 group"
      :class="isActiveContext(context) ? 'bg-zinc-200 dark:bg-zinc-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
    >
      <div 
        class="w-6 h-6 rounded-md flex items-center justify-center"
        :class="getContextColor(context.doctype)"
      >
        <FeatherIcon :name="getContextFeatherIcon(context.doctype)" class="w-3 h-3 text-white" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs text-zinc-500 dark:text-zinc-500 truncate">{{ context.doctype }}</div>
        <div class="text-sm text-zinc-800 dark:text-zinc-300 truncate">{{ context.docname }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getContextColor, getContextFeatherIcon } from '../../utils/noteIcons';

const props = defineProps({
  autoRooms: {
    type: Array,
    required: true
  },
  currentContext: {
    type: Object,
    required: true
  },
  activeView: {
    type: String,
    required: true
  }
});

defineEmits(['switch-to-context']);

// Check if a context is active
const isActiveContext = (context) => {
  return context.doctype === props.currentContext.doctype && 
         context.docname === props.currentContext.docname &&
         props.activeView === 'room';
};
</script>

<style scoped>
.sidebar-item {
  transition: all 0.2s ease;
}
</style>