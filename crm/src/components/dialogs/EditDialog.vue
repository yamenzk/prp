<template>
  <Dialog 
    :visible="isVisible" 
    @update:visible="updateVisible"
    modal 
    :header="title || 'Update Field'" 
    :style="{ width: '30rem' }"
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
        :options="linkOptions" 
        optionLabel="label" 
        optionValue="value" 
        class="w-full" 
        :filter="true" 
        :loading="linkResource?.loading"
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
      <DatePicker v-model="internalValue" :id="fieldName" class="w-full" />
    </div>
    
    <!-- Text area field -->
    <div v-else-if="fieldType === 'textarea'" class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <Textarea v-model="internalValue" :id="fieldName" class="w-full" rows="5" autoResize />
    </div>
    
    <!-- Default: Regular input field -->
    <div v-else class="mb-4">
      <label :for="fieldName" class="block font-medium mb-2">{{ title }}</label>
      <InputText v-model="internalValue" :id="fieldName" class="w-full" :class="{ 'p-invalid': validationError }" />
      <small v-if="validationError" class="p-error">{{ validationError }}</small>
    </div>
    
    <template #footer>
      <Button label="Cancel" text @click="closeDialog" />
      <Button label="Save" @click="saveAndClose" :disabled="!!validationError" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { createListResource } from 'frappe-ui';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  fieldName: {
    type: String,
    required: false,
    default: ''
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
  },
  validation: {
    type: [Function, Object, String],
    default: null
  },
  doctype: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:visible', 'save']);

// Computed property for dialog visibility
const isVisible = computed(() => props.visible);

// Method to update visibility
const updateVisible = (value) => {
  emit('update:visible', value);
};

// Internal value to track changes
const internalValue = ref(props.value);
const validationError = ref('');
const linkOptions = ref([]);
const linkResource = ref(null);

// Update internal value when prop changes
watch(() => props.value, (newValue) => {
  internalValue.value = newValue;
  validateField();
});

// Watch for changes to validate
watch(() => internalValue.value, () => {
  validateField();
});

// Update internal value when visible changes to true
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    internalValue.value = props.value;
    
    // Load options if needed
    if (props.fieldType === 'link' && props.doctype) {
      fetchLinkOptions(props.doctype);
    }
    
    validateField();
  }
});

// Initialize and fetch link options
onMounted(() => {
  // If it's a link field with doctype and dialog is visible, fetch options
  if (props.fieldType === 'link' && props.doctype && props.visible) {
    fetchLinkOptions(props.doctype);
  }
});

// Clean up resources when component is unmounted
onBeforeUnmount(() => {
  if (linkResource.value) {
    // No explicit cleanup needed for Frappe UI resources
    linkResource.value = null;
  }
});

// Validation function
function validateField() {
  validationError.value = '';
  
  if (!props.validation) return;
  
  if (typeof props.validation === 'function') {
    const result = props.validation(internalValue.value);
    if (result !== true) {
      validationError.value = result || 'Invalid value';
    }
  } else if (typeof props.validation === 'string') {
    // Simple required validation
    if (props.validation === 'required' && !internalValue.value) {
      validationError.value = 'This field is required';
    }
  } else if (typeof props.validation === 'object') {
    // Handle validation object with rules
    if (props.validation.required && !internalValue.value) {
      validationError.value = props.validation.message || 'This field is required';
    }
    
    if (props.validation.pattern && internalValue.value) {
      const pattern = new RegExp(props.validation.pattern);
      if (!pattern.test(internalValue.value)) {
        validationError.value = props.validation.message || 'Invalid format';
      }
    }
    
    if (props.validation.minLength && internalValue.value && internalValue.value.length < props.validation.minLength) {
      validationError.value = props.validation.message || `Minimum length is ${props.validation.minLength}`;
    }
    
    if (props.validation.maxLength && internalValue.value && internalValue.value.length > props.validation.maxLength) {
      validationError.value = props.validation.message || `Maximum length is ${props.validation.maxLength}`;
    }
    
    if (props.validation.min !== undefined && internalValue.value < props.validation.min) {
      validationError.value = props.validation.message || `Minimum value is ${props.validation.min}`;
    }
    
    if (props.validation.max !== undefined && internalValue.value > props.validation.max) {
      validationError.value = props.validation.message || `Maximum value is ${props.validation.max}`;
    }
    
    // Custom validation function within the object
    if (props.validation.custom && typeof props.validation.custom === 'function') {
      const result = props.validation.custom(internalValue.value);
      if (result !== true) {
        validationError.value = result || props.validation.message || 'Invalid value';
      }
    }
  }
}

// Fetch options for link fields using List Resource
function fetchLinkOptions(doctype) {
  if (!doctype) return;
  
  // Create a list resource for the doctype
  linkResource.value = createListResource({
    doctype: doctype,
    fields: ['name'],
    pageLength: 50,  // Fetch more records at once
    orderBy: 'name asc',
    onSuccess: (data) => {
      linkOptions.value = data.map((item) => ({
        value: item.name,
        label: item.full_name || item.name,
      }));
    },
    onError: (error) => {
      console.error(`Error fetching options for ${doctype}:`, error);
      linkOptions.value = [];
    }
  });
  
  // Fetch the data
  linkResource.value.fetch();
}

function closeDialog() {
  emit('update:visible', false);
}

function saveAndClose() {
  // Validate before saving
  validateField();
  
  if (validationError.value) {
    return;
  }
  
  emit('save', {
    fieldName: props.fieldName,
    value: internalValue.value
  });
  emit('update:visible', false);
}
</script>