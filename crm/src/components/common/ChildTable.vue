<!-- @/components/common/ChildTable.vue -->
<template>
  <div class="child-table">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">{{ title }}</h3>
      <Button 
        :label="addButtonLabel" 
        icon="pi pi-plus" 
        @click="openAddDialog" 
      />
    </div>
    
    <div v-if="!rows || rows.length === 0" class="text-tertiary">
      {{ emptyMessage }}
    </div>
    
    <div v-else class="grid grid-cols-1 gap-3">
      <div 
        v-for="(row, index) in rows" 
        :key="index" 
        class="flex justify-between items-center p-3 border rounded-xl"
        :class="{ 'bg-blue-50 dark:bg-blue-900/20': activeRowIndex === index }"
      >
        <slot name="row-content" :row="row" :index="index">
          <!-- Default row display if no slot is provided -->
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="field in displayFieldsList" 
              :key="field.name" 
              class="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-zinc-700"
            >
              <span v-if="field.icon" class="text-sm">
                <span v-if="isEmoji(field.icon)">{{ field.icon }}</span>
                <i v-else-if="field.icon.startsWith('pi-')" :class="`pi ${field.icon}`"></i>
                <FeatherIcon v-else-if="field.icon.startsWith('feather-')" :name="field.icon.replace('feather-', '')" class="w-3 h-3" />
                <i v-else :class="field.icon"></i>
              </span>
              <span class="font-medium text-sm">{{ field.label }}:</span>
              <span class="text-sm">{{ formatFieldValue(row[field.name], field.type) }}</span>
            </div>
          </div>
        </slot>
        <div class="flex gap-2">
          <slot name="row-actions" 
            :row="row" 
            :index="index" 
            :open-edit-dialog="openEditDialog" 
            :confirm-delete="confirmDelete">
            <Button 
              icon="pi pi-pencil" 
              text 
              @click="openEditDialog(row, index)"
              class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700" 
            />
            <Button 
              icon="pi pi-trash" 
              text 
              severity="danger" 
              @click="confirmDelete(index)"
              class="hover:!bg-zinc-200 dark:hover:!bg-zinc-700" 
            />
          </slot>
        </div>
      </div>
    </div>
    
    <!-- Edit/Add Dialog using CreateDialog component -->
    <CreateDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :fields="editFields"
      :initial-data="editData"
      :submit-button-label="isEditMode ? 'Save' : 'Add'"
      @submit="handleSubmit"
      @cancel="cancelEdit"
    />
    
    <!-- Delete Confirmation Dialog -->
    <DeleteDialog
      v-model:visible="deleteDialogVisible"
      :title="`Delete ${title}`"
      :message="`Are you sure you want to delete this ${title.toLowerCase()}?`"
      @confirm="handleDelete"
      @cancel="activeRowIndex = -1"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Button } from 'primevue';
import FeatherIcon from 'frappe-ui/src/components/FeatherIcon.vue';
import CreateDialog from '@/components/dialogs/CreateDialog.vue';
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';
import { useFields } from '@/composables/useFields';

const props = defineProps({
  title: {
    type: String,
    default: 'Child Items'
  },
  rows: {
    type: Array,
    default: () => []
  },
  fields: {
    type: Array,
    default: () => []
  },
  displayFields: {
    type: Array,
    default: () => [] // Fields to display in the row summary (defaults to all fields if not specified)
  },
  addButtonLabel: {
    type: String,
    default: 'Add Item'
  },
  emptyMessage: {
    type: String,
    default: 'No items available.'
  }
});

const emit = defineEmits(['add', 'update', 'delete']);

// Get formatters and helpers from useFields
const { formatCurrency, formatDate, isEmoji } = useFields();

// Dialog state
const dialogVisible = ref(false);
const dialogTitle = ref('Add Item');
const isEditMode = ref(false);
const editIndex = ref(-1);
const editData = ref({});
const activeRowIndex = ref(-1);

// Delete confirmation dialog
const deleteDialogVisible = ref(false);
const indexToDelete = ref(-1);

// Computed properties
const displayFieldsList = computed(() => {
  // If displayFields prop is empty, use all fields
  return props.displayFields.length > 0 ? props.displayFields : props.fields;
});

// Create a copy of fields array that we can use for the edit dialog
const editFields = computed(() => {
  return props.fields.map(field => ({ ...field }));
});

// Methods
const openAddDialog = () => {
  // Initialize empty edit data based on fields
  const initialData = {};
  props.fields.forEach(field => {
    if (field.type === 'boolean') {
      initialData[field.name] = field.default || false;
    } else {
      initialData[field.name] = field.default || '';
    }
  });
  
  editData.value = initialData;
  isEditMode.value = false;
  editIndex.value = -1;
  dialogTitle.value = `Add ${props.title}`;
  dialogVisible.value = true;
};

const openEditDialog = (row, index) => {
  // Create a copy of the row data to prevent direct reference modification
  editData.value = JSON.parse(JSON.stringify(row));
  isEditMode.value = true;
  editIndex.value = index;
  activeRowIndex.value = index;
  dialogTitle.value = `Edit ${props.title}`;
  dialogVisible.value = true;
};

const handleSubmit = (formData) => {
  if (isEditMode.value) {
    // Update existing row
    emit('update', { index: editIndex.value, data: formData });
  } else {
    // Add new row
    emit('add', formData);
  }
  
  dialogVisible.value = false;
  activeRowIndex.value = -1;
};

const cancelEdit = () => {
  dialogVisible.value = false;
  activeRowIndex.value = -1;
};

const confirmDelete = (index) => {
  indexToDelete.value = index;
  activeRowIndex.value = index;
  deleteDialogVisible.value = true;
};

const handleDelete = () => {
  emit('delete', indexToDelete.value);
  deleteDialogVisible.value = false;
  activeRowIndex.value = -1;
};

// Helper function for formatting display values based on field type
const formatFieldValue = (value, fieldType) => {
  if (value === null || value === undefined) return '';
  
  switch (fieldType) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'currency':
      return formatCurrency(value);
    case 'date':
      return formatDate(value);
    default:
      return String(value);
  }
};
</script>