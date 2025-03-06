<template>
  <div class="dock-container" :class="{ collapsed }">
    <ContextMenu global :model="menuItems" />
    <div class="dock" v-if="!collapsed">
      <div 
        v-for="item in items" 
        :key="item.id" 
        class="dock-item cursor-pointer transition-transform duration-200 hover:scale-110"
        @click="handleDockItemClick(item)"
      >
        <img :src="item.icon" :alt="item.label" />
      </div>
    </div>
    <div 
      class="dock-handle bg-zinc-600 dark:bg-zinc-200 cursor-pointer" 
      @click="toggleDock" 
      v-if="collapsed"
    ></div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from "vue";
import ContextMenu from 'primevue/contextmenu';

const emit = defineEmits(['open-notes']);

// Initialize with a fallback that emits an event
let notesDialog = {
  open: () => emit('open-notes')
};

// Access the notes dialog API provided by App.vue when available
onMounted(() => {
  const injectedDialog = inject('notesDialog', null);
  if (injectedDialog) {
    notesDialog = injectedDialog;
  }
});

// Dock items
const items = ref([
  { 
    id: 'notes', 
    label: "Notes", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Notes_icon.svg/2048px-Apple_Notes_icon.svg.png" 
  },
  { 
    id: 'appstore', 
    label: "App Store", 
    icon: "https://primefaces.org/cdn/primevue/images/dock/appstore.svg" 
  },
  { 
    id: 'photos', 
    label: "Photos", 
    icon: "https://primefaces.org/cdn/primevue/images/dock/photos.svg" 
  },
  { 
    id: 'trash', 
    label: "Trash", 
    icon: "https://primefaces.org/cdn/primevue/images/dock/trash.png" 
  }
]);

// UI state
const collapsed = ref(false);

// Context menu items
const menuItems = ref([
  {
    label: 'Collapse Dock',
    icon: 'pi pi-angle-double-down',
    command: () => collapsed.value = true
  }
]);

// Handle clicking on dock items
const handleDockItemClick = (item) => {
  if (item.id === 'notes') {
    // Using emit as a more reliable method instead of inject
    emit('open-notes');
  }
  // Handle other dock items as needed
};

// Toggle dock collapsed state
const toggleDock = () => {
  collapsed.value = !collapsed.value;
};
</script>

<style scoped>
/* Styles remain the same */
.dock-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    position: fixed;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    transition: transform 0.3s ease;
}

.dock {
    display: flex;
    gap: 12px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: background 0.3s ease;
}

@media (prefers-color-scheme: dark) {
    .dock {
        background: rgba(30, 30, 30, 0.6);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    }
}

.dock-item {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease-in-out;
}

.dock-item img {
    width: 100%;
    height: auto;
}

.dock-item:hover {
    transform: scale(1.2);
}

.dock-container.collapsed {
    transform: translateX(-50%) translateY(80%);
}

.dock-handle {
    width: 80px;
    height: 5px;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 5px;
}
</style>