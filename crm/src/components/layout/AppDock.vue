<template>
    <div class="dock-container" :class="{ collapsed }">
        <ContextMenu global :model="menuItems" />
        <div class="dock" v-if="!collapsed">
            <div 
                v-for="item in items" 
                :key="item.label" 
                class="dock-item"
                v-tooltip.top="item.label"
            >
                <img :src="item.icon" :alt="item.label" />
            </div>
        </div>
        <div class="dock-handle bg-zinc-600 dark:bg-zinc-200" @click="toggleDock" v-if="collapsed"></div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const items = ref([
    { label: "Notes", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Notes_icon.svg/2048px-Apple_Notes_icon.svg.png" },
    { label: "App Store", icon: "https://primefaces.org/cdn/primevue/images/dock/appstore.svg" },
    { label: "Photos", icon: "https://primefaces.org/cdn/primevue/images/dock/photos.svg" },
    { label: "Trash", icon: "https://primefaces.org/cdn/primevue/images/dock/trash.png" }
]);

const collapsed = ref(false);

const menuItems = ref([
    {
        label: 'Collapse Dock',
        icon: 'pi pi-angle-double-down',
        command: () => collapsed.value = true
    }
]);

const toggleDock = () => {
    collapsed.value = !collapsed.value;
};

const handleSwipe = (event) => {
    if (event.deltaY > 50) collapsed.value = true;
};
</script>

<style scoped>
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
