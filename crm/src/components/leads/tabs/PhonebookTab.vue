<template>
  <div class="p-4">
    <PhonebookTable 
      :phonebook="phonebook"
      @update:phonebook="$emit('update:phonebook', $event)"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import PhonebookTable from './PhonebookTable.vue'

// Props
const props = defineProps({
  phonebook: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['update:phonebook'])
</script>