<template>
  <Fieldset 
    :legend="legend" 
    :toggleable="true" 
    pt:root:class="!bg-white dark:!bg-zinc-800"
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
        @edit="$emit('edit', field.name, getFieldValue(field.name), field.label, field.type || 'text')"
      />
    </div>
    <slot></slot>
  </Fieldset>
</template>

<script setup>
import { computed } from 'vue'
import EditableField from './EditableField.vue'
import { Fieldset } from 'primevue/fieldset'

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
  }
})

defineEmits(['edit'])

const gridColumnClass = computed(() => {
  return `md:grid-cols-${props.columns}`
})

const getFieldValue = (fieldName) => {
  return props.data?.[fieldName] || ''
}
</script>