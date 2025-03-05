<template>
  <div class="flex flex-col gap-4">
    <EditableFieldset 
      legend="Lead"
      :fields="leadFields"
      :data="lead"
      :columns="3"
      customClass="mb-2"
      @edit="handleEdit"
    />

    <EditableFieldset
      legend="Personal"
      :fields="personalFields"
      :data="lead"
      :columns="2"
      customClass="mb-2"
      @edit="handleEdit"
    />
    
    <EditableFieldset
      legend="Professional" 
      :fields="professionalFields"
      :data="lead"
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
  lead: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['edit-field']);

// Field definitions with validations
const personalFields = [
  { 
    name: 'first_name', 
    label: 'First Name', 
    type: 'text',
    icon: 'pi pi-user',
    validation: { 
      maxLength: 50, 
      message: 'First name should be less than 50 characters' 
    }
  },
  { 
    name: 'last_name', 
    label: 'Last Name', 
    type: 'text',
    icon: 'pi pi-user',
    validation: { 
      maxLength: 50, 
      message: 'Last name should be less than 50 characters' 
    }
  },
]

// Professional fields with icons
const professionalFields = [
  { name: 'company', label: 'Company', type: 'text', icon: 'pi pi-building' },
  { name: 'position', label: 'Position', type: 'text', icon: 'pi pi-briefcase' },
  { 
    name: 'salary', 
    label: 'Salary', 
    type: 'currency',
    icon: 'pi pi-dollar',
    validation: {
      min: 0,
      message: 'Salary must be a positive amount'
    }
  }
]

// Lead fields with icons
const leadFields = [
  { 
    name: 'name', 
    label: 'ID', 
    type: 'text',
    icon: 'pi pi-id-card',
    validation: 'required',
    readonly: true
  },
  { 
    name: 'lead_source', 
    label: 'Lead Source', 
    type: 'link',
    icon: 'pi pi-filter',
    doctype: 'PRP Lead Source'
  },
  { 
    name: 'owner', 
    label: 'Owner', 
    type: 'link',
    icon: 'pi pi-user-edit',
    doctype: 'User',
    readonly: true
  },
]

// Combine field handling
const handleEdit = (fieldName, currentValue, title) => {
  // Find the field definition in any of the field arrays
  const allFields = [...leadFields, ...personalFields, ...professionalFields]
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