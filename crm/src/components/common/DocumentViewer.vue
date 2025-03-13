    <!-- components/common/DocumentViewer.vue -->
    <template>
    <div class="document-viewer relative">
        <!-- Header with title and actions -->
        <div class="header-section absolute top-1 right-1 z-10">
        <!-- PrimeVue FileUpload component -->
        <FileUpload 
    mode="basic" 
    :url="'/api/method/upload_file'" 
    :maxFileSize="25000000"
    @upload="onFileUpload" 
    @error="onFileUploadError"
    :customUpload="true"
    @select="onFileSelect"
    chooseLabel="Upload"
    class="p-button-outlined"
    />
        </div>
        
        <!-- Tabs for document organization -->
        <Tabs v-model:activeIndex="activeTabIndex" scrollable>
        <TabList>
        <!-- All Documents Tab -->
        <Tab value="all">
          <router-link 
            :to="{ name: currentRouteName, query: { docTab: 'all' }}" 
            custom 
            v-slot="{ href, navigate }"
          >
            <a :href="href" @click="navigate" class="flex items-center">
              <i class="pi pi-folder-open"></i>
              <span class="px-2">All</span>
              <Badge v-if="allActiveDocuments.length" :value="allActiveDocuments.length"/>
            </a>
          </router-link>
        </Tab>
        
        <!-- Tags as tabs -->
        <Tab v-for="tag in uniqueTags" :key="tag" :value="tag">
          <router-link 
            :to="{ name: currentRouteName, query: { docTab: tag }}" 
            custom 
            v-slot="{ href, navigate }"
          >
            <a :href="href" @click="navigate" class="flex items-center">
              <i class="pi pi-tag"></i>
              <span class="px-2">{{ tag }}</span>
              <Badge v-if="getDocumentsByTag(tag).length" :value="getDocumentsByTag(tag).length"/>
            </a>
          </router-link>
        </Tab>
        
        <!-- Archive Tab -->
        <Tab value="archive">
          <router-link 
            :to="{ name: currentRouteName, query: { docTab: 'archive' }}" 
            custom 
            v-slot="{ href, navigate }"
          >
            <a :href="href" @click="navigate" class="flex items-center">
              <i class="pi pi-inbox"></i>
              <span class="px-2">Archive</span>
              <Badge v-if="archivedOrExpiredDocuments.length" :value="archivedOrExpiredDocuments.length" severity="danger" />
            </a>
          </router-link>
        </Tab>
      </TabList>
        
        <TabPanels>
            <!-- All Documents Panel -->
            <TabPanel value="all">
            <div v-if="allActiveDocuments.length === 0" class="empty-state">
                <FeatherIcon name="file" class="w-12 h-12" />
                <p>No documents found. Upload a new document to get started.</p>
            </div>
            
            <div v-else class="document-grid">
                <DocumentCard 
                v-for="doc in allActiveDocuments" 
                :key="doc.name"
                :document="doc"
                @edit="openEditDialog(doc)"
                @delete="confirmDelete(doc)"
                @archive="archiveDocument(doc)"
                @view="viewDocument(doc)"
                :isOwner="isDocumentOwner(doc)"
                />
            </div>
            </TabPanel>
            
            <!-- Tag-based Panels -->
            <TabPanel v-for="tag in uniqueTags" :key="tag" :value="tag">
            <div v-if="getDocumentsByTag(tag).length === 0" class="empty-state">
                <FeatherIcon name="tag" class="w-12 h-12" />
                <p>No documents with tag "{{ tag }}" found.</p>
            </div>
            
            <div v-else class="document-grid">
                <DocumentCard 
                v-for="doc in getDocumentsByTag(tag)" 
                :key="doc.name"
                :document="doc"
                @edit="openEditDialog(doc)"
                @delete="confirmDelete(doc)"
                @archive="archiveDocument(doc)"
                @view="viewDocument(doc)"
                :isOwner="isDocumentOwner(doc)"
                />
            </div>
            </TabPanel>
            
            <!-- Archive Panel -->
            <TabPanel value="archive">
            <div v-if="archivedOrExpiredDocuments.length === 0" class="empty-state">
                <FeatherIcon name="archive" class="w-12 h-12" />
                <p>No archived or expired documents found.</p>
            </div>
            
            <div v-else class="document-grid">
                <DocumentCard 
                v-for="doc in archivedOrExpiredDocuments" 
                :key="doc.name"
                :document="doc"
                @edit="openEditDialog(doc)"
                @delete="confirmDelete(doc)"
                @unarchive="unarchiveDocument(doc)"
                @view="viewDocument(doc)"
                :isOwner="isDocumentOwner(doc)"
                :isArchive="true"
                />
            </div>
            </TabPanel>
        </TabPanels>
        </Tabs>
        
        <!-- Create Document Dialog -->
        <CreateDialog
        v-model:visible="createDialogVisible"
        title="Upload New Document"
        :fields="documentFields"
        :initialData="newDocumentData"
        @submit="createDocument"
        submitButtonLabel="Upload Document"
        dialogWidth="50rem"
        />
        
        <!-- Edit Document Dialog -->
        <CreateDialog
        v-model:visible="editDialogVisible"
        title="Edit Document"
        :fields="documentEditFields"
        :initialData="editDocumentData"
        @submit="updateDocument"
        submitButtonLabel="Save Changes"
        />
        
        <!-- Delete Confirmation Dialog -->
        <DeleteDialog
        v-model:visible="deleteDialogVisible"
        title="Delete Document"
        message="This document will be disabled but not permanently deleted. Are you sure you want to proceed?"
        confirm-field="document_name"
        :confirm-value="documentToDelete?.document_name"
        delete-button-label="Disable Document"
        @confirm="confirmDeleteDocument"
        />
        
        <!-- Document Viewer Dialog -->
        <Dialog 
        v-model:visible="viewerDialogVisible" 
        :header="currentDocument?.document_name || 'Document Viewer'" 
        :style="{ width: '80vw', maxWidth: '1000px' }"
        modal
        dismissableMask
        >
        <div class="document-viewer-container">
            <!-- PDF Viewer -->
            <iframe 
            v-if="isFileType(currentDocument?.attach, 'pdf')" 
            :src="getFileUrl(currentDocument?.attach)" 
            width="100%" 
            height="600"
            class="document-iframe"
            ></iframe>
            
            <!-- Image Viewer -->
            <img 
            v-else-if="isFileType(currentDocument?.attach, 'image')" 
            :src="getFileUrl(currentDocument?.attach)" 
            class="document-image"
            />
            
            <!-- Video Player -->
            <video 
            v-else-if="isFileType(currentDocument?.attach, 'video')" 
            controls
            class="document-video"
            >
            <source :src="getFileUrl(currentDocument?.attach)" />
            Your browser does not support video playback.
            </video>
            
            <!-- Audio Player -->
            <audio 
            v-else-if="isFileType(currentDocument?.attach, 'audio')" 
            controls
            class="document-audio"
            >
            <source :src="getFileUrl(currentDocument?.attach)" />
            Your browser does not support audio playback.
            </audio>
            
            <!-- Other File Types -->
            <div v-else class="file-placeholder">
            <div class="file-icon">
                <FeatherIcon :name="getFileIcon(currentDocument?.attach)" class="w-12 h-12" />
            </div>
            <p class="file-name">{{ getFileName(currentDocument?.attach) }}</p>
            <Button 
                icon="pi pi-download" 
                label="Download File" 
                @click="downloadFile(currentDocument?.attach)"
            />
            </div>
        </div>
        
        <!-- Document Info Section -->
        <!-- Update the document info section in the Dialog component -->
