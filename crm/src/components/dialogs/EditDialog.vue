<!-- components/dialogs/EditDialog.vue -->
<template>
	<Dialog
		:visible="visible"
		@update:visible="$emit('update:visible', $event)"
		modal
		:header="title || 'Update Field'"
		:style="{ width: '30rem' }"
	>
		<FormField
			v-model="fieldValue"
			:type="fieldType"
			:label="title"
			:id="fieldName"
			:validation="validation"
			:options="options"
			:doctype="doctype"
			:icon="icon"
			:disabled="readonly || disabled"
			v-bind="allAdditionalProps"
		/>

		<template #footer>
			<Button label="Cancel" text @click="$emit('update:visible', false)" />
			<Button label="Save" @click="saveAndClose" :disabled="!isValid" />
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Dialog, Button } from 'primevue'
import FormField from '@/components/common/FormField.vue'
import { useFields } from '@/composables/useFields'

const props = defineProps({
	visible: {
		type: Boolean,
		required: true,
	},
	fieldName: {
		type: String,
		required: false,
		default: '',
	},
	fieldType: {
		type: String,
		default: 'text',
	},
	value: {
		type: [String, Number, Boolean, Object, Date],
		default: null,
	},
	title: {
		type: String,
		default: '',
	},
	options: {
		type: Array,
		default: () => [],
	},
	validation: {
		type: [Function, Object, String],
		default: null,
	},
	doctype: {
		type: String,
		default: '',
	},
	icon: {
		type: String,
		default: '',
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	additionalProps: {
		type: Object,
		default: () => ({}),
	},
})

const emit = defineEmits(['update:visible', 'save'])

const { validateField } = useFields()
const fieldValue = ref(normalizeValue(props.value, props.fieldType))
const validationError = ref('')

// Function to normalize values based on field type
function normalizeValue(value, fieldType) {
	if (fieldType === 'boolean') {
		// Ensure boolean values are properly converted
		return value === true || value === 1
	}
	return value
}

// Combine default additionalProps with currency-specific props when needed
const allAdditionalProps = computed(() => {
	const baseProps = props.additionalProps || {}

	// Add currency formatting props if needed
	if (props.fieldType === 'currency' && !baseProps.currency) {
		return {
			...baseProps,
			currency: 'AED',
			locale: 'en-AE',
		}
	}

	return baseProps
})

const isValid = computed(() => {
	const result = validateField(fieldValue.value, props.validation)
	return result === true
})

// Update value when props change
watch(
	() => props.value,
	(newVal) => {
		fieldValue.value = normalizeValue(newVal, props.fieldType)
	},
)

// Update value when visibility changes to true
watch(
	() => props.visible,
	(newVisible) => {
		if (newVisible) {
			fieldValue.value = normalizeValue(props.value, props.fieldType)
		}
	},
)

// Update value when field type changes
watch(
	() => props.fieldType,
	(newType) => {
		fieldValue.value = normalizeValue(props.value, newType)
	},
)

function saveAndClose() {
	if (!isValid.value) return

	let valueToSave = fieldValue.value

	// Format the value based on field type before saving
	if (props.fieldType === 'boolean') {
		// Convert to 1/0 for database if needed
		valueToSave = valueToSave === true ? 1 : 0
	}

	emit('save', {
		fieldName: props.fieldName,
		value: valueToSave,
	})
	emit('update:visible', false)
}
</script>
