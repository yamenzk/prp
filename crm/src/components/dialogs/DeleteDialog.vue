<!-- components/dialogs/DeleteDialog.vue -->
<template>
  <Dialog 
    v-model:visible="isVisible" 
    :header="title || 'Delete Confirmation'" 
    modal
    :style="{ width: '30rem' }"
  >
    <div class="p-fluid">
      <p class="mb-4">{{ message || 'Are you sure you want to delete this item?' }}</p>
      
      <!-- If confirmField is provided, require user to type it -->
      <template v-if="confirmField && confirmValue">
        <p class="font-bold mb-2">{{ confirmValue }}</p>
        <InputText 
          v-model="confirmText" 
          class="w-full" 
          :placeholder="`Type ${confirmFieldLabel || 'name'} to confirm`" 
        />
      </template>
    </div>
    
    <template #footer>
      <Button label="Cancel" @click="cancel" text />
      <Button 
        :label="deleteButtonLabel || 'Delete'" 
        severity="danger" 
        :disabled="isDeleteDisabled"
        @click="confirm" 
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Delete Confirmation'
  },
  message: {
    type: String,
    default: 'This action cannot be undone. Are you sure you want to proceed?'
  },
  confirmField: {
    type: String,
    default: ''
  },
  confirmValue: {
    type: String,
    default: ''
  },
  confirmFieldLabel: {
    type: String,
    default: 'name'
  },
  deleteButtonLabel: {
    type: String,
    default: 'Delete'
  }
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const confirmText = ref('');
const isVisible = computed(() => props.visible);

// Reset confirm text when dialog opens
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    confirmText.value = '';
  }
});

// Determine if delete button should be disabled
const isDeleteDisabled = computed(() => {
  if (props.confirmField && props.confirmValue) {
    return confirmText.value !== props.confirmValue;
  }
  return false;
});

const confirm = () => {
  emit('confirm');
  emit('update:visible', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>