<!-- Inside the Document Viewer Dialog -->
<div class="document-info">
  <div class="info-row">
    <span class="info-label">Document Number:</span>
    <span class="info-value">{{ currentDocument?.document_number || 'N/A' }}</span>
  </div>
  
  <div v-if="props.showIssueDate" class="info-row">
    <span class="info-label">Issue Date:</span>
    <span class="info-value">{{ formatDate(currentDocument?.issue_date) }}</span>
  </div>
  
  <div v-if="props.showExpiryDate" class="info-row">
    <span class="info-label">Expiry Date:</span>
    <span class="info-value" :class="{ 'expired-date': isExpired(currentDocument) }">
      {{ formatDate(currentDocument?.expiry_date) }}
      <Badge v-if="isExpired(currentDocument)" value="Expired" severity="danger" />
    </span>
  </div>
  
  <div v-if="props.showPlaceOfIssue" class="info-row">
    <span class="info-label">Place of Issue:</span>
    <span class="info-value">{{ currentDocument?.place_of_issue || 'N/A' }}</span>
  </div>
  
  <div class="info-row">
    <span class="info-label">Description:</span>
    <span class="info-value">{{ currentDocument?.description || 'No description available' }}</span>
  </div>
  
  <div class="info-row">
    <span class="info-label">Tags:</span>
    <span class="info-value">
      <Chip 
        v-for="tag in getDocumentTags(currentDocument)" 
        :key="tag" 
        :label="tag" 
        class="tag-chip"
      />
    </span>
  </div>
