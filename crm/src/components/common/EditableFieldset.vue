<template>
  <Fieldset 
    :legend="legend" 
    :toggleable="true" 
    pt:root:class="!bg-white dark:!bg-zinc-800"
    pt:legend:class="dark:!bg-zinc-800 dark:hover:!bg-zinc-700"
    :class="customClass"
  >
    <div class="grid grid-cols-1 gap-4" :class="gridColumnClass">
      <EditableField
        v-for="field in fields"
        :key="field.name"
        :label="field.label"
        :value="getFieldValue(field.name)"
        :fieldName="field.name"
        :fieldType="field.type || 'text'"
        :variant="field.variant || 'text'"
        :severity="field.severity || 'secondary'"
        :readonly="readonly || field.readonly"
        @edit="$emit('edit', field.name, getFieldValue(field.name), field.label, field.type || 'text')"
      />
    </div>
    <slot></slot>
  </Fieldset>
</template>

<script setup>
import { computed } from 'vue'
import EditableField from './EditableField.vue'

const props = defineProps({
  legend: String,
  fields: Array,
  data: Object,
  columns: {
    type: Number,
    default: 2
  },
  customClass: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit'])

// Map the column number to an actual Tailwind class
const gridColumnClass = computed(() => {
  const columnMap = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6'
  };
  
  return columnMap[props.columns] || 'md:grid-cols-2'; // Default to 2 columns if invalid value
})

const getFieldValue = (fieldName) => {
  return props.data?.[fieldName] || ''
}
</script>