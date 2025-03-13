<template>
	<div class="flex flex-col gap-4">
		<EditableFieldset
			legend="Project Details"
			:fields="projectFields"
			:data="project"
			:columns="1"
			customClass="mb-2"
			@edit="handleEdit"
		/>
		<EditableFieldset
			legend="Location"
			:fields="locationFields"
			:data="project"
			:columns="1"
			customClass="mb-2"
			@edit="handleEdit"
		/>
		<EditableFieldset
			legend="Timeline"
			:fields="timelineFields"
			:data="project"
			:columns="1"
			customClass="mb-2"
			@edit="handleEdit"
		/>
	</div>
</template>

<script setup>
import { defineProps, defineEmits, readonly } from 'vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'

// Props
const props = defineProps({
	project: {
		type: Object,
		required: true,
	},
})

const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)

// Emits
const emit = defineEmits(['edit-field'])

// Field definitions with validations
const projectFields = [
	{
		name: 'project_name',
		label: 'Project Name',
		type: 'text',
		icon: 'pi pi-building',
		validation: { required: true },
	},
	{
		name: 'developer',
		label: 'Developer',
		type: 'link',
		doctype: 'PRP Developer',
		icon: 'pi pi-briefcase',
	},
	{
		name: 'status',
		label: 'Status',
		type: 'select',
		options: ['Active', 'On Hold', 'Completed', 'Canceled'],
		icon: 'pi pi-flag',
        readonly: true,
	},
	{
		name: 'availability',
		label: 'Availability',
		type: 'select',
		options: ['Available', 'Sold Out', 'Coming Soon'],
		icon: 'pi pi-tag',
        readonly: true,
	},
]

const locationFields = [
	{
		name: 'territory',
		label: 'Territory Code',
		type: 'link',
		doctype: 'PRP Territory',
		readonly: true,
	},
	{
		name: 'town',
		label: 'Town',
		type: 'text',
		icon: 'pi pi-map-marker',
        readonly: true,
	},

	{
		name: 'suburb',
		label: 'Suburb',
		type: 'text',
		icon: 'pi pi-sitemap',
        readonly: true,
	},

	{
		name: 'city',
		label: 'City',
		type: 'text',
		icon: 'pi pi-map',
        readonly: true,
	},
]

const timelineFields = [
	{
		name: 'handover_quarter',
		label: 'Handover Quarter',
		type: 'select',
		options: [
            { label: 'Q1', value: '1' },
            { label: 'Q2', value: '2' },
            { label: 'Q3', value: '3' },
            { label: 'Q4', value: '4' },
        ],
		icon: 'pi pi-calendar',
	},
	{
		name: 'handover_year',
		label: 'Handover Year',
		type: 'select',
		options: yearOptions,
		icon: 'pi pi-calendar-plus',
	},
]

// Combine field handling

const handleEdit = (fieldName, currentValue, title) => {
	// Find the field definition in any of the field arrays
	const allFields = [...projectFields, ...locationFields, ...timelineFields]
	const fieldDef = allFields.find((field) => field.name === fieldName) || {}

	// Emit edit event with all needed info
	emit('edit-field', {
		fieldName,
		currentValue,
		title,
		type: fieldDef.type || 'text',
		options: fieldDef.options || [],
		validation: fieldDef.validation || null,
		doctype: fieldDef.doctype || '',
	})
}
</script>
