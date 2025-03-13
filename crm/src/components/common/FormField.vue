<!-- components/common/FormField.vue -->
<template>
  <div class="form-field">
    <!-- Field Label -->
    <label v-if="showLabel" :for="id" class="block font-medium mb-2 flex items-center gap-1">
      <!-- Icon display -->
      <span v-if="icon" class="text-base">
        <!-- PrimeIcons (pi) -->
        <i v-if="icon.includes('pi-')" :class="icon"></i>
        
        <!-- Emoji -->
        <span v-else-if="isEmoji(icon)">{{ icon }}</span>
        
        <!-- Feather icons -->
        <span v-else-if="icon.startsWith('feather-')" class="w-4 h-4">
          <FeatherIcon :name="icon.replace('feather-', '')" />
        </span>
        
        <!-- Custom icon class -->
        <i v-else :class="icon"></i>
      </span>
      {{ label }}
      <span v-if="isRequired" class="text-red-500">*</span>
    </label>
    
    <!-- Text Input -->
    <InputText 
      v-if="type === 'text'" 
      v-model="modelValue" 
      :id="id" 
      class="w-full" 
      :class="{ 'p-invalid': !!error }"
    />
    
    <!-- Text Area -->
    <Textarea 
      v-else-if="type === 'textarea'" 
      v-model="modelValue" 
      :id="id" 
      class="w-full" 
      :rows="3" 
      autoResize
      :class="{ 'p-invalid': !!error }"
    />

    <AutoComplete
  v-else-if="type === 'chips'"
  v-model="chipsValue"
  :id="id"
  class="w-full"
  :placeholder="`Enter ${label}`"
  :multiple="true"
  :typeahead="false"
  :class="{ 'p-invalid': !!error }"
/>
<div v-if="type === 'chips' && suggestions && suggestions.length" class="tag-suggestions mt-2">
  <small class="block text-gray-500 mb-1">Recommended tags:</small>
  <div class="flex flex-wrap gap-1">
    <Button 
      v-for="tag in suggestions" 
      :key="tag" 
      :label="tag" 
      class="p-button-sm p-button-outlined p-button-rounded" 
      @click="addSuggestedTag(tag)"
    />
  </div>
</div>
    
    <!-- Number Input -->
    <InputNumber 
      v-else-if="type === 'number' || type === 'int'" 
      v-model="modelValue" 
      :id="id" 
      class="w-full"
      :class="{ 'p-invalid': !!error }"
    />
    
    <!-- Currency Input -->
    <InputNumber 
      v-else-if="type === 'currency'" 
      v-model="modelValue" 
      :id="id" 
      class="w-full" 
      mode="currency" 
      currency="AED" 
      locale="en-AE"
      :class="{ 'p-invalid': !!error }"
    />
    
    <!-- Date Input -->
    <DatePicker 
      v-else-if="type === 'date'" 
      v-model="modelValue" 
      :id="id" 
      class="w-full" 
      :class="{ 'p-invalid': !!error }"
    />
    
    <!-- Dropdown -->
    <Select
      v-else-if="type === 'select' || type === 'status'" 
      v-model="modelValue" 
      :options="formattedOptions" 
      optionLabel="label"
      optionValue="value"
      :id="id" 
      class="w-full"
      :placeholder="`Select ${label}`"
      :class="{ 'p-invalid': !!error }"
      :disabled="disabled"
    />
    
    <!-- Link Field (Dynamic Dropdown) -->
    <Select 
      v-else-if="type === 'link'" 
      v-model="modelValue" 
      :options="linkOptions" 
      optionLabel="label" 
      optionValue="value" 
      :id="id" 
      class="w-full" 
      :filter="true" 
      :loading="loading"
      :placeholder="`Select ${label}`"
      :class="{ 'p-invalid': !!error }"
      :disabled="disabled"
    />
    
    <!-- Boolean Input -->
    <div v-else-if="type === 'boolean'" class="flex items-center">
      <Checkbox v-model="modelValue" :binary="true" :id="id" />
    </div>
    
    <!-- Error message -->
    <small v-if="error" class="p-error block mt-1">
      {{ error }}
    </small>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { createListResource } from 'frappe-ui'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Date],
    default: null
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `field-${Math.random().toString(36).substring(2, 9)}`
  },
  validation: {
    type: [Function, Object, String],
    default: null
  },
  suggestions: {
  type: Array,
  default: () => []
},
  options: {
    type: Array,
    default: () => []
  },
  doctype: {
    type: String,
    default: ''
  },
  displayField: {
  type: String,
  default: 'name' // Default to name if not specified
},
filters: {
  type: [Object, Function],
  default: () => ({})
},
  showLabel: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {  // Add the icon prop definition
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const error = ref('')
const linkOptions = ref([])
const loading = ref(false)

// Calculated properties
const isRequired = computed(() => {
  if (!props.validation) return false
  
  if (typeof props.validation === 'string') {
    return props.validation === 'required'
  }
  
  if (props.validation && typeof props.validation === 'object') {
    return Boolean(props.validation.required)
  }
  
  return false
})

// Two-way binding for model value
const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    validateValue(value)
  }
})
const formattedOptions = computed(() => {
  // If options is empty, return empty array
  if (!props.options || props.options.length === 0) {
    return [];
  }
  
  // Check if options are already in object format
  if (typeof props.options[0] === 'object' && props.options[0] !== null) {
    return props.options;
  }
  
  // Otherwise, convert string array to object format
  return props.options.map(option => ({
    label: option,
    value: option
  }));
});

