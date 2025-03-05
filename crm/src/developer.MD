
# Developer Guide: Building with PRP

This guide provides a step-by-step blueprint for introducing and working with new doctypes in PRP. Use this document as a reference when adding new features or extending existing ones.

## 1. Setting Up the Store

Create a new store using Pinia to manage the state and operations for your doctype.

```js
// stores/yourDoctypeStore.js
import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useYourDoctypeStore = defineStore('yourDoctype', {
  state: () => ({
    // Main list resource
    doctypeList: null,
    
    // Current selected doc
    currentDoc: null,
    currentDocResource: null,
    
    // Filters state
    filters: {},
  }),
  
  getters: {
    // All docs
    docs: (state) => state.doctypeList?.data || [],
    
    // Loading state
    isLoading: (state) => state.doctypeList?.list?.loading || false,
    
    // Error handling
    hasError: (state) => !!state.doctypeList?.list?.error,
    errorMessage: (state) => state.doctypeList?.list?.error?.message || '',
    
    // Pagination
    hasMoreDocs: (state) => state.doctypeList?.hasNextPage || false,
  },
  
  actions: {
    // Initialize the list resource with proper actions here
  }
})
```

## 2. Essential Store Methods

Implement these core methods in your store to manage the doctype data:

### 2.1. Initialize List Resource

```js
initDoctypeList() {
  const global = globalStore()
  
  if (!this.doctypeList && global.socket) {
    this.doctypeList = createListResource(
      {
        doctype: 'Your Doctype',
        fields: ['*'],
        orderBy: 'creation desc',
        start: 0,
        pageLength: 20,
        cache: 'your-app:your_doctype',
        auto: true,
      },
      global.socket
    )
    
    // Set up realtime listeners
    this.setupRealtimeListeners(global.socket)
  }
  return this.doctypeList
}
```

### 2.2. Setup Realtime Listeners

```js
setupRealtimeListeners(socket) {
  if (!socket) return
  
  socket.on('your-app:refetch_resource', (data) => {
    if (data.cache_key === 'your-app:your_doctype') {
      if (data.event === 'list_update') {
        this.refetchDocs()
      } else if (data.event === 'doc_update') {
        // If current doc was updated, refresh it
        if (this.currentDoc && this.currentDoc.name === data.doc) {
          this.refreshCurrentDoc()
        }
        // Also refresh the list
        this.refetchDocs()
      }
    }
  })
}
```

### 2.3. CRUD Operations

Implement these essential CRUD operations:

```js
// Fetch docs
async fetchDocs() {
  try {
    const doctypeList = this.initDoctypeList()
    if (doctypeList) {
      await doctypeList.reload()
    }
  } catch (error) {
    console.error('Error fetching docs:', error)
  }
}

// Fetch single doc
async fetchDoc(docId) {
  const global = globalStore()
  
  this.currentDocResource = createDocumentResource(
    {
      doctype: 'Your Doctype',
      name: docId,
      auto: true,
      onSuccess: (doc) => {
        this.currentDoc = doc
      },
      onError: (error) => {
        console.error(`Error fetching doc ${docId}:`, error)
        this.currentDoc = null
      },
    },
    global.socket
  )
  
  try {
    await this.currentDocResource.get.submit()
    return this.currentDoc
  } catch (error) {
    return null
  }
}

// Create doc
async createDoc(docData) {
  if (!this.doctypeList) {
    this.initDoctypeList()
  }
  
  try {
    const result = await this.doctypeList.insert.submit(docData)
    return result
  } catch (error) {
    console.error('Error creating doc:', error)
    throw error
  }
}

// Update doc
async updateDoc(name, data) {
  if (!this.doctypeList) {
    this.initDoctypeList()
  }
  
  try {
    const result = await this.doctypeList.setValue.submit({
      name,
      ...data,
    })
    return result
  } catch (error) {
    console.error(`Error updating doc ${name}:`, error)
    throw error
  }
}

// Delete doc
async deleteDoc(name) {
  if (!this.doctypeList) {
    this.initDoctypeList()
  }
  
  try {
    await this.doctypeList.delete.submit(name)
    
    // Clear current doc if it was deleted
    if (this.currentDoc && this.currentDoc.name === name) {
      this.currentDoc = null
      this.currentDocResource = null
    }
  } catch (error) {
    console.error(`Error deleting doc ${name}:`, error)
    throw error
  }
}
```

## 3. Setting Up List View

Create a list view component to display and interact with your doctype records.

