<template>
  <div class="tag-input-container">
    <!-- Input field with functionality to add tags -->
    <div 
      class="tag-input-field flex items-center p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-blue-300 dark:focus-within:ring-blue-700"
      :class="{ 'has-tags': modelValue.length > 0 }"
    >
      <!-- Display existing tags -->
      <div class="tag-list flex flex-wrap gap-1 mr-2">
        <div 
          v-for="(tag, index) in modelValue" 
          :key="index"
          class="tag-item flex items-center rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-2 py-1"
        >
          <span>#{{ tag }}</span>
          <button 
            type="button" 
            class="ml-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            @click.prevent="removeTag(index)"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      </div>
      
      <!-- Input for new tags -->
      <input
        ref="inputEl"
        type="text"
        :value="inputValue"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 outline-none bg-transparent text-sm text-zinc-800 dark:text-zinc-200"
        @input="inputValue = $event.target.value"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @blur="attemptAddTag"
      />
    </div>
    
    <!-- Helper text if provided -->
    <small v-if="helpText" class="block mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      {{ helpText }}
    </small>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Add tags (comma or enter to separate)'
  },
  helpText: {
    type: String,
    default: ''
  },
  allowDuplicates: {
    type: Boolean,
    default: false
  },
  maxTags: {
    type: Number,
    default: 0 // 0 means unlimited
  }
});

const emit = defineEmits(['update:modelValue']);

const inputEl = ref(null);
const inputValue = ref('');

// Watch for external modelValue changes
watch(() => props.modelValue, () => {
  // Focus input when all tags are removed
  if (props.modelValue.length === 0) {
    setTimeout(() => {
      inputEl.value?.focus();
    }, 0);
  }
});

// Add a new tag
function addTag(tag) {
  // Clean the tag value
  const cleanTag = tag.trim();
  
  // Skip if empty
  if (!cleanTag) return;
  
  // Skip if duplicate (unless allowed)
  if (!props.allowDuplicates && props.modelValue.includes(cleanTag)) return;
  
  // Skip if maximum tags reached
  if (props.maxTags > 0 && props.modelValue.length >= props.maxTags) return;
  
  // Create a new array with the new tag
  const newTags = [...props.modelValue, cleanTag];
  emit('update:modelValue', newTags);
  
  // Clear input
  inputValue.value = '';
}

// Remove a tag by index
function removeTag(index) {
  const newTags = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', newTags);
}

// Handle keyboard events
function handleKeyDown(event) {
  // Add tag on Enter or comma
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    attemptAddTag();
  }
  
  // Remove last tag on Backspace if input is empty
  if (event.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1);
  }
}

// Handle paste event
function handlePaste(event) {
  // Get pasted text
  const pastedText = event.clipboardData.getData('text');
  
  // If it contains commas, prevent default and handle manually
  if (pastedText.includes(',')) {
    event.preventDefault();
    
    // Split by comma and add each tag
    const tags = pastedText.split(',');
    tags.forEach(tag => {
      if (tag.trim()) {
        addTag(tag);
      }
    });
  }
}

// Attempt to add a tag from current input
function attemptAddTag() {
  if (inputValue.value) {
    // Handle multiple tags separated by commas
    if (inputValue.value.includes(',')) {
      const tags = inputValue.value.split(',');
      tags.forEach(tag => {
        if (tag.trim()) {
          addTag(tag);
        }
      });
      inputValue.value = '';
    } else {
      addTag(inputValue.value);
    }
  }
}
</script>

<style scoped>
.tag-input-container {
  width: 100%;
}

.tag-input-field {
  min-height: 40px;
  transition: all 0.2s ease;
}

.tag-input-field:focus-within {
  border-color: #60a5fa; /* blue-400 */
}

.dark .tag-input-field:focus-within {
  border-color: #3b82f6; /* blue-500 */
}

.tag-item button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}
</style>