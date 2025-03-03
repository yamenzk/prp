<template>
	<Card class="contact-card">
		<template #header>
			<div class="flex justify-between items-center p-2">
				<div class="contact-type">{{ type }}</div>
				<div class="flex gap-1">
					<slot name="actions"></slot>
				</div>
			</div>
		</template>
		<template #content>
			<div class="flex items-center p-2">
				<div class="contact-icon mr-3">
					<FeatherIcon :name="getContactIcon(type)" />
				</div>
				<div class="contact-value">{{ value }}</div>
			</div>
		</template>
	</Card>
</template>

<script setup>
defineProps({
	type: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
})

// Get icon based on contact type
const getContactIcon = (type) => {
	switch (type) {
		case 'Mobile':
			return 'smartphone'
		case 'Phone':
			return 'phone'
		case 'Email':
			return 'mail'
		case 'WhatsApp':
			return 'message-circle'
		default:
			return 'link'
	}
}
</script>

<style scoped>
.contact-card {
	overflow: hidden;
	transition:
		transform 0.2s,
		box-shadow 0.2s;
}

.contact-card:hover {
	transform: translateY(-2px);
}

.contact-type {
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--text-tertiary);
}

.contact-icon {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--card-hover);
	color: var(--text-secondary);
}

.contact-value {
	font-weight: 500;
	word-break: break-all;
	color: var(--text-primary);
}

:deep(.p-card) {
	background-color: var(--card-background);
	border: 1px solid var(--card-border);
	box-shadow: none;
}

:deep(.p-card-content) {
	padding: 0.5rem;
}
</style>
