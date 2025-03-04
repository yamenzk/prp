<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="title || 'Update Field'" 
    :style="{ width: '30rem' }"
    @hide="$emit('update:visible', false)"
  >
    <!-- Field types -->
    
    <!-- Status field (select) -->
    <div v-if="fieldType === 'status'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <Dropdown 
        v-model="internalValue" 
        :options="options" 
        class="w-full" 
        placeholder="Select Status"
      />
    </div>
    
    <!-- Boolean field (checkbox) -->
    <div v-else-if="fieldType === 'boolean'" class="mb-4">
      <div class="flex items-center">
        <Checkbox v-model="internalValue" :binary="true" :id="fieldName" />
        <label :for="fieldName" class="ml-2">{{ title }}</label>
      </div>
    </div>
    
    <!-- Link field (dropdown) -->
    <div v-else-if="fieldType === 'link'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <Dropdown 
        v-model="internalValue" 
        :options="options" 
        optionLabel="label" 
        optionValue="value" 
        class="w-full" 
        :filter="true" 
        placeholder="Select an option"
      />
    </div>
    
    <!-- Number field -->
    <div v-else-if="fieldType === 'int' || fieldType === 'number'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <InputNumber v-model="internalValue" :id="fieldName" class="w-full" />
    </div>
    
    <!-- Currency field -->
    <div v-else-if="fieldType === 'currency'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <InputNumber 
        v-model="internalValue" 
        :id="fieldName" 
        class="w-full" 
        mode="currency" 
        currency="USD" 
        locale="en-US" 
      />
    </div>
    
    <!-- Date field -->
    <div v-else-if="fieldType === 'date'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <Calendar v-model="internalValue" :id="fieldName" class="w-full" dateFormat="yy-mm-dd" />
    </div>
    
    <!-- Text area field -->
    <div v-else-if="fieldType === 'textarea'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <Textarea v-model="internalValue" :id="fieldName" class="w-full" rows="5" autoResize />
    </div>
    
    <!-- Default: Regular input field -->
    <div v-else class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <InputText v-model="internalValue" :id="fieldName" class="w-full" />
    </div>
    
    <template #footer>
      <Button label="Cancel" text @click="closeDialog" />
      <Button label="Save" @click="saveAndClose" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { 
  Dialog, 
  Button, 
  InputText, 
  Dropdown, 
  Checkbox, 
  InputNumber, 
  Calendar, 
  Textarea 
} from 'primevue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    default: 'text'
  },
  value: {
    type: [String, Number, Boolean, Object, Date],
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'save']);

// Internal value to track changes
const internalValue = ref(props.value);

// Update internal value when prop changes
watch(() => props.value, (newValue) => {
  internalValue.value = newValue;
});

// Update internal value when visible changes to true
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    internalValue.value = props.value;
  }
});

function closeDialog() {
  emit('update:visible', false);
}

function saveAndClose() {
  emit('save', {
    fieldName: props.fieldName,
    value: internalValue.value
  });
  emit('update:visible', false);
}
</script>