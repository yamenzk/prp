<!-- components/dialogs/EditDialog.vue -->
<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :header="title || 'Update Field'" 
    :style="{ width: '30rem' }"
  >
    <FormField
      v-model="fieldValue"
      :type="fieldType"
      :label="title"
      :id="fieldName"
      :validation="validation"
      :options="options"
      :doctype="doctype"
      :icon="icon"
      :disabled="readonly || disabled"
      v-bind="allAdditionalProps"
    />
    
    <template #footer>
      <Button label="Cancel" text @click="$emit('update:visible', false)" />
      <Button 
        label="Save" 
        @click="saveAndClose" 
        :disabled="!isValid"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Dialog, Button } from 'primevue'
import FormField from '@/components/common/FormField.vue'
import { useFields } from '@/composables/useFields'

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
  },
  icon: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  additionalProps: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'save'])

const { validateField } = useFields()
const fieldValue = ref(props.value)
const validationError = ref('')

// Combine default additionalProps with currency-specific props when needed
const allAdditionalProps = computed(() => {
  const baseProps = props.additionalProps || {};
  
  // Add currency formatting props if needed
  if (props.fieldType === 'currency' && !baseProps.currency) {
    return {
      ...baseProps,
      currency: 'AED',
      locale: 'en-AE'
    };
  }
  
  return baseProps;
})

const isValid = computed(() => {
  const result = validateField(fieldValue.value, props.validation)
  return result === true
})

// Update value when props change
watch(() => props.value, (newVal) => {
  fieldValue.value = newVal
})

// Update value when visibility changes to true
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    fieldValue.value = props.value
  }
})

function saveAndClose() {
  if (!isValid.value) return
  
  emit('save', {
    fieldName: props.fieldName,
    value: fieldValue.value
  })
  emit('update:visible', false)
}
</script>