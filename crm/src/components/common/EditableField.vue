<template>
  <div>
    <span class="text-sm">{{ label }}</span>
    <InputGroup class="flex items-center">
      <InputText :label="label" disabled :value="value" pt:root:class="!bg-zinc-100 dark:!bg-zinc-800" />
      <InputGroupAddon v-if="!readonly" pt:root:class="!bg-zinc-100 dark:!bg-zinc-800 hover:!bg-zinc-200 dark:hover:!bg-zinc-700">
        <Button 
          icon="pi pi-pen-to-square" 
          @click="$emit('edit', fieldName, value, label, fieldType)" 
          :severity="severity" 
          :variant="variant" 
          class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700"
          
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
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit'])
</script>