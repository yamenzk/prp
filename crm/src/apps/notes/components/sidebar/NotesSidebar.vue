<template>
  <div class="notes-sidebar w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
    <!-- App header -->
    <SidebarHeader />
    
    <!-- Sections -->
    <div class="overflow-y-auto custom-scrollbar flex-1">
      <!-- Personal section -->
      <SidebarPersonalSection 
        :active-view="activeView"
        :active-tab-index="activeTabIndex"
        :task-notes="taskNotes"
        @go-to-home="$emit('go-to-home')"
        @set-active-tab="$emit('set-active-tab', $event)"
      />
      
      <!-- Auto-generated Rooms section -->
      <SidebarRoomsSection 
        :auto-rooms="autoRooms"
        :current-context="currentContext"
        :active-view="activeView"
        @switch-to-context="$emit('switch-to-context', $event)"
      />
      
      <!-- Tags/Categories -->
      <SidebarTagsSection 
        :popular-tags="popularTags"
        @filter-by-tag="$emit('filter-by-tag', $event)"
      />
    </div>
    
    <!-- Create button -->
    <SidebarFooter @create-new-note="$emit('create-new-note')" />
  </div>
</template>

<script setup>
import SidebarHeader from './SidebarHeader.vue';
import SidebarPersonalSection from './SidebarPersonalSection.vue';
import SidebarRoomsSection from './SidebarRoomsSection.vue';
import SidebarTagsSection from './SidebarTagsSection.vue';
import SidebarFooter from './SidebarFooter.vue';

defineProps({
  activeView: {
    type: String,
    required: true
  },
  activeTabIndex: {
    type: Number,
    required: true
  },
  currentContext: {
    type: Object,
    required: true
  },
  autoRooms: {
    type: Array,
    required: true
  },
  popularTags: {
    type: Array,
    required: true
  },
  taskNotes: {
    type: Array,
    required: true
  }
});

defineEmits([
  'go-to-home', 
  'set-active-tab',
  'switch-to-context', 
  'filter-by-tag', 
  'create-new-note'
]);
</script>

<style scoped>
.notes-sidebar {
  background-color: rgba(250, 250, 250, 0.6);
  backdrop-filter: blur(10px);
}

.dark .notes-sidebar {
  background-color: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(10px);
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(161, 161, 170, 0.3);
  border-radius: 6px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(113, 113, 122, 0.4);
}
</style>