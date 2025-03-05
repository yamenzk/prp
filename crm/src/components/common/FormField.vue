<!-- components/common/FormField.vue -->
<template>
  <div class="form-field">
    <!-- Field Label -->
    <label v-if="showLabel" :for="id" class="block font-medium mb-2">
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
      currency="USD" 
      locale="en-US"
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
      :options="options" 
      :id="id" 
      class="w-full"
      :placeholder="`Select ${label}`"
      :class="{ 'p-invalid': !!error }"
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
import { 
  InputText, 
  Textarea, 
  InputNumber, 
  Dropdown, 
  Checkbox,
  DatePicker
} from 'primevue'
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
  options: {
    type: Array,
    default: () => []
  },
  doctype: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
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
    const resource = createListResource({
      doctype: props.doctype,
      fields: ['name'],
      pageLength: 50,
      orderBy: 'name asc',
      auto: true
    })
    
    // Wait for resource to finish loading
    setTimeout(async () => {
      if (resource.data) {
        linkOptions.value = resource.data.map(item => ({
          value: item.name,
          label: item.full_name || item.name
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