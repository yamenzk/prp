<template>
  <Fieldset :legend="legend" :toggleable="true" pt:root:class="!bg-white dark:!bg-zinc-800" pt:legend:class="dark:!bg-zinc-800 dark:hover:!bg-zinc-700"> 
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