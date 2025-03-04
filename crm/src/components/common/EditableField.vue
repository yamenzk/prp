<template>
  <div>
    <span class="text-sm">{{ label }}</span>
    <InputGroup class="flex items-center">
      <InputText :label="label" disabled :value="value" />
      <InputGroupAddon>
        <Button 
          icon="pi pi-pen-to-square" 
          @click="$emit('edit', fieldName, value, label, fieldType)" 
          :severity="severity" 
          :variant="variant" 
        />
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script setup>
import { InputText, InputGroup, InputGroupAddon, Button } from 'primevue'

defineProps({
  label: String,
  value: [String, Number],
  fieldName: String,
  fieldType: {
    type: String,
    default: 'text'
  },
  severity: {
    type: String,
    default: 'secondary'
  },
  variant: {
    type: String,
    default: 'text'
  }
})

defineEmits(['edit'])
</script>