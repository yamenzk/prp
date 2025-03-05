<!-- components/common/EditableField.vue -->
<template>
  <div>
    <div class="flex items-center gap-1 mb-1">
      <!-- Icon options -->
      <span v-if="icon" class="text-base">
        <!-- Emoji -->
        <span v-if="isEmoji(icon)">{{ icon }}</span>
        
        <!-- PrimeIcons (pi) -->
        <i v-else-if="icon.startsWith('pi-')" :class="`pi ${icon}`"></i>
        
        <!-- Feather icons -->
        <FeatherIcon v-else-if="icon.startsWith('feather-')" :name="icon.replace('feather-', '')" class="w-4 h-4" />
        
        <!-- Custom icon class -->
        <i v-else :class="icon"></i>
      </span>
      <span class="text-sm">{{ label }}</span>
    </div>
    
    <!-- Boolean/Checkbox field with triple-click handling -->
    <div 
      v-if="fieldType === 'boolean'" 
      class="flex items-center justify-between"
      :class="{'cursor-pointer': !readonly && directToggle}"
      @click.stop="handleTripleClick"
    >
      <div class="flex items-center gap-2">
        <Checkbox 
          :id="fieldName" 
          :modelValue="!!value" 
          :binary="true" 
          disabled
          pt:root:class="!bg-zinc-100 dark:!bg-zinc-800"
        />
        <label :for="fieldName">{{ value ? 'Yes' : 'No' }}</label>
      </div>
      <Button 
        v-if="!readonly" 
        icon="pi pi-pen-to-square" 
        @click.stop="handleEdit" 
        :severity="severity" 
        :variant="variant"
        class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700"
      />
    </div>
    
    <!-- Status field with tag -->
    <div v-else-if="fieldType === 'status'" class="flex items-center justify-between">
      <Tag :value="value" :severity="getTagSeverity(value)" />
      <Button 
        v-if="!readonly" 
        icon="pi pi-pen-to-square" 
        @click="handleEdit" 
        :severity="severity" 
        :variant="variant"
        class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700"
      />
    </div>
    
    <!-- Currency field with formatting -->
    <div v-else-if="fieldType === 'currency'" class="flex items-center">
      <InputGroup class="flex items-center w-full">
        <InputText 
          :label="label" 
          disabled 
          :value="formatCurrency(value)" 
          pt:root:class="!bg-zinc-100 dark:!bg-zinc-800" 
        />
        <InputGroupAddon v-if="!readonly" pt:root:class="!bg-zinc-100 dark:!bg-zinc-800 hover:!bg-zinc-200 dark:hover:!bg-zinc-700">
          <Button 
            icon="pi pi-pen-to-square" 
            @click="handleEdit" 
            :severity="severity" 
            :variant="variant" 
            class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700"
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
    
    <!-- Default text input -->
    <InputGroup v-else class="flex items-center">
      <InputText 
        :label="label" 
        disabled 
        :value="displayValue" 
        pt:root:class="!bg-zinc-100 dark:!bg-zinc-800" 
      />
      <InputGroupAddon v-if="!readonly" pt:root:class="!bg-zinc-100 dark:!bg-zinc-800 hover:!bg-zinc-200 dark:hover:!bg-zinc-700">
        <Button 
          icon="pi pi-pen-to-square" 
          @click="handleEdit" 
          :severity="severity" 
          :variant="variant" 
          class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700"
        />
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { InputText, InputGroup, InputGroupAddon, Button, Checkbox, Tag } from 'primevue'
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue'

const props = defineProps({
  label: String,
  value: [String, Number, Boolean],
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
  },
  icon: {
    type: String,
    default: ''
  },
  directToggle: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'toggle-boolean'])

// Track click count for triple-click handling
const clickCount = ref(0)
const clickTimer = ref(null)
const TRIPLE_CLICK_TIMEOUT = 300 // milliseconds

// Handle triple click for boolean toggle
const handleTripleClick = () => {
  if (props.readonly || !props.directToggle || props.fieldType !== 'boolean') return
  
  clickCount.value++
  
  // Reset the click count after timeout
  clearTimeout(clickTimer.value)
  clickTimer.value = setTimeout(() => {
    clickCount.value = 0
  }, TRIPLE_CLICK_TIMEOUT)
  
  // Triple click detected
  if (clickCount.value === 3) {
    clickCount.value = 0
    clearTimeout(clickTimer.value)
    
    // Toggle the boolean value
    emit('toggle-boolean', {
      fieldName: props.fieldName,
      value: !props.value
    })
  }
}

// Handle edit button click
const handleEdit = () => {
  // Pass each argument individually rather than as an array
  emit('edit', props.fieldName, props.value, props.label, props.fieldType)
}

// Check if the icon is an emoji
const isEmoji = (str) => {
  if (!str) return false
  // Simple emoji detection - checks if string contains emoji characters
  const emojiRegex = /[\p{Emoji}]/u
  return emojiRegex.test(str)
}

// Format currency values
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value)
}

// Determine the severity for status tags
const getTagSeverity = (status) => {
  const statusMap = {
    'New': 'info',
    'Contacted': 'info',
    'Qualified': 'success',
    'Proposal': 'warning',
    'Negotiation': 'warning',
    'Closed': 'success',
    'Lost': 'danger',
    'Inactive': 'secondary'
  }
  return statusMap[status] || 'info'
}

// Computed property to handle display of various value types
const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  
  // For select/dropdown fields, just return the value as string
  if (props.fieldType === 'select') {
    return String(props.value)
  }
  
  // For date fields, format the date
  if (props.fieldType === 'date' && props.value) {
    try {
      return new Date(props.value).toLocaleDateString()
    } catch (e) {
      return props.value
    }
  }
  
  // For number fields
  if (props.fieldType === 'number' || props.fieldType === 'int') {
    return String(props.value)
  }
  
  // For boolean fields - handled in template with checkbox
  if (props.fieldType === 'boolean') {
    return props.value ? 'Yes' : 'No'
  }
  
  // Default case - just convert to string
  return String(props.value)
})
</script>