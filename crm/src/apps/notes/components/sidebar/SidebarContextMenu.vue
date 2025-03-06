<template>
  <div>
    <Menu ref="contextMenu" :model="items" :popup="true" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const contextMenu = ref(null);

defineProps({
  items: {
    type: Array,
    required: true
  }
});

// Method to show the context menu
const show = (event) => {
  contextMenu.value.show(event);
};

// Exposing the method to parent components
defineExpose({
  show
});
</script>