</div>
        </Dialog>
    </div>
    </template>

    <script setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { globalStore } from '@/stores/global';
    import { useDocumentStore } from '@/stores/document';
    import DocumentCard from './DocumentCard.vue';
    import DeleteDialog from '@/components/dialogs/DeleteDialog.vue';
    import CreateDialog from '@/components/dialogs/CreateDialog.vue';
    import { useToast } from 'primevue/usetoast';

    const toast = useToast();
const route = useRoute();
const router = useRouter();

    const props = defineProps({
    // The parent doctype and docname this document viewer is associated with
    relDoctype: {
        type: String,
        required: true
    },
    relDocname: {
        type: String,
        required: true
    },
    recommendedTags: {
    type: Array,
    default: () => []
  },
  showExpiryDate: {
    type: Boolean,
    default: true
  },
  showIssueDate: {
    type: Boolean,
    default: true
  },
  showPlaceOfIssue: {
    type: Boolean,
    default: true
  },
    // Related doctypes to include (e.g., parent building, parent project)
    relatedRooms: {
        type: Array,
        default: () => []
        // Format: [{ doctype: 'PRP Building', docname: 'BLD001' }]
    },
    // Title for the document section
    title: {
        type: String,
        default: 'Documents'
    }
    });

    // Stores
    const documentStore = useDocumentStore();
    const store = globalStore();

    // State
    const documents = ref([]);
    const loading = ref(true);
    const currentRouteName = computed(() => route.name);
    const activeTabIndex = computed({
  get() {
    return route.query.docTab || 'all';
  },
  set(newValue) {
    router.push({
      name: currentRouteName.value,
      query: { ...route.query, docTab: newValue }
    });
  }
});
    const currentDocument = ref(null);
    const viewerDialogVisible = ref(false);
    const createDialogVisible = ref(false);
    const editDialogVisible = ref(false);
    const newDocumentData = ref({});
    const editDocumentData = ref({});
    const deleteDialogVisible = ref(false);
    const documentToDelete = ref(null);
    const selectedFile = ref(null);

    // Document fields for create/edit dialogs
    // Modify documentFields computed property
