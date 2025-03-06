<template>
  <div class="h-full flex flex-col">
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm">
      <!-- Note type and basic options -->
      <div class="flex flex-wrap gap-2 mb-3">
        <div class="flex items-center">
          <Button 
            :label="noteType === 'note' ? 'Note' : noteType === 'task' ? 'Task' : 'Journal'" 
            :class="getNoteTypeClass(noteType)"
            @click="$emit('toggle-note-type')" 
            text 
            class="!px-3 !py-1 border dark:border-zinc-700 rounded-full transition-all"
          >
            <template #icon>
              <FeatherIcon 
                :name="noteType === 'note' ? 'file-text' : noteType === 'task' ? 'check-square' : 'book'" 
                class="w-4 h-4 mr-1"
              />
            </template>
          </Button>
        </div>
        
        <div class="flex items-center border dark:border-zinc-700 rounded-full overflow-hidden">
          <Button
            text
            class="!px-2 !py-1"
            :class="draftNote.sticky ? '!bg-amber-100 dark:!bg-amber-900/30 !text-amber-600 dark:!text-amber-400' : ''"
            @click="$emit('update:sticky', !draftNote.sticky)"
          >
            <FeatherIcon :name="'star'" class="w-4 h-4" :class="draftNote.sticky ? 'fill-amber-500 text-amber-500' : ''" />
          </Button>
          
          <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
          
          <div class="!px-2 !py-1 flex items-center">
            <div 
              class="w-6 h-6 rounded-full cursor-pointer transition-all"
              :style="{ backgroundColor: draftNote.color || '#cccccc' }"
              @click="$emit('toggle-color-picker')"
            ></div>
            <ColorPicker 
              v-model="localColor" 
              class="ml-1" 
              v-if="showColorPicker"
              @update:modelValue="$emit('update:color', localColor)" 
            />
          </div>
          
          <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
          
          <Menu ref="iconPickerMenu" :model="iconPickerItems" :popup="true" />
          <Button
            text
            class="!px-2 !py-1 flex items-center"
            @click="iconPickerMenu.toggle($event)"
          >
            <span v-if="draftNote.icon" class="text-lg mr-1">{{ draftNote.icon }}</span>
            <FeatherIcon v-else name="smile" class="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <!-- Status section for any note type -->
      <div class="flex flex-wrap gap-2 mb-3">
        <Select
          v-model="localStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Status"
          @update:modelValue="$emit('update:status', localStatus)"
          class="w-32 !text-sm"
        />
        
        <Select
          v-if="noteType === 'task'"
          v-model="localPriority"
          :options="priorityOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Priority"
          @update:modelValue="$emit('update:priority', localPriority)"
          class="w-32 !text-sm"
        />
        
        <DatePicker
          v-if="noteType === 'task'"
          v-model="localDueDate"
          showTime
          showIcon
          placeholder="Due date"
          class="!text-sm"
          hourFormat="24"
          :showButtonBar="true"
          @update:modelValue="$emit('update:due-date', localDueDate)"
        />
      </div>
      
      <!-- Title field -->
      <div class="mb-3">
        <InputText 
          v-model="localTitle" 
          placeholder="Title" 
          class="w-full !bg-white dark:!bg-zinc-800 !p-2 !text-lg !rounded-lg"
          @update:modelValue="$emit('update:title', localTitle)" 
        />
      </div>
      
      <!-- Tags field -->
      <AutoComplete 
  v-model="localTags" 
  placeholder="Add tags (press enter to separate)" 
  class="w-full" 
  multiple
  :typeahead="false"
/>

<div v-if="localTags && localTags.length > 0" class="mt-2 flex flex-wrap gap-1">
  <span 
    v-for="(tag, index) in localTags" 
    :key="index"
    class="text-xs px-2 py-1 rounded-full cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
  >
    #{{ tag }}
  </span>
</div>
    </div>
    
    <div class="flex-1">
      <!-- Simple Editor -->
      <SimpleEditor 
        v-model="localDetails" 
        placeholder="Type something..."
        class="h-full border-none"
        @update:modelValue="$emit('update:details', localDetails)"
      />
    </div>
    
    <!-- Footer actions -->
    <div class="p-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between bg-zinc-50 dark:bg-zinc-900">
      <Button 
        label="Cancel" 
        text 
        @click="$emit('cancel-compose')" 
        class="!text-zinc-600 dark:!text-zinc-400 hover:!bg-zinc-200 dark:hover:!bg-zinc-800 transition-colors"
      >
        <template #icon>
          <FeatherIcon name="x" class="w-4 h-4 mr-1" />
        </template>
      </Button>
      <Button 
        label="Save" 
        @click="$emit('save-note')" 
        class="!bg-zinc-800 dark:!bg-zinc-200 !text-white dark:!text-zinc-900 hover:!bg-zinc-900 dark:hover:!bg-zinc-100 transition-colors !px-4"
      >
        <template #icon>
          <FeatherIcon name="check" class="w-4 h-4 mr-1" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import SimpleEditor from './SimpleEditor.vue';
import { getNoteTypeClass } from '../../utils/noteStatusHelpers';

// References for pop-up menus
const iconPickerMenu = ref(null);

// Props
const props = defineProps({
  draftNote: {
    type: Object,
    required: true
  },
  noteType: {
    type: String,
    required: true
  },
  showColorPicker: {
    type: Boolean,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  },
  priorityOptions: {
    type: Array,
    required: true
  },
  iconPickerItems: {
    type: Array,
    required: true
  }
});

// Local state to avoid direct mutation of props
const localTitle = ref(props.draftNote.title);
const localDetails = ref(props.draftNote.details);
const localTags = ref(props.draftNote.tags || []);
const localColor = ref(props.draftNote.color);
const localStatus = ref(props.draftNote.status);
const localPriority = ref(props.draftNote.priority);
const localDueDate = ref(props.draftNote.dueDate);

// Emits
const emit = defineEmits([
  'cancel-compose',
  'save-note',
  'toggle-note-type',
  'toggle-color-picker',
  'update:color',
  'update:icon',
  'update:sticky',
  'update:tags',
  'update:title',
  'update:details',
  'update:status',
  'update:priority',
  'update:due-date'
]);

// Watch for prop changes
watch(() => props.draftNote, (newValue) => {
  localTitle.value = newValue.title;
  localDetails.value = newValue.details;
  localTags.value = newValue.tags || [];
  localColor.value = newValue.color;
  localStatus.value = newValue.status;
  localPriority.value = newValue.priority;
  localDueDate.value = newValue.dueDate;
}, { deep: true });

// Update tags
const updateTags = (newTags) => {
  // Remove any empty tags and trim whitespace
  const cleanedTags = newTags.filter(tag => tag.trim()).map(tag => tag.trim());
  localTags.value = cleanedTags;
  emit('update:tags', cleanedTags);
};
</script>