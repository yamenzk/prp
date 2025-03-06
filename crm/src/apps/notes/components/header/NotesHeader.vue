<template>
  <div class="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm">
    <!-- Dynamic header content based on view type -->
    <HomeViewHeader 
      v-if="activeView === 'home' && !composingNote"
      :header-title="headerTitle"
      :active-tab-index="activeTabIndex"
      :view-mode="viewMode"
      :search-query="searchQuery"
      :hide-completed="hideCompleted"
      @set-view-mode="$emit('set-view-mode', $event)"
      @update:search-query="$emit('update:search-query', $event)"
      @update:hide-completed="$emit('update:hide-completed', $event)"
    />
    
    <DetailViewHeader 
      v-else-if="activeView === 'detail' && !composingNote"
      :header-title="headerTitle"
      @navigate-back="$emit('navigate-back')"
    />
    
    <RoomViewHeader 
      v-else-if="activeView === 'room' && !composingNote"
      :header-title="headerTitle"
      :current-context="currentContext"
      @navigate-back="$emit('navigate-back')"
    />
    
    <ComposerHeader 
  v-else-if="composingNote"
  :header-title="headerTitle"
  :note-type="noteType"
  @toggle-note-type="$emit('toggle-note-type', $event)"
/>
    
    <!-- Close/Minimize buttons (always present) -->
    <div class="flex items-center gap-1">
      <Button
        text
        rounded
        class="text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ml-2"
        @click="$emit('minimize-dialog')"
      >
        <template #icon>
          <FeatherIcon name="minus" class="w-5 h-5" />
        </template>
      </Button>
      <Button
        text
        rounded
        class="text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        @click="$emit('close')"
      >
        <template #icon>
          <FeatherIcon name="x" class="w-5 h-5" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import HomeViewHeader from './HomeViewHeader.vue';
import DetailViewHeader from './DetailViewHeader.vue';
import RoomViewHeader from './RoomViewHeader.vue';
import ComposerHeader from './ComposerHeader.vue';

defineProps({
  activeView: {
    type: String,
    required: true
  },
  composingNote: {
    type: Boolean,
    required: true
  },
  headerTitle: {
    type: String,
    required: true
  },
  activeTabIndex: {
    type: Number,
    default: 0
  },
  noteType: {
    type: String,
    default: 'note'  // Add a default value
  },
  viewMode: {
    type: String,
    default: 'list'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  hideCompleted: {
    type: Boolean,
    default: false
  },
  currentContext: {
    type: Object,
    default: () => ({})
  }
});

defineEmits([
  'minimize-dialog',
  'close',
  'navigate-back',
  'set-view-mode',
  'toggle-note-type',
  'update:search-query',
  'update:hide-completed'
]);
</script>