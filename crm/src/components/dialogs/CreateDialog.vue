<!-- components/dialogs/CreateDialog.vue -->
<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
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
          <FormField
            v-model="formData[field.name]"
            :type="field.type"
            :label="field.label"
            :id="field.name"
            :validation="field.validation"
            :options="field.options"
            :doctype="field.doctype"
            :icon="field.icon"
            :disabled="field.readonly || field.disabled"
            v-bind="getAdditionalProps(field)"
          />
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button label="Cancel" @click="cancel" text />
      <Button 
        :label="submitButtonLabel || 'Create'" 
        @click="submit"
        :loading="isSubmitting" 
        :disabled="!isFormValid"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Dialog, Button } from 'primevue'
import FormField from '@/components/common/FormField.vue'
import { useFields } from '@/composables/useFields'

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
})

const emit = defineEmits(['update:visible', 'submit', 'cancel'])

const { validateField } = useFields()
const formData = ref({})
const formErrors = ref({})
const isSubmitting = ref(false)

// Initialize form when the component mounts
onMounted(() => {
  resetForm()
})

// Reset form when dialog visibility changes
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetForm()
  }
})

// Check if form is valid
const isFormValid = computed(() => {
  for (const field of props.fields) {
    if (!field.validation) continue
    
    const result = validateField(formData.value[field.name], field.validation)
    if (result !== true) return false
  }
  return true
})

// Get any additional props from the field definition
const getAdditionalProps = (field) => {
  // List of props we've already handled explicitly
  const handledProps = ['name', 'label', 'type', 'validation', 'options', 'doctype', 'icon', 'readonly', 'disabled', 'fullWidth', 'default'];
  
  // Create an object with all remaining props
  const additionalProps = {};
  Object.keys(field).forEach(key => {
    if (!handledProps.includes(key)) {
      additionalProps[key] = field[key];
    }
  });
  
  return additionalProps;
}

// Reset the form to initial values
const resetForm = () => {
  const initialData = { ...props.initialData }
  
  // Initialize form data based on field definitions
  props.fields.forEach(field => {
    if (!(field.name in initialData)) {
      if (field.type === 'boolean') {
        initialData[field.name] = field.default || false
      } else {
        initialData[field.name] = field.default || ''
      }
    }
  })
  
  formData.value = initialData
  formErrors.value = {}
}

const submit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    emit('submit', formData.value)
    emit('update:visible', false)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const cancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>