const documentFields = computed(() => {
  const fields = [
    {
      name: 'document_name',
      label: 'Document Name',
      type: 'text',
      fullWidth: true,
      validation: 'required',
      icon: 'pi pi-file'
    },
    {
      name: 'document_number',
      label: 'Document Number',
      type: 'text',
      validation: {
        required: false
      },
      icon: 'pi pi-id-card'
    }
  ];
  
  // Conditionally add fields based on props
  if (props.showIssueDate) {
    fields.push({
      name: 'issue_date',
      label: 'Issue Date',
      type: 'date',
      validation: {
        required: false
      },
      icon: 'pi pi-calendar'
    });
  }
  
  if (props.showExpiryDate) {
    fields.push({
      name: 'expiry_date',
      label: 'Expiry Date',
      type: 'date',
      validation: {
        required: false
      },
      icon: 'pi pi-calendar-times'
    });
  }
  
  if (props.showPlaceOfIssue) {
    fields.push({
      name: 'place_of_issue',
      label: 'Place of Issue',
      type: 'text',
      validation: {
        required: false
      },
      icon: 'pi pi-map-marker'
    });
  }
  
  // Replace the tags field with chips type
  fields.push({
    name: 'tags',
    label: 'Tags',
    type: 'chips',
    fullWidth: true,
    validation: {
      required: false
    },
    icon: 'pi pi-tags',
    suggestions: props.recommendedTags
  });
  
  fields.push({
    name: 'description',
    label: 'Description',
    type: 'textarea',
    fullWidth: true,
    validation: {
      required: false
    },
    icon: 'pi pi-align-left'
  });
  
  fields.push({
    name: 'public',
    label: 'Public Document',
    type: 'boolean',
    default: true,
    fullWidth: true,
    icon: 'pi pi-globe'
  });
  
  return fields;
});

    // Edit fields (same as create fields but without attachment)
    const documentEditFields = computed(() => documentFields.value);

    // Computed properties
    const allActiveDocuments = computed(() => {
    return documents.value.filter(doc => 
        !doc.disabled && 
        !doc.archived && 
        !doc.expired && 
        (doc.public || isDocumentOwner(doc))
    );
    });

    const archivedOrExpiredDocuments = computed(() => {
    return documents.value.filter(doc => 
        !doc.disabled && 
        ((doc.archived || doc.expired) && 
        (doc.public || isDocumentOwner(doc)))
    );
    });

    // Get all unique tags from documents
    const uniqueTags = computed(() => {
    const tags = new Set();
    
    allActiveDocuments.value.forEach(doc => {
        if (doc.tags) {
        doc.tags.split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
            tags.add(tag);
        });
        }
    });
    
    return Array.from(tags);
    });

    // Watch for changes in related props
    watch([() => props.relDoctype, () => props.relDocname, () => props.relatedRooms], async () => {
    if (props.relDoctype && props.relDocname) {
        await fetchDocuments();
    }
    });
    onMounted(async () => {
  // Fetch documents if needed
  if (props.relDoctype && props.relDocname) {
    await fetchDocuments();
  }
  
  // Check if we're on a media tab without docTab query parameter
  if (route.params.tabId === 'media' && !route.query.docTab) {
    // Add docTab parameter without navigating away from the page
    router.replace({
      name: route.name,
      params: { ...route.params },
      query: { ...route.query, docTab: 'all' },
      hash: route.hash
    });
  }
});
    watch(() => route.query.docTab, (newTab) => {
  if (newTab && (newTab === 'all' || newTab === 'archive' || uniqueTags.value.includes(newTab))) {
    // This is a valid tab, no need to do anything since the computed property handles it
  } else {
    // If an invalid tab is specified, redirect to 'all'
    router.replace({
      name: currentRouteName.value,
      query: { ...route.query, docTab: 'all' }
    });
  }
});
    // Methods
    async function fetchDocuments() {
    loading.value = true;
    
    try {
        // Only proceed if we have valid params
        if (!props.relDoctype || !props.relDocname) {
        documents.value = [];
        return;
        }
        
        // Fetch documents for the main room
        const mainDocs = await documentStore.findDocumentsInRoom(
        props.relDoctype, 
        props.relDocname
        );
        console.log('Doctype:', props.relDoctype, 'Docname:', props.relDocname);
        console.log('Main documents:', mainDocs);
        
        // Fetch documents for related rooms
        let allDocs = [...mainDocs];
        
        for (const related of props.relatedRooms) {
        if (related.doctype && related.docname) {
            const relatedDocs = await documentStore.findDocumentsInRoom(
            related.doctype, 
            related.docname
            );
            allDocs = [...allDocs, ...relatedDocs];
        }
        }
        
        // Remove duplicates (by name)
        const uniqueDocs = [];
        const docMap = new Map();
        
        allDocs.forEach(doc => {
        if (!docMap.has(doc.name)) {
            docMap.set(doc.name, true);
            uniqueDocs.push(doc);
        }
        });
        
        documents.value = uniqueDocs;
    } catch (error) {
        console.error('Error fetching documents:', error);
    } finally {
        loading.value = false;
    }
    }

    // Filter documents by tag
    function getDocumentsByTag(tag) {
    return allActiveDocuments.value.filter(doc => {
        if (!doc.tags) return false;
        return doc.tags.split(',').map(t => t.trim()).includes(tag);
    });
    }

    // Get document tags as array
    function getDocumentTags(document) {
    if (!document || !document.tags) return [];
    return document.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Check if the current user is the owner of a document
    function isDocumentOwner(document) {
    return document?.owner === store.session?.user;
    }

    // File upload handlers
    function onFileSelect(event) {
    selectedFile.value = event.files[0];
    console.log('File selected:', selectedFile.value);
    
    // Since we're using customUpload=true, we need to handle the upload manually
    if (selectedFile.value) {
        uploadFile(selectedFile.value);
    }
    }

    async function uploadFile(file) {
    try {
        console.log('Starting file upload...', file);
        
        // Create form data with the exact parameters Frappe expects
        const formData = new FormData();
        formData.append('file', file);
        // These are the key parameters Frappe's upload_file expects
        formData.append('is_private', 0);
        formData.append('doctype', 'PRP Document');
        formData.append('docname', 'new'); // 'new' is a common convention for new records
        formData.append('fieldname', 'attach');
        
        // Upload file using fetch API
        const response = await fetch('/api/method/frappe.handler.upload_file', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for session cookies
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Upload response:', data);
        
        if (!data.message || !data.message.file_url) {
        throw new Error('Invalid response from server');
        }
        
        // Process successful upload
        handleSuccessfulUpload(file, data.message);
    } catch (error) {
        console.error('Upload error:', error);
        onFileUploadError({ files: [file], error: error.message });
    }
    }

    function onFileUpload(event) {
    try {
        const response = JSON.parse(event.xhr.response);
        console.log('File uploaded successfully:', response);
        
        if (response.message && response.message.file_url) {
        // Show success toast
        toast.add({ 
            severity: "success", 
            summary: "Upload Successful", 
            detail: "File has been uploaded", 
            life: 3000 
        });
        
        // Open dialog to fill in document details
        newDocumentData.value = {
            document_name: selectedFile.value.name.split('.')[0], // Default to file name without extension
            attach: response.message.file_url,
            public: false
        };
        
        createDialogVisible.value = true;
        } else {
        throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error processing upload response:', error);
        onFileUploadError({ error: 'Failed to process uploaded file' });
    } finally {
        selectedFile.value = null;
    }
    }
    function handleSuccessfulUpload(file, fileData) {
    // Show success toast
    toast.add({ 
        severity: "success", 
        summary: "Upload Successful", 
        detail: "File has been uploaded", 
        life: 3000 
    });
    
    // Open dialog to fill in document details with public=true by default
    newDocumentData.value = {
        document_name: file.name.split('.')[0], // Default to file name without extension
        attach: fileData.file_url,
        public: true  // Set to true by default
    };
    
    // If we have additional metadata from the server, use it
    if (fileData.filename) {
        newDocumentData.value.document_name = fileData.filename.split('.')[0];
    }
    
    createDialogVisible.value = true;
    }

    function onFileUploadError(event) {
    console.error('File upload error:', event.error);
    
    // Show error toast
    toast.add({ 
        severity: "error", 
        summary: "Upload Failed", 
        detail: event.error || "An error occurred during upload", 
        life: 5000 
    });
    
    selectedFile.value = null;
    }

    // Create a new document
    async function createDocument(data) {
    try {
        console.log('Creating document with data:', data);
        
        // Format dates properly for Frappe
        const formattedData = { ...data };
        if (Array.isArray(formattedData.tags)) {
      formattedData.tags = formattedData.tags.join(', ');
    }
        // Format issue_date if present
        if (formattedData.issue_date) {
        if (typeof formattedData.issue_date === 'string' && formattedData.issue_date.includes('T')) {
            formattedData.issue_date = formattedData.issue_date.split('T')[0];
        } else if (formattedData.issue_date instanceof Date) {
            formattedData.issue_date = formattedData.issue_date.toISOString().split('T')[0];
        }
        }
        
        // Format expiry_date if present
        if (formattedData.expiry_date) {
        if (typeof formattedData.expiry_date === 'string' && formattedData.expiry_date.includes('T')) {
            formattedData.expiry_date = formattedData.expiry_date.split('T')[0];
        } else if (formattedData.expiry_date instanceof Date) {
            formattedData.expiry_date = formattedData.expiry_date.toISOString().split('T')[0];
        }
        }
        
        // Ensure we have the required fields
        if (!formattedData.document_name || !formattedData.attach) {
        toast.add({
            severity: "error",
            summary: "Missing Data",
            detail: "Document name and attachment are required",
            life: 3000
        });
        return;
        }
        
        // Add the document to the current room
        const docData = {
        ...formattedData,
        rooms: [{
            rel_doctype: props.relDoctype,
            rel_docname: props.relDocname
        }]
        };
        
        console.log('Sending formatted data to server:', docData);
        await documentStore.createDocument(docData);
        await fetchDocuments();
        
        toast.add({
        severity: "success",
        summary: "Document Created",
        detail: `Document "${formattedData.document_name}" has been created`,
        life: 3000
        });
    } catch (error) {
        console.error('Error creating document:', error);
        toast.add({
        severity: "error",
        summary: "Creation Failed",
        detail: error.message || "Failed to create document",
        life: 5000
        });
    }
    }
    // Open edit dialog
    function openEditDialog(document) {
  // Create a copy of the document to avoid modifying the original
  const docCopy = { ...document };
  
  // Convert tag string to array for the chips input
  if (typeof docCopy.tags === 'string' && docCopy.tags) {
    docCopy.tags = docCopy.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  } else if (!docCopy.tags) {
    docCopy.tags = [];
  }
  
  editDocumentData.value = docCopy;
  editDialogVisible.value = true;
}

    // Update a document
    async function updateDocument(data) {
    try {
        // Format dates properly for Frappe
        const formattedData = { ...data };
        if (Array.isArray(formattedData.tags)) {
      formattedData.tags = formattedData.tags.join(', ');
    }
        // Format issue_date if present
        if (formattedData.issue_date) {
        if (typeof formattedData.issue_date === 'string' && formattedData.issue_date.includes('T')) {
            formattedData.issue_date = formattedData.issue_date.split('T')[0];
        } else if (formattedData.issue_date instanceof Date) {
            formattedData.issue_date = formattedData.issue_date.toISOString().split('T')[0];
        }
        }
        
        // Format expiry_date if present
        if (formattedData.expiry_date) {
        if (typeof formattedData.expiry_date === 'string' && formattedData.expiry_date.includes('T')) {
            formattedData.expiry_date = formattedData.expiry_date.split('T')[0];
        } else if (formattedData.expiry_date instanceof Date) {
            formattedData.expiry_date = formattedData.expiry_date.toISOString().split('T')[0];
        }
        }
        
        await documentStore.updateDocument(formattedData.name, formattedData);
        await fetchDocuments();
        
        toast.add({
        severity: "success",
        summary: "Document Updated",
        detail: `Document "${formattedData.document_name}" has been updated`,
        life: 3000
        });
    } catch (error) {
        console.error('Error updating document:', error);
        toast.add({
        severity: "error",
        summary: "Update Failed",
        detail: error.message || "Failed to update document",
        life: 5000
        });
    }
    }
    // Prepare for document deletion
    function confirmDelete(document) {
    documentToDelete.value = document;
    deleteDialogVisible.value = true;
    }

    // Confirm document deletion (actually just disable it)
    async function confirmDeleteDocument() {
    if (!documentToDelete.value) return;
    
    try {
        await documentStore.updateDocumentStatus(documentToDelete.value.name, { disabled: true });
        await fetchDocuments();
        
        toast.add({
        severity: "info",
        summary: "Document Disabled",
        detail: `Document "${documentToDelete.value.document_name}" has been disabled`,
        life: 3000
        });
        
        documentToDelete.value = null;
    } catch (error) {
        console.error('Error disabling document:', error);
        toast.add({
        severity: "error",
        summary: "Disable Failed",
        detail: error.message || "Failed to disable document",
        life: 5000
        });
    }
    }

    // Archive a document
    async function archiveDocument(document) {
    try {
        await documentStore.toggleArchived(document.name);
        await fetchDocuments();
        
        toast.add({
        severity: "info",
        summary: "Document Archived",
        detail: `Document "${document.document_name}" has been archived`,
        life: 3000
        });
    } catch (error) {
        console.error('Error archiving document:', error);
        toast.add({
        severity: "error",
        summary: "Archive Failed",
        detail: error.message || "Failed to archive document",
        life: 5000
        });
    }
    }

    // Unarchive a document
    async function unarchiveDocument(document) {
    try {
        if (document.archived) {
        await documentStore.toggleArchived(document.name);
        await fetchDocuments();
        
        toast.add({
            severity: "info",
            summary: "Document Unarchived",
            detail: `Document "${document.document_name}" has been unarchived`,
            life: 3000
        });
        }
    } catch (error) {
        console.error('Error unarchiving document:', error);
        toast.add({
        severity: "error",
        summary: "Unarchive Failed",
        detail: error.message || "Failed to unarchive document",
        life: 5000
        });
    }
    }

    // View a document
    function viewDocument(document) {
    currentDocument.value = document;
    viewerDialogVisible.value = true;
    }

    // Determine file type for display
    function isFileType(url, type) {
    if (!url) return false;
    
    const extension = url.split('.').pop().toLowerCase();
    
    switch (type) {
        case 'pdf':
        return extension === 'pdf';
        case 'image':
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
        case 'video':
        return ['mp4', 'webm', 'ogg', 'mov'].includes(extension);
        case 'audio':
        return ['mp3', 'wav', 'ogg', 'aac'].includes(extension);
        default:
        return false;
    }
    }

    // Get appropriate icon for file type
    function getFileIcon(url) {
    if (!url) return 'file';
    
    const extension = url.split('.').pop().toLowerCase();
    
    // Map of extensions to icons
    const iconMap = {
        // Documents
        'doc': 'file-text',
        'docx': 'file-text',
        'rtf': 'file-text',
        'txt': 'file-text',
        
        // Spreadsheets
        'xls': 'file-text',
        'xlsx': 'file-text',
        'csv': 'file-text',
        
        // Presentations
        'ppt': 'file-text',
        'pptx': 'file-text',
        
        // Archives
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
        
        // CAD
        'dwg': 'tool',
        'dxf': 'tool',
        
        // PDF
        'pdf': 'file-text',
    };
    
    return iconMap[extension] || 'file';
    }

    // Get file name from URL
    function getFileName(url) {
    if (!url) return 'Unknown file';
    
    // Extract file name from URL
    const parts = url.split('/');
    return parts[parts.length - 1];
    }

    // Format date for display
    function formatDate(date) {
    if (!date) return 'Not specified';
    
    try {
        return new Date(date).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    } catch (e) {
        return date;
    }
    }

    // Check if a document is expired
    function isExpired(document) {
    if (!document || !document.expiry_date) return false;
    
    const today = new Date();
    const expiryDate = new Date(document.expiry_date);
    
    return today > expiryDate;
    }

    // Download a file
    function downloadFile(url) {
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = getFileUrl(url);
    a.download = getFileName(url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    }

    // Get complete file URL
    function getFileUrl(url) {
    if (!url) return '';
    
    // If the URL is already absolute, return it
    if (url.startsWith('http')) {
        return url;
    }
    
    // Otherwise, prepend the base URL
    return `${url}`;
    }
    </script>

    <style scoped>
    .document-viewer {
    width: 100%;
    background-color: var(--pd-bg-base);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px var(--pd-shadow-color);
    }

    .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    }

    .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--pd-text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    }

    :deep(.p-fileupload-buttonbar) {
    background: transparent;
    border: none;
    padding: 0;
    }

    :deep(.p-fileupload-content) {
    display: none;
    }

    :deep(.p-button) {
    background-color: var(--pd-text-primary);
    color: var(--pd-bg-base);
    border: none;
    border-radius: 8px;
    font-weight: 500;
    }

    :deep(.p-button:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--pd-shadow-color);
    }

    .document-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 2rem;
    }

    .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
    color: var(--pd-text-tertiary);
    background-color: var(--pd-bg-surface);
    border-radius: 8px;
    margin-top: 1rem;
    }

    .empty-state p {
    margin-top: 1rem;
    max-width: 320px;
    }

    .document-viewer-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
    }

    .document-iframe {
    border: none;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--pd-bg-surface);
    }

    .document-image {
    max-width: 100%;
    max-height: 600px;
    border-radius: 8px;
    object-fit: contain;
    }

    .document-video,
    .document-audio {
    width: 100%;
    border-radius: 8px;
    background-color: var(--pd-bg-surface);
    }

    .file-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--pd-bg-surface);
    border-radius: 8px;
    width: 100%;
    }

    .file-icon {
    color: var(--pd-text-tertiary);
    margin-bottom: 1rem;
    }

    .file-name {
    font-size: 1.25rem;
    color: var(--pd-text-secondary);
    margin-bottom: 1.5rem;
    }

    .document-info {
    background-color: var(--pd-bg-surface);
    padding: 1.5rem;
    border-radius: 8px;
    }

    .info-row {
    display: flex;
    margin-bottom: 0.75rem;
    }

    .info-row:last-child {
    margin-bottom: 0;
    }

    .info-label {
    width: 120px;
    font-weight: 500;
    color: var(--pd-text-secondary);
    }

    .info-value {
    flex: 1;
    color: var(--pd-text-primary);
    }

    .expired-date {
    color: var(--pd-error);
    }

    .tag-chip {
    margin-right: 0.5rem;
    margin-bottom: 0.25rem;
    background-color: var(--pd-badge-bg);
    color: var(--pd-badge-text);
    }
    </style>