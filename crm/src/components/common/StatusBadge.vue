<template>
	<div
		class="status-badge"
		:style="{
			backgroundColor: config.currentBgColor,
			color: config.currentTextColor,
		}"
	>
		<FeatherIcon :name="config.icon" class="status-icon" />
		<span class="status-text">{{ status }}</span>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusConfig } from '../../utils/statusConfig'

const props = defineProps({
	status: {
		type: String,
		default: '',
	},
	isDarkMode: {
		type: Boolean,
		default: false,
	},
})

const config = computed(() => getStatusConfig(props.status, props.isDarkMode))
</script>

<style scoped>
.status-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.25rem 0.625rem;
	border-radius: 1rem;
	font-size: 0.75rem;
	font-weight: 500;
	white-space: nowrap;
}

.status-icon {
	width: 0.875rem;
	height: 0.875rem;
}

.status-text {
	line-height: 1;
}

:deep(.dark) .status-badge {
	background-color: v-bind('config.darkBgColor');
	color: v-bind('config.darkTextColor');
}
</style>
