<!-- components/common/EditableFieldset.vue -->
<template>
  <fieldset class="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4" :class="customClass">
    <legend class="px-2 font-bold">{{ legend }}</legend>
    <div class="grid gap-4" :class="gridClass">
      <EditableField 
        v-for="field in fields" 
        :key="field.name"
        :field-name="field.name"
        :label="field.label"
        :value="data[field.name]"
        :field-type="field.type"
        :readonly="field.readonly"
        :icon="field.icon"
        :direct-toggle="field.type === 'boolean'"
        @edit="handleEdit"
        @toggle-boolean="$emit('update', $event)"
      />
    </div>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue'
import EditableField from './EditableField.vue'

const props = defineProps({
  legend: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    default: () => []
  },
  data: {
    type: Object,
    required: true
  },
  columns: {
    type: Number,
    default: 2
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['edit', 'update'])

// Fix: Create proper grid classes based on columns prop
const gridClass = computed(() => {
  // Use an object with boolean values for each possible class
  return {
    'grid-cols-1': true,
    'sm:grid-cols-2': props.columns === 2,
    'sm:grid-cols-3': props.columns === 3,
    'sm:grid-cols-4': props.columns === 4,
    'sm:grid-cols-5': props.columns === 5,
    'sm:grid-cols-6': props.columns === 6
  }
})

// Fix: Handle edit events properly by forwarding them with the right arguments
const handleEdit = (fieldName, value, label, type) => {
  // Find the complete field definition to get validation and doctype
  const field = props.fields.find(f => f.name === fieldName) || {}
  
  // Forward the event with all necessary details
  emit('edit', fieldName, value, label, type, field.options, field.validation, field.doctype)
}
</script>