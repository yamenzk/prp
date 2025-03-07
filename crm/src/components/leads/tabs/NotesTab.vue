<template>
	<NotesView :doctype="doctype" :docname="docname" />
</template>

<script setup>
import NotesView from '@/apps/notes/common/NotesView.vue'

const props = defineProps({
	doctype: {
		type: String,
		required: true,
	},
	docname: {
		type: String,
		required: true,
	},
})
</script>
