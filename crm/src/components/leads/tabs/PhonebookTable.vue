<!-- PhonebookTable.vue -->
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
      <div class="flex items-center">
        <i :class="getIconForType(row.type)" class="mr-2 text-lg"></i>
        <div>
          <!-- <div class="font-medium">{{ row.type }}</div> -->
          <div class="font-medium">{{ row.value }}</div>
        </div>
      </div>
    </template>
    
    <template #row-actions="{ row, index, openEditDialog, confirmDelete }">
      <Button 
        v-if="hasAction(row.type)"
        :icon="getActionIcon(row.type)" 
        text 
        rounded 
        @click="performAction(row)"
        class="mr-2"
      />
      <Button icon="pi pi-pencil" text rounded @click="openEditDialog(row, index)" />
      <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(index)" />
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
    label: 'Type',
    type: 'select',
    options: ['Mobile', 'Phone', 'Email', 'WhatsApp', 'LinkedIn', 'Facebook', 'Instagram'],
    default: 'Mobile'
  },
  {
    name: 'value',
    label: 'Value',
    type: 'text',
    default: ''
  }
];

// Helper functions for icons and actions
const getIconForType = (type) => {
  const iconMap = {
    'Mobile': 'pi pi-mobile',
    'Phone': 'pi pi-phone',
    'Email': 'pi pi-envelope',
    'WhatsApp': 'pi pi-whatsapp',
    'LinkedIn': 'pi pi-linkedin',
    'Facebook': 'pi pi-facebook',
    'Instagram': 'pi pi-instagram'
  };
  return iconMap[type] || 'pi pi-circle';
};

const hasAction = (type) => {
  return ['Mobile', 'Phone', 'Email', 'WhatsApp', 'LinkedIn', 'Facebook', 'Instagram'].includes(type);
};

const getActionIcon = (type) => {
  if (type === 'Mobile' || type === 'Phone') return 'pi pi-phone';
  if (type === 'Email') return 'pi pi-send';
  if (['WhatsApp', 'LinkedIn', 'Facebook', 'Instagram'].includes(type)) return 'pi pi-external-link';
  return 'pi pi-link';
};


const performAction = (row) => {
  if (row.type === 'Mobile' || row.type === 'Phone') {
    // Clean phone number and make call
    const phoneNumber = row.value.replace(/[^\d+]/g, '');
    window.open(`tel:${phoneNumber}`, '_blank');
  } else if (row.type === 'Email') {
    // Open email client
    window.open(`mailto:${row.value}`, '_blank');
  } else if (row.type === 'WhatsApp') {
    // Open WhatsApp with the number
    const phoneNumber = row.value.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  } else if (row.type === 'LinkedIn' || row.type === 'Facebook' || row.type === 'Instagram') {
    // Open the social media link
    let url = row.value;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  }
};

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