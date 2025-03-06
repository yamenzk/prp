<template>
  <div class="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Select 
        :modelValue="taskFilter" 
        :options="taskFilterOptions" 
        optionLabel="label" 
        optionValue="value"
        @update:modelValue="$emit('update:task-filter', $event)"
        class="w-36 text-sm"
      />
      <Select 
        :modelValue="taskPriorityFilter" 
        :options="priorityFilterOptions" 
        optionLabel="label" 
        optionValue="value"
        placeholder="Priority"
        @update:modelValue="$emit('update:task-priority-filter', $event)"
        class="w-36 text-sm"
      />
    </div>
    
    <div>
      <Button 
        label="New Task" 
        class="p-button-sm !bg-zinc-800 dark:!bg-zinc-200 !text-white dark:!text-zinc-900"
        @click="$emit('create-new-task')"
      >
        <template #icon>
          <FeatherIcon name="plus" class="w-4 h-4 mr-1" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { taskFilterOptions, priorityFilterOptions } from '../../utils/noteStatusHelpers';

defineProps({
  taskFilter: {
    type: String,
    required: true
  },
  taskPriorityFilter: {
    type: String,
    required: true
  }
});

defineEmits([
  'update:task-filter',
  'update:task-priority-filter',
  'create-new-task'
]);
</script>