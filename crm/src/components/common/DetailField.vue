<template>
	<div class="detail-field" @click="$emit('click')" :class="{ clickable: clickable }">
		<div class="detail-field-label">{{ label }}</div>
		<div class="detail-field-value">
			<slot>{{ value || placeholder }}</slot>
		</div>
	</div>
</template>

<script setup>
defineProps({
	label: {
		type: String,
		required: true,
	},
	value: {
		type: [String, Number, Boolean],
		default: '',
	},
	placeholder: {
		type: String,
		default: '-',
	},
	clickable: {
		type: Boolean,
		default: true,
	},
})

defineEmits(['click'])
</script>

<style scoped>
.detail-field {
	padding: 0.625rem;
	border-bottom: 1px solid var(--border-subtle);
	transition: background-color 0.15s ease;
}

.detail-field:last-child {
	border-bottom: none;
}

.detail-field.clickable {
	cursor: pointer;
}

.detail-field.clickable:hover {
	background-color: var(--card-hover);
}

.detail-field-label {
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--text-tertiary);
	margin-bottom: 0.25rem;
}

.detail-field-value {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--text-primary);
}
</style>