```vue
<!-- components/your-doctype/YourDoctypeList.vue -->
<template>
  <DataTable 
    v-model:filters="filters" 
    :value="filteredDocs" 
    dataKey="name"
    v-model:selection="selectedDoc" 
    filterDisplay="menu" 
    scrollable 
    scrollHeight="flex" 
    :loading="isLoading" 
    :globalFilterFields="['name', 'title', 'owner', 'status']"
  >
    <template #header>
      <div class="flex justify-between">
        <div class="flex gap-2">
          <Button type="button" icon="pi pi-filter-slash" outlined @click="resetFilters()" />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
        <Button type="button" icon="pi pi-plus" @click="openCreateDialog()" />
      </div>
    </template>
    
    <!-- Table columns -->
    <Column selectionMode="single" headerStyle="width: 3rem"></Column>
    <Column field="name" header="Name" style="min-width: 12rem">
      <template #body="{ data }">
        <a href="#" @click.prevent="selectDoc(data)">{{ data.name }}</a>
      </template>
    </Column>
    <!-- Add more columns as needed -->
    
    <!-- Load more button -->
    <div v-if="hasMoreDocs" class="flex justify-center mt-4">
      <Button type="button" label="Load More" @click="loadMoreDocs()" :loading="isLoading" />
    </div>
  </DataTable>
  
  <!-- Create Dialog -->
  <CreateDialog
    v-model:visible="createDialogVisible"
    :title="`Create New ${docName}`"
    :fields="createFields"
    :submit-button-label="`Create ${docName}`"
    @submit="createDoc"
  />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import CreateDialog from '@/components/dialogs/CreateDialog.vue'
import { useYourDoctypeStore } from '@/stores'

// Initialize the store
const doctypeStore = useYourDoctypeStore()

// Selected doc tracking
const selectedDocId = ref(null)
const selectedDoc = ref(null)

// Dialog state
const createDialogVisible = ref(false)

// Define fields for create dialog
const createFields = [
  // Define your fields here
]

// Emit events
const emit = defineEmits(['doc-selected', 'doc-created'])

// Filter and data setup
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // Add specific field filters as needed
})

// Initialize data
onMounted(() => {
  fetchDocs()
})

// Methods
const fetchDocs = () => {
  doctypeStore.fetchDocs()
}

const resetFilters = () => {
  // Reset filters logic
}

const selectDoc = (doc) => {
  selectedDoc.value = doc
  selectedDocId.value = doc.name
  emit('doc-selected', doc.name)
}

const createDoc = async (formData) => {
  try {
    createDialogVisible.value = false
    const newDoc = await doctypeStore.createDoc(formData)
    emit('doc-created', newDoc)
  } catch (error) {
    console.error('Error creating doc:', error)
  }
}
</script>
```

## 4. Building the Document View

Create a component to display and edit a single document.

