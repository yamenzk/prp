<!-- components/common/DocumentCard.vue -->
<template>
  <div class="document-card" @click="$emit('view', document)" @contextmenu.prevent="onRightClick">
    <!-- Document Preview -->
    <div class="document-preview">
      <!-- PDF Preview -->
      <iframe 
        v-if="isFileType(document.attach, 'pdf')" 
        :src="getFileUrl(document.attach)" 
        class="document-iframe"
      ></iframe>
      
      <!-- Image Preview -->
      <img 
        v-else-if="isFileType(document.attach, 'image')" 
        :src="getFileUrl(document.attach)" 
        :alt="document.document_name" 
        class="document-preview-image"
      />
      
      <!-- Video Preview -->
      <div v-else-if="isFileType(document.attach, 'video')" class="document-preview-video">
        <FeatherIcon name="video" size="48" />
      </div>
      
      <!-- Audio Preview -->
      <div v-else-if="isFileType(document.attach, 'audio')" class="document-preview-audio">
        <FeatherIcon name="headphones" size="48" />
      </div>
      
      <!-- Other File Types -->
      <div v-else class="document-preview-other">
        <FeatherIcon :name="getFileIcon(document.attach)" size="48" />
      </div>
      
      <!-- Status Badges -->
      <div class="document-badges">
        <span v-if="document.public" class="document-badge public-badge">
          <i class="pi pi-globe"></i>
        </span>
        <span v-if="isExpired" class="document-badge expired-badge">
          <i class="pi pi-calendar-times"></i>
        </span>
        <span v-if="document.archived" class="document-badge archived-badge">
          <i class="pi pi-inbox"></i>
        </span>
      </div>
    </div>
    
    <!-- Document Info -->
    <div class="document-info">
      <h3 class="document-title">{{ document.document_name }}</h3>
      <p v-if="document.document_number" class="document-number">
        #{{ document.document_number }}
      </p>
      
      <div class="document-meta">
        <span class="document-date">
          <i class="pi pi-calendar"></i>
          {{ formatDate(document.issue_date) }}
        </span>
        <span v-if="document.expiry_date" class="document-expiry" :class="{ 'expired': isExpired }">
          <i class="pi pi-clock"></i>
          {{ expiryText }}
        </span>
      </div>
      
      <!-- Tags -->
      <div v-if="tags.length" class="document-tags">
        <span 
          v-for="tag in tags.slice(0, 2)" 
          :key="tag" 
          class="document-tag"
        >
          {{ tag }}
        </span>
        <span v-if="tags.length > 2" class="more-tags">+{{ tags.length - 2 }}</span>
      </div>
    </div>
    
    <!-- Context Menu -->
    <ContextMenu :model="menuItems" ref="menu" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDistance } from 'date-fns';

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  isArchive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view', 'edit', 'delete', 'archive', 'unarchive']);

const menu = ref(null);

// Computed properties
const isExpired = computed(() => {
  if (!props.document.expiry_date) return false;
  
  const today = new Date();
  const expiryDate = new Date(props.document.expiry_date);
  
  return today > expiryDate;
});

const expiryText = computed(() => {
  if (!props.document.expiry_date) return '';
  
  const today = new Date();
  const expiryDate = new Date(props.document.expiry_date);
  
  if (today > expiryDate) {
    return 'Expired';
  } else {
    try {
      return `Expires ${formatDistance(expiryDate, today, { addSuffix: true })}`;
    } catch (e) {
      return `Expires on ${formatDate(props.document.expiry_date)}`;
    }
  }
});

const tags = computed(() => {
  if (!props.document.tags) return [];
  return props.document.tags.split(',').map(tag => tag.trim()).filter(Boolean);
});

const menuItems = computed(() => {
  const items = [
    {
      label: 'View Document',
      icon: 'pi pi-eye',
      command: () => emit('view', props.document)
    }
  ];
  
  // Add edit option if owner
  if (props.isOwner) {
    items.push({
      label: 'Edit Details',
      icon: 'pi pi-pencil',
      command: () => emit('edit', props.document)
    });
  }
  
  // Add archive/unarchive option
  if (props.isArchive) {
    items.push({
      label: 'Unarchive',
      icon: 'pi pi-inbox',
      command: () => emit('unarchive', props.document)
    });
  } else {
    items.push({
      label: 'Archive',
      icon: 'pi pi-inbox',
      command: () => emit('archive', props.document)
    });
  }
  
  // Add delete option if owner
  if (props.isOwner) {
    items.push({
      separator: true
    });
    items.push({
      label: 'Delete',
      icon: 'pi pi-trash',
      class: 'p-error',
      command: () => emit('delete', props.document)
    });
  }
  
  return items;
});

// Methods
function onRightClick(event) {
  menu.value.show(event);
}

// Helper functions
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

function getFileIcon(url) {
  if (!url) return 'file';
  
  const extension = url.split('.').pop().toLowerCase();
  
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

function formatDate(date) {
  if (!date) return '';
  
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
.document-card {
  position: relative;
  background-color: var(--pd-bg-base);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px var(--pd-shadow-color);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.document-card:hover {
  box-shadow: 0 8px 24px var(--pd-shadow-color-strong);
  transform: translateY(-4px);
}

.document-preview {
  position: relative;
  height: 160px;
  overflow: hidden;
  background-color: var(--pd-bg-surface);
}

.document-iframe {
  width: 100%;
  height: 160px;
  border: none;
  pointer-events: none;
  transform: scale(1.2);
}

.document-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.document-card:hover .document-preview-image {
  transform: scale(1.05);
}

.document-preview-video,
.document-preview-audio,
.document-preview-other {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pd-text-tertiary);
  background: linear-gradient(135deg, var(--pd-bg-surface) 0%, var(--pd-bg-surface-hover) 100%);
}

.document-badges {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.document-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  font-size: 0.75rem;
}

.public-badge {
  background-color: rgba(52, 199, 89, 0.2);
  color: rgb(52, 199, 89);
}

.expired-badge {
  background-color: rgba(255, 59, 48, 0.2);
  color: rgb(255, 59, 48);
}

.archived-badge {
  background-color: rgba(88, 86, 214, 0.2);
  color: rgb(88, 86, 214);
}

.document-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.document-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--pd-text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-number {
  font-size: 0.75rem;
  color: var(--pd-text-tertiary);
  margin: 0 0 0.75rem 0;
}

.document-meta {
  font-size: 0.75rem;
  color: var(--pd-text-tertiary);
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.document-meta i {
  margin-right: 0.25rem;
}

.expired {
  color: var(--pd-error);
}

.document-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.document-tag {
  font-size: 0.7rem;
  background-color: var(--pd-badge-bg);
  color: var(--pd-badge-text);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.more-tags {
  font-size: 0.7rem;
  color: var(--pd-text-tertiary);
  background-color: var(--pd-bg-surface);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>