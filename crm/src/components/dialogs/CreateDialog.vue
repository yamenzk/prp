<template>
  <Dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :header="title || 'Create New Record'" 
    modal
    :style="{ width: dialogWidth }"
  >
    <div class="p-fluid">
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="field in fields" 
          :key="field.name" 
          :class="{ 'col-span-2': field.fullWidth, 'col-span-1': !field.fullWidth }"
        >
          <label :for="field.name" class="block font-medium mb-2">
            {{ field.label }}
            <span v-if="field.validation === 'required' || (field.validation && field.validation.required)" class="text-red-500">*</span>
          </label>
          
          <!-- Text Input -->
          <InputText 
            v-if="field.type === 'text'" 
            v-model="formData[field.name]" 
            :id="field.name" 
            class="w-full" 
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Text Area -->
          <Textarea 
            v-else-if="field.type === 'textarea'" 
            v-model="formData[field.name]" 
            :id="field.name" 
            class="w-full" 
            :rows="field.rows || 3" 
            autoResize
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Number Input -->
          <InputNumber 
            v-else-if="field.type === 'number' || field.type === 'int'" 
            v-model="formData[field.name]" 
            :id="field.name" 
            class="w-full"
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Currency Input -->
          <InputNumber 
            v-else-if="field.type === 'currency'" 
            v-model="formData[field.name]" 
            :id="field.name" 
            class="w-full" 
            mode="currency" 
            currency="USD" 
            locale="en-US"
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Date Input -->
          <DatePicker 
            v-else-if="field.type === 'date'" 
            v-model="formData[field.name]" 
            :id="field.name" 
            class="w-full" 
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Dropdown -->
          <Dropdown 
            v-else-if="field.type === 'select' || field.type === 'status'" 
            v-model="formData[field.name]" 
            :options="field.options" 
            :id="field.name" 
            class="w-full"
            :placeholder="`Select ${field.label}`"
            :class="{ 'p-invalid': validationErrors[field.name] }"
          />
          
          <!-- Link Field (Dynamic Dropdown) -->
          <div v-else-if="field.type === 'link'" class="w-full">
            <Dropdown 
              v-model="formData[field.name]" 
              :options="linkOptions[field.name] || []" 
              optionLabel="label" 
              optionValue="value" 
              :id="field.name" 
              class="w-full" 
              :filter="true" 
              :loading="linkResources[field.name]?.loading"
              :placeholder="`Select ${field.label}`"
              :class="{ 'p-invalid': validationErrors[field.name] }"
            />
          </div>
          
          <!-- Boolean Input -->
          <div v-else-if="field.type === 'boolean'" class="flex items-center">
            <Checkbox v-model="formData[field.name]" :binary="true" :id="field.name" />
          </div>
          
          <!-- Error message -->
          <small v-if="validationErrors[field.name]" class="p-error block mt-1">
            {{ validationErrors[field.name] }}
          </small>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" @click="cancel" text />
      <Button 
        :label="submitButtonLabel || 'Create'" 
        @click="submit"
        :loading="isSubmitting" 
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { 
  Dialog, 
  Button, 
  InputText, 
  Textarea, 
  InputNumber, 
  DatePicker, 
  Dropdown, 
  Checkbox 
} from 'primevue';
import { createListResource } from 'frappe-ui';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Create New Record'
  },
  fields: {
    type: Array,
    default: () => []
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  submitButtonLabel: {
    type: String,
    default: 'Create'
  },
  dialogWidth: {
    type: String,
    default: '40rem'
  }
});

const emit = defineEmits(['update:visible', 'submit', 'cancel']);

// Removed the computed isVisible 
function updateVisible(value) {
  emit('update:visible', value);
}

const formData = ref({});
const validationErrors = ref({});
const linkOptions = ref({});
const linkResources = ref({});
const isSubmitting = ref(false);

// Initialize form data when the component mounts
onMounted(() => {
  resetForm();
});

// Reset form when dialog visibility changes
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetForm();
    // Fetch options for all link fields
    fetchLinkFieldOptions();
  }
});

// Clean up resources when component is unmounted
onBeforeUnmount(() => {
  // No explicit cleanup needed for Frappe UI resources
  linkResources.value = {};
});

// Reset the form to initial values
const resetForm = () => {
  const initialData = { ...props.initialData };
  
  // Initialize form data based on field definitions
  props.fields.forEach(field => {
    if (!(field.name in initialData)) {
      if (field.type === 'boolean') {
        initialData[field.name] = field.default || false;
      } else {
        initialData[field.name] = field.default || '';
      }
    }
  });
  
  formData.value = initialData;
  validationErrors.value = {};
};

// Fetch options for all link fields
const fetchLinkFieldOptions = async () => {
  const linkFields = props.fields.filter(field => field.type === 'link' && field.doctype);
  
  for (const field of linkFields) {
    fetchLinkOptions(field.name, field.doctype);
  }
};

// Fetch options for a specific link field using List Resource
const fetchLinkOptions = (fieldName, doctype) => {
  if (!doctype) return;
  
  // Create a list resource for the doctype
  linkResources.value[fieldName] = createListResource({
    doctype: doctype,
    fields: ['name'],
    pageLength: 50,  // Fetch more records at once
    orderBy: 'name asc',
    onSuccess: (data) => {
      linkOptions.value[fieldName] = data.map((item) => ({
        value: item.name,
        label: item.full_name || item.name,
      }));
    },
    onError: (error) => {
      console.error(`Error fetching options for ${doctype}:`, error);
      linkOptions.value[fieldName] = [];
    }
  });
  
  // Fetch the data
  linkResources.value[fieldName].fetch();
};

// Validate form data
const validateForm = () => {
  validationErrors.value = {};
  let isValid = true;
  
  props.fields.forEach(field => {
    const value = formData.value[field.name];
    let error = null;
    
    // Skip validation if no validation rule is defined
    if (!field.validation) return;
    
    // Handle different validation types
    if (typeof field.validation === 'string') {
      // Simple required validation
      if (field.validation === 'required' && !value) {
        error = `${field.label} is required`;
      }
    } else if (typeof field.validation === 'function') {
      // Custom validation function
      const result = field.validation(value);
      if (result !== true) {
        error = result;
      }
    } else if (typeof field.validation === 'object') {
      // Validation object with rules
      if (field.validation.required && !value) {
        error = field.validation.message || `${field.label} is required`;
      }
      
      if (field.validation.pattern && value) {
        const pattern = new RegExp(field.validation.pattern);
        if (!pattern.test(value)) {
          error = field.validation.message || `Invalid format for ${field.label}`;
        }
      }
      
      if (field.validation.minLength && value && value.length < field.validation.minLength) {
        error = field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      
      if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
        error = field.validation.message || `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
      
      if (field.validation.min !== undefined && value < field.validation.min) {
        error = field.validation.message || `${field.label} must be at least ${field.validation.min}`;
      }
      
      if (field.validation.max !== undefined && value > field.validation.max) {
        error = field.validation.message || `${field.label} must be no more than ${field.validation.max}`;
      }
      
      // Custom validation function within the object
      if (field.validation.custom && typeof field.validation.custom === 'function') {
        const result = field.validation.custom(value);
        if (result !== true) {
          error = result || field.validation.message || `Invalid value for ${field.label}`;
        }
      }
    }
    
    if (error) {
      validationErrors.value[field.name] = error;
      isValid = false;
    }
  });
  
  return isValid;
};

const submit = async () => {
  // Validate the form
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Send the data back to the parent
    emit('submit', formData.value);
    emit('update:visible', false);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const cancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>