```vue
<!-- components/your-doctype/YourDoctypeView.vue -->
<template>
  <div v-if="!currentDoc" class="m-auto">
    <!-- Empty state -->
    <Panel class="m-8">
      <div class="flex flex-col items-center justify-center h-full text-center py-12">
        <FeatherIcon
          name="file-text"
          class="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4"
        />
        <h3 class="text-xl font-medium text-tertiary mb-2">No Document Selected</h3>
        <p class="text-tertiary max-w-sm">
          Select a document from the list to view its details.
        </p>
      </div>
    </Panel>
  </div>
  <div v-else class="w-full">
    <!-- Document header -->
    <div class="doc-header border-b border-gray-200 dark:border-zinc-700 p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">{{ currentDoc.name }}</h2>
        <!-- Status tag or other indicators -->
        <div class="flex gap-2">
          <!-- Action buttons -->
        </div>
      </div>
    </div>
    
    <!-- Document content -->
    <div class="p-4">
      <!-- Editable fieldsets -->
      <EditableFieldset
        legend="Basic Information"
        :fields="basicFields"
        :data="currentDoc"
        :columns="2"
        @edit="openEditDialog"
        @update="handleFieldUpdate"
      />
      
      <!-- Child tables -->
      <ChildTable
        v-if="currentDoc.child_items"
        title="Related Items"
        :rows="currentDoc.child_items"
        :fields="childItemFields"
        @add="addChildItem"
        @update="updateChildItem"
        @delete="deleteChildItem"
      />
    </div>
  </div>
  
  <!-- Edit Dialog -->
  <EditDialog
    v-model:visible="dialogVisible"
    :field-name="editingField"
    :field-type="editingFieldType"
    :value="editValue"
    :title="dialogTitle"
    :options="dialogOptions"
    :validation="dialogValidation"
    :doctype="dialogDoctype"
    @save="handleDialogSave"
  />
  
  <!-- Delete Dialog -->
  <DeleteDialog
    v-model:visible="deleteDialogVisible"
    :title="`Delete ${docName}`"
    :message="`This action cannot be undone. To confirm deletion, please type the document name below:`"
    confirm-field="name"
    :confirm-value="currentDoc?.name"
    :delete-button-label="`Delete ${docName}`"
    @confirm="confirmDeleteDoc"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useYourDoctypeStore } from '@/stores'
import EditableFieldset from '@/components/common/EditableFieldset.vue'
import ChildTable from '@/components/common/ChildTable.vue'
import EditDialog from '@/components/dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

// Props
const props = defineProps({
  docId: {
    type: String,
    default: null,
  },
})

// Store references
const doctypeStore = useYourDoctypeStore()

// Dialog state management
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingField = ref(null)
const editingFieldType = ref('text')
const editValue = ref(null)
const dialogOptions = ref([])
const dialogValidation = ref(null)
const dialogDoctype = ref('')

// Delete dialog state
const deleteDialogVisible = ref(false)

// Field definitions
const basicFields = [
  // Define your fields here
]

const childItemFields = [
  // Define child table fields here
]

// Computed properties
const currentDoc = computed(() => doctypeStore.currentDoc)
const docName = computed(() => 'Your Document Type')

// Events
const emit = defineEmits(['doc-deleted'])

// Watch for docId changes
watch(
  () => props.docId,
  async (newDocId) => {
    if (newDocId) {
      await doctypeStore.fetchDoc(newDocId)
    } else {
      doctypeStore.currentDoc = null
    }
  },
  { immediate: true },
)

// Methods for document management
const openEditDialog = (fieldName, currentValue, title, type, options, validation, doctype) => {
  // Handle field editing
  editingField.value = fieldName
  editValue.value = currentValue
  dialogTitle.value = title
  editingFieldType.value = type || 'text'
  dialogOptions.value = options || []
  dialogValidation.value = validation || null
  dialogDoctype.value = doctype || ''
  
  dialogVisible.value = true
}

const handleDialogSave = async ({ fieldName, value }) => {
  if (!currentDoc.value || !fieldName) return

  try {
    await doctypeStore.updateDoc(currentDoc.value.name, {
      [fieldName]: value,
    })
  } catch (error) {
    console.error('Error updating field:', error)
  }
}

// Child table methods
const addChildItem = async (newItem) => {
  if (!currentDoc.value) return
  
  try {
    const childItems = [...(currentDoc.value.child_items || []), newItem]
    await doctypeStore.updateDoc(currentDoc.value.name, {
      child_items: childItems
    })
  } catch (error) {
    console.error('Error adding child item:', error)
  }
}

const updateChildItem = async ({ index, data }) => {
  if (!currentDoc.value || !currentDoc.value.child_items) return
  
  try {
    const childItems = [...currentDoc.value.child_items]
    childItems[index] = data
    await doctypeStore.updateDoc(currentDoc.value.name, {
      child_items: childItems
    })
  } catch (error) {
    console.error('Error updating child item:', error)
  }
}

const deleteChildItem = async (index) => {
  if (!currentDoc.value || !currentDoc.value.child_items) return
  
  try {
    const childItems = [...currentDoc.value.child_items]
    childItems.splice(index, 1)
    await doctypeStore.updateDoc(currentDoc.value.name, {
      child_items: childItems
    })
  } catch (error) {
    console.error('Error deleting child item:', error)
  }
}

// Delete document
const confirmDeleteDoc = async () => {
  if (!currentDoc.value) return

  try {
    await doctypeStore.deleteDoc(currentDoc.value.name)
    deleteDialogVisible.value = false
    emit('doc-deleted')
  } catch (error) {
    console.error('Error deleting doc:', error)
  }
}
</script>
```

## 5. Field Definition Reference

When defining fields for your forms, use this structure for consistency:

```js
// Field Object Structure
{
  name: 'field_name',         // Required: Database field name
  label: 'Display Label',     // Required: Human-readable label
  type: 'text',               // Required: Field type (see types below)
  validation: {               // Optional: Validation rules
    required: true,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9]+$',
    message: 'Custom error message'
  },
  options: ['Option 1', 'Option 2'], // Required for select/status fields
  doctype: 'Linked Doctype',  // Required for link fields
  default: '',                // Optional: Default value
  icon: '🔍',                 // Optional: Icon for display (emoji, PrimeIcon, or Feather)
  fullWidth: false,           // Optional: Take full width in forms
  readonly: false             // Optional: Prevent editing
}
```

### 5.1. Supported Field Types

| Type | Description | Usage |
|------|-------------|-------|
| `text` | Basic text input | Regular text fields |
| `textarea` | Multi-line text | Descriptions, notes, etc. |
| `number` | Numeric input with decimals | Amounts, quantities |
| `int` | Integer input | Counts, IDs |
| `currency` | Money amounts | Prices, costs |
| `date` | Date picker | Dates |
| `boolean` | Yes/No checkbox | Flags, toggles |
| `select` | Dropdown with options | Predefined choices |
| `status` | Status dropdown | Document status with colors |
| `link` | Reference to another doctype | Relations |

