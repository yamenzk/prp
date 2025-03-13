<template>
	<div class="flex flex-col gap-4">
		<EditableFieldset
			legend="Listing"
			:fields="listingFields"
			:data="listing"
			:columns="3"
			customClass="mb-2"
			@edit="handleEdit"
		/>
		<EditableFieldset
			legend="Status"
			:fields="computedStatusFields"
			:data="listing"
			:columns="3"
			customClass="mb-2"
			@edit="handleEdit"
		/>
		<EditableFieldset
			legend="Secondhand Management"
			:fields="secondHandFields"
			:data="listing"
			:columns="3"
			customClass="mb-2"
			@edit="handleEdit"
		/>
	</div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import EditableFieldset from '@/components/common/EditableFieldset.vue'

// Props
const props = defineProps({
	listing: {
		type: Object,
		required: true,
	},
})

// Emits
const emit = defineEmits(['edit-field'])

// Field definitions with validations
const listingFields = [
	{
		name: 'unit_id',
		label: 'Unit ID',
		type: 'text',
		icon: 'pi pi-id-card',
	},
	{
		name: 'developer',
		label: 'Developer',
		type: 'link',
		doctype: 'PRP Developer',
		icon: 'pi pi-briefcase',
	},
	{
		name: 'type',
		label: 'Type',
		type: 'select',
		options: ['Flat', 'Villa', 'Townhouse', 'Penthouse'],
		icon: 'pi pi-th-large',
	},
	{
		name: 'bedrooms',
		label: 'Bedrooms',
		type: 'select',
		options: ['Studio', '1-BR', '2-BR', '3-BR', '4-BR', '5-BR', '6-BR', '7-BR', '7+'],
	},
]

const statusFields = [
	{
		name: 'availability',
		label: 'Availability',
		type: 'select',
		options: ['Available', 'Sold'],
		icon: 'pi pi-tag',
	},
	{
		name: 'status',
		label: 'Handover Status',
		type: 'select',
		options: ['Off-plan', 'Due for Handover', 'Handover Completed'],
		icon: 'pi pi-clock',
	},
]

const secondHandFields = [
	{
		name: 'enable_secondhand_selling',
		label: 'Available for Selling',
		type: 'boolean',
	},
	{
		name: 'enable_secondhand_renting',
		label: 'Available for Renting',
		type: 'boolean',
	},
]

// Computed field that dynamically sets readonly on status field based on availability
const computedStatusFields = computed(() => {
	return statusFields.map((field) => {
		// If the field is 'status' and the listing's availability is 'Available for Secondhand'
		if (
			field.name === 'availability' &&
			props.listing.availability === 'Available for Secondhand'
		) {
			return {
				...field,
				readonly: true,
			}
		}
		return field
	})
})

// Combine field handling
const handleEdit = (fieldName, currentValue, title) => {
	// Find the field definition in any of the field arrays
	const allFields = [...listingFields, ...statusFields, ...secondHandFields]
	const fieldDef = allFields.find((field) => field.name === fieldName) || {}

	// Don't allow editing status field if availability is 'Available for Secondhand'
	if (
		fieldName === 'availability' &&
		props.listing.availability === 'Available for Secondhand'
	) {
		return
	}

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
