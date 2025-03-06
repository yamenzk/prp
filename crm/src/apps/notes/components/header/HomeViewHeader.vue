<template>
  <div class="flex items-center gap-2">
    <span class="text-lg font-medium text-zinc-800 dark:text-zinc-200">
      {{ headerTitle }}
    </span>
    
    <div v-if="activeTabIndex === 0" class="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-1 ml-2">
      <Button
        text
        :class="viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''"
        @click="$emit('set-view-mode', 'list')"
        class="!rounded-lg !transition-all !text-zinc-600 dark:!text-zinc-300"
      >
        <template #icon>
          <FeatherIcon name="list" class="w-4 h-4" />
        </template>
      </Button>
      <Button
        text
        :class="viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''"
        @click="$emit('set-view-mode', 'grid')"
        class="!rounded-lg !transition-all !text-zinc-600 dark:!text-zinc-300"
      >
        <template #icon>
          <FeatherIcon name="grid" class="w-4 h-4" />
        </template>
      </Button>
    </div>
    
    <div v-if="activeTabIndex === 0" class="flex items-center gap-2 ml-2">
      <span class="p-input-icon-left w-48">
        <i class="pi pi-search" />
        <InputText 
          :value="searchQuery" 
          @input="$emit('update:search-query', $event.target.value)" 
          placeholder="Search notes" 
          class="w-full !py-1 !text-sm" 
        />
      </span>
      
      <div class="flex items-center">
        <Checkbox 
          :modelValue="hideCompleted" 
          @update:modelValue="$emit('update:hide-completed', $event)"
          :binary="true" 
          id="hide-completed" 
          class="mr-1"
        />
        <label for="hide-completed" class="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
          Hide completed
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  headerTitle: {
    type: String,
    required: true
  },
  activeTabIndex: {
    type: Number,
    required: true
  },
  viewMode: {
    type: String,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  hideCompleted: {
    type: Boolean,
    required: true
  }
});

defineEmits([
  'set-view-mode',
  'update:search-query',
  'update:hide-completed'
]);
</script>