// Fetch link options if needed
onMounted(async () => {
  if (props.type === 'link' && props.doctype) {
    await fetchLinkOptions()
  }
})

// Update when type or doctype changes
watch(() => [props.type, props.doctype], async ([type, doctype]) => {
  if (type === 'link' && doctype) {
    await fetchLinkOptions()
  }
}, { immediate: true })

// Watch value changes for validation
watch(() => props.modelValue, (val) => {
  validateValue(val)
})

// Fetch options for link fields
async function fetchLinkOptions() {
  if (!props.doctype) return
  
  loading.value = true
  
  try {
    const fieldsToFetch = ['name']
    
    // Add display field to the query if it's not 'name'
    if (props.displayField !== 'name') {
      fieldsToFetch.push(props.displayField)
    }
    
    // Process filters - they can be an object or a function that returns an object
    let activeFilters = {}
    if (typeof props.filters === 'function') {
      activeFilters = props.filters()
    } else {
      activeFilters = props.filters
    }
    
    const resource = createListResource({
      doctype: props.doctype,
      fields: fieldsToFetch,
      filters: activeFilters, // Apply the filters
      pageLength: 50,
      orderBy: 'name asc',
      auto: true
    })
    
    // Rest of your function remains the same
    setTimeout(async () => {
      if (resource.data) {
        linkOptions.value = resource.data.map(item => ({
          value: item.name,
          label: item[props.displayField] || item.full_name || item.name
        }))
      } else {
        linkOptions.value = []
      }
      loading.value = false
    }, 500)
    
  } catch (error) {
    console.error(`Error fetching options for ${props.doctype}:`, error)
    linkOptions.value = []
    loading.value = false
  }
}
// Validate the field
function isEmoji(str) {
  if (!str) return false
  const emojiRegex = /[\p{Emoji}]/u
  return emojiRegex.test(str)
}

const chipsValue = computed({
  get() {
    // If modelValue is a string, convert to array for AutoComplete
    if (typeof props.modelValue === 'string') {
      return props.modelValue ? props.modelValue.split(',').map(item => item.trim()).filter(Boolean) : [];
    }
    return props.modelValue || [];
  },
  set(value) {
    // Convert array back to comma-separated string for storage
    const stringValue = Array.isArray(value) ? value.join(', ') : '';
    emit('update:modelValue', stringValue);
    validateValue(stringValue);
  }
});
// Add this method to FormField.vue
function addSuggestedTag(tag) {
  // If modelValue is already an array, add to it
  if (Array.isArray(modelValue.value)) {
    // Only add if the tag doesn't already exist
    if (!modelValue.value.includes(tag)) {
      const newValue = [...modelValue.value, tag];
      emit('update:modelValue', newValue);
    }
  } 
  // If it's a string, parse it first
  else if (typeof modelValue.value === 'string') {
    const existingTags = modelValue.value 
      ? modelValue.value.split(',').map(t => t.trim()).filter(Boolean) 
      : [];
    
    // Only add if the tag doesn't already exist
    if (!existingTags.includes(tag)) {
      const newValue = [...existingTags, tag];
      emit('update:modelValue', newValue.join(', '));
    }
  }
  // If it's null or undefined, just set it directly
  else {
    emit('update:modelValue', tag);
  }
}
function validateValue(value) {
  if (!props.validation) {
    error.value = ''
    return
  }
  
  if (typeof props.validation === 'string') {
    if (props.validation === 'required' && !value) {
      error.value = 'This field is required'
    } else {
      error.value = ''
    }
    return
  }
  
  if (typeof props.validation === 'function') {
    const result = props.validation(value)
    error.value = result === true ? '' : (result || 'Invalid value')
    return
  }
  
  if (typeof props.validation === 'object' && props.validation !== null) {
    // Required validation
    if (props.validation.required && !value) {
      error.value = props.validation.message || 'This field is required'
      return
    }
    
    // Pattern validation
    if (props.validation.pattern && value) {
      const pattern = new RegExp(props.validation.pattern)
      if (!pattern.test(value)) {
        error.value = props.validation.message || 'Invalid format'
        return
      }
    }
    
    // Length validation
    if (props.validation.minLength && value && value.length < props.validation.minLength) {
      error.value = props.validation.message || `Minimum length is ${props.validation.minLength}`
      return
    }
    
    if (props.validation.maxLength && value && value.length > props.validation.maxLength) {
      error.value = props.validation.message || `Maximum length is ${props.validation.maxLength}`
      return
    }
    
    // Range validation
    if (props.validation.min !== undefined && value < props.validation.min) {
      error.value = props.validation.message || `Minimum value is ${props.validation.min}`
      return
    }
    
    if (props.validation.max !== undefined && value > props.validation.max) {
      error.value = props.validation.message || `Maximum value is ${props.validation.max}`
      return
    }
    
    // Custom validation
    if (props.validation.custom && typeof props.validation.custom === 'function') {
      const result = props.validation.custom(value)
      if (result !== true) {
        error.value = result || props.validation.message || 'Invalid value'
        return
      }
    }
    
    error.value = ''
  }
}
</script>