<template>
  <div class="flex flex-col gap-4">
    <EditableFieldset 
      legend="Listing"
      :fields="listingFields"
      :data="listing"
      :columns="3"
      customClass="mb-2"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'

// Props
const props = defineProps({
  listing: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['edit-field']);

// Field definitions with validations
const listingFields = [
  { 
    name: 'unit_id', 
    label: 'Unit ID', 
    type: 'text',
    icon: 'pi pi-id-card',
  },
  { 
    name: 'developer', 
    label: 'Developer', 
    type: 'link',
    doctype: 'PRP Developer',
    icon: 'pi pi-briefcase',
  },
]



// Combine field handling
const handleEdit = (fieldName, currentValue, title) => {
  // Find the field definition in any of the field arrays
  const allFields = [...listingFields]
  const fieldDef = allFields.find(field => field.name === fieldName) || {}
  
  // Emit edit event with all needed info
  emit('edit-field', {
    fieldName,
    currentValue,
    title,
    type: fieldDef.type || 'text',
    options: fieldDef.options || [],
    validation: fieldDef.validation || null,
    doctype: fieldDef.doctype || ''
  })
}
</script>