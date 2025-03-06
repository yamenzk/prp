<template>
  <div class="simple-editor-container">
    <div 
      ref="editorEl"
      class="simple-editor" 
      contenteditable="true"
      :class="{'placeholder-shown': !content.length}"
      :data-placeholder="placeholder"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeyDown"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
  }
});

const emit = defineEmits(['update:modelValue']);

const editorEl = ref(null);
const content = ref(props.modelValue || '');
let isUpdatingContent = false;

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (content.value !== newValue) {
    content.value = newValue || '';
    updateEditorContent();
  }
}, { immediate: true });

// Initialize editor on mount
onMounted(() => {
  updateEditorContent();
});

// Update editor HTML content
const updateEditorContent = () => {
  if (editorEl.value && !isUpdatingContent) {
    isUpdatingContent = true;
    editorEl.value.innerHTML = content.value;
    isUpdatingContent = false;
  }
};

// Handle input event
const handleInput = (event) => {
  if (!isUpdatingContent) {
    isUpdatingContent = true;
    content.value = event.target.innerHTML;
    emit('update:modelValue', content.value);
    isUpdatingContent = false;
  }
};

// Handle paste to strip formatting
const handlePaste = (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
};

// Optional: Handle keydown for special commands
const handleKeyDown = (event) => {
  // Example: Ctrl+B for bold
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault();
        document.execCommand('bold', false, null);
        break;
      case 'i':
        event.preventDefault();
        document.execCommand('italic', false, null);
        break;
      case 'u':
        event.preventDefault();
        document.execCommand('underline', false, null);
        break;
    }
  }
};
</script>

<style scoped>
.simple-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.simple-editor {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  outline: none;
  line-height: 1.6;
  color: var(--text-color, #333);
}

.dark .simple-editor {
  color: var(--dark-text-color, #eee);
}

.simple-editor:focus {
  outline: none;
}

.simple-editor.placeholder-shown:empty:before {
  content: attr(data-placeholder);
  color: #aaa;
  font-style: italic;
}

/* Custom scrollbar */
.simple-editor {
  scrollbar-width: thin;
  scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
}

.simple-editor::-webkit-scrollbar {
  width: 6px;
}

.simple-editor::-webkit-scrollbar-track {
  background: transparent;
}

.simple-editor::-webkit-scrollbar-thumb {
  background-color: rgba(161, 161, 170, 0.3);
  border-radius: 6px;
}

.dark .simple-editor::-webkit-scrollbar-thumb {
  background-color: rgba(113, 113, 122, 0.4);
}
</style>