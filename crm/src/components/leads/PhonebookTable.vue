<template>
  <ChildTable
    title="Contact Information"
    :rows="phonebook"
    :fields="phonebookFields"
    add-button-label="Add Contact"
    empty-message="No contact information available."
    @add="addPhonebookEntry"
    @update="updatePhonebookEntry"
    @delete="deletePhonebookEntry"
  >
    <template #row-content="{ row }">
      <div>
        <div class="font-medium">{{ row.type }}</div>
        <div>{{ row.value }}</div>
      </div>
    </template>
  </ChildTable>
</template>

<script setup>
import { ref } from 'vue';
import ChildTable from '@/components/common/ChildTable.vue';

const props = defineProps({
  phonebook: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:phonebook']);

// Define the fields for the phonebook entries
const phonebookFields = [
  {
    name: 'type',
    label: 'Contact Type',
    type: 'select',
    options: ['Mobile', 'Phone', 'Email', 'WhatsApp', 'Other'],
    default: 'Mobile'
  },
  {
    name: 'value',
    label: 'Contact Value',
    type: 'text',
    default: ''
  }
];

// Methods
const addPhonebookEntry = (newEntry) => {
  const updatedPhonebook = [...props.phonebook, newEntry];
  emit('update:phonebook', updatedPhonebook);
};

const updatePhonebookEntry = ({ index, data }) => {
  const updatedPhonebook = [...props.phonebook];
  updatedPhonebook[index] = data;
  emit('update:phonebook', updatedPhonebook);
};

const deletePhonebookEntry = (index) => {
  const updatedPhonebook = [...props.phonebook];
  updatedPhonebook.splice(index, 1);
  emit('update:phonebook', updatedPhonebook);
};
</script>