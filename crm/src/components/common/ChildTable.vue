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
      <div v-for="(row, index) in rows" :key="index" class="flex justify-between items-center p-3 border rounded">
        <slot name="row-content" :row="row" :index="index">
          <!-- Default row display if no slot is provided -->
          <div>
            <div v-for="(value, key) in row" :key="key" class="mb-1">
              <span class="font-medium">{{ key }}: </span>
              <span>{{ value }}</span>
            </div>
          </div>
        </slot>
        <div class="flex gap-2">
          <Button icon="pi pi-pencil" text @click="openEditDialog(row, index)" />
          <Button icon="pi pi-trash" text severity="danger" @click="confirmDelete(index)" />
        </div>
      </div>
    </div>
    
    <!-- Edit/Add Dialog -->
    <Dialog v-model:visible="dialogVisible" :header="dialogTitle" modal>
      <slot 
        name="dialog-content" 
        :edit-data="editData" 
        :is-edit-mode="isEditMode"
        :update-edit-data="updateEditData"
      >
        <!-- Default dialog content if no slot is provided -->
        <div class="p-fluid">
          <div v-for="field in fields" :key="field.name" class="field mb-4">
            <label :for="field.name" class="font-medium">{{ field.label }}</label>
            
            <InputText 
              v-if="field.type === 'text'" 
              v-model="editData[field.name]" 
              :id="field.name" 
              class="w-full mt-1" 
            />
            
            <Dropdown 
              v-else-if="field.type === 'select'" 
              v-model="editData[field.name]" 
              :options="field.options" 
              class="w-full mt-1" 
              :placeholder="`Select ${field.label}`"
              :id="field.name"
            />
            
            <InputNumber 
              v-else-if="field.type === 'number'" 
              v-model="editData[field.name]" 
              :id="field.name" 
              class="w-full mt-1" 
            />
            
            <DatePicker 
              v-else-if="field.type === 'date'" 
              v-model="editData[field.name]" 
              :id="field.name" 
              class="w-full mt-1" 
            />
          </div>
        </div>
      </slot>
      <template #footer>
        <Button label="Cancel" @click="dialogVisible = false" text />
        <Button label="Save" @click="saveEdit" />
      </template>
    </Dialog>
    
    <!-- Custom Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Deletion" modal>
      <div class="p-4">
        <p>Are you sure you want to delete this item?</p>
      </div>
      <template #footer>
        <Button label="No" @click="deleteDialogVisible = false" text />
        <Button label="Yes" @click="handleDelete" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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

// Dialog state
const dialogVisible = ref(false);
const dialogTitle = ref('Add Item');
const isEditMode = ref(false);
const editIndex = ref(-1);
const editData = ref({});

// Delete confirmation dialog
const deleteDialogVisible = ref(false);
const indexToDelete = ref(-1);

// Methods
const openAddDialog = () => {
  // Initialize empty edit data based on fields
  const initialData = {};
  props.fields.forEach(field => {
    initialData[field.name] = field.default || '';
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
  dialogTitle.value = `Edit ${props.title}`;
  dialogVisible.value = true;
};

const updateEditData = (field, value) => {
  editData.value[field] = value;
};

const saveEdit = () => {
  if (isEditMode.value) {
    // Update existing row
    emit('update', { index: editIndex.value, data: editData.value });
  } else {
    // Add new row
    emit('add', editData.value);
  }
  dialogVisible.value = false;
};

const confirmDelete = (index) => {
  indexToDelete.value = index;
  deleteDialogVisible.value = true;
};

const handleDelete = () => {
  emit('delete', indexToDelete.value);
  deleteDialogVisible.value = false;
};
</script>