### 5.2. Validation Options

| Validation | Description | Example |
|------------|-------------|---------|
| `required` | Field must have a value | `required: true` |
| `minLength` | Minimum text length | `minLength: 5` |
| `maxLength` | Maximum text length | `maxLength: 100` |
| `pattern` | Regex pattern | `pattern: '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'` |
| `min` | Minimum numeric value | `min: 0` |
| `max` | Maximum numeric value | `max: 100` |
| `custom` | Custom validation function | `custom: value => value.includes('@')` |
| `message` | Custom error message | `message: 'Invalid input'` |

## 6. Main Components Reference

### 6.1. Dialog Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `CreateDialog` | Create/edit full forms | `visible`, `title`, `fields`, `initialData` |
| `EditDialog` | Edit a single field | `visible`, `fieldName`, `value`, `fieldType` |
| `DeleteDialog` | Confirm deletions | `visible`, `title`, `message`, `confirmField` |

### 6.2. Display Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `EditableField` | Single editable field | `fieldName`, `label`, `value`, `fieldType` |
| `EditableFieldset` | Group of editable fields | `legend`, `fields`, `data`, `columns` |
| `ChildTable` | Manage child records | `title`, `rows`, `fields`, `displayFields` |
| `FormField` | Form field in dialogs | `modelValue`, `type`, `label`, `validation` |

## 7. Handling Child Tables

Child tables are collections of related records stored as JSON arrays within a parent document. Use these steps to implement them:

1. **Define child table fields**
   ```js
   const childTableFields = [
     { name: 'item_name', label: 'Item', type: 'text', validation: { required: true } },
     { name: 'quantity', label: 'Qty', type: 'number', default: 1 },
     { name: 'rate', label: 'Rate', type: 'currency', default: 0 }
   ]
   ```

2. **Use the ChildTable component**
   ```vue
   <ChildTable
     title="Line Items"
     :rows="parentDoc.items || []"
     :fields="childTableFields"
     :display-fields="[
       { name: 'item_name', label: 'Item', icon: '📦', type: 'text' },
       { name: 'quantity', label: 'Qty', icon: 'pi-hashtag', type: 'number' },
       { name: 'rate', label: 'Rate', icon: 'feather-dollar-sign', type: 'currency' }
     ]"
     @add="addChildItem"
     @update="updateChildItem"
     @delete="deleteChildItem"
   />
   ```

3. **Implement the handlers**
   ```js
   // Add new child item
   const addChildItem = async (newItem) => {
     const items = [...(parentDoc.value.items || []), newItem]
     await store.updateDoc(parentDoc.value.name, { items })
   }
   
   // Update existing child item
   const updateChildItem = async ({ index, data }) => {
     const items = [...parentDoc.value.items]
     items[index] = data
     await store.updateDoc(parentDoc.value.name, { items })
   }
   
   // Delete child item
   const deleteChildItem = async (index) => {
     const items = [...parentDoc.value.items]
     items.splice(index, 1)
     await store.updateDoc(parentDoc.value.name, { items })
   }
   ```

## 8. Page Integration

To integrate your doctype into a page with split-view layout:

```vue
<!-- pages/your-doctype.vue -->
<template>
  <div class="grid grid-cols-12 h-screen">
    <!-- List sidebar -->
    <div class="col-span-4 border-r border-gray-200 dark:border-zinc-700 overflow-hidden h-full">
      <YourDoctypeList @doc-selected="handleDocSelected" />
    </div>
    
    <!-- Document view -->
    <div class="col-span-8 overflow-hidden h-full">
      <YourDoctypeView :doc-id="selectedDocId" @doc-deleted="handleDocDeleted" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import YourDoctypeList from '@/components/your-doctype/YourDoctypeList.vue'
import YourDoctypeView from '@/components/your-doctype/YourDoctypeView.vue'

const selectedDocId = ref(null)

const handleDocSelected = (docId) => {
  selectedDocId.value = docId
}

const handleDocDeleted = () => {
  selectedDocId.value = null
}
</script>
```

## 9. Best Practices

1. **Consistent Naming**: Follow the pattern of `YourDoctype` for component names and `your_doctype` for database fields
2. **Modular Components**: Break down complex views into smaller components
3. **Store for Data Logic**: Keep all data manipulation in the store
4. **Reusable Fields**: Define fields centrally if used in multiple places
5. **Error Handling**: Always include try/catch blocks for API operations
6. **Event Communication**: Use events to communicate between components
7. **Documentation**: Add comments explaining complex logic or special cases

By following this guide, you can efficiently extend the application with new doctypes while maintaining consistency with the existing codebase.


This developer guide provides a comprehensive blueprint for introducing new doctypes in your application, covering everything from store setup to field definitions and UI implementation. Let me know if you need any clarification or additional information!