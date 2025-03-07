/**
 * Status configuration with colors and icons for leads and deals
 */

// Define status groups
export const LEAD_STATUSES = [
	'New',
	'Contacted',
	'Interested',
	'Needs Follow-up',
	'Cold',
	'Not Interested',
]

export const DEAL_STATUSES = [
	'Site Visit Scheduled',
	'Site Visit Completed',
	'Negotiation',
	'Offer Made',
	'Under Review',
	'Under Contract',
	'Closed - Won',
	'Closed - Lost',
]

// All statuses configuration
export const STATUS_CONFIG = {
	// Lead statuses
	New: {
		icon: 'pi pi-plus-circle',
		color: '#4F46E5', // Indigo
		bgColor: '#EEF2FF',
		darkBgColor: 'rgba(79, 70, 229, 0.2)',
		textColor: '#4F46E5',
		darkTextColor: '#818CF8',
		severity: 'primary'

	},
	Contacted: {
		icon: 'pi pi-phone',
		color: '#0891B2', // Cyan
		bgColor: '#ECFEFF',
		darkBgColor: 'rgba(8, 145, 178, 0.2)',
		textColor: '#0891B2',
		darkTextColor: '#22D3EE',
		severity: 'info'
	},
	Interested: {
		icon: 'pi pi-thumbs-up',
		color: '#059669', // Green
		bgColor: '#ECFDF5',
		darkBgColor: 'rgba(5, 150, 105, 0.2)',
		textColor: '#059669',
		darkTextColor: '#34D399',
		severity: 'success'
	},
	'Needs Follow-up': {
		icon: 'pi pi-clock',
		color: '#D97706', // Amber
		bgColor: '#FFFBEB',
		darkBgColor: 'rgba(217, 119, 6, 0.2)',
		textColor: '#D97706',
		darkTextColor: '#FBBF24',
		severity: 'warn'
	},
	Cold: {
		icon: 'pi pi-thermometer',
		color: '#4B5563', // Gray
		bgColor: '#F3F4F6',
		darkBgColor: 'rgba(75, 85, 99, 0.2)',
		textColor: '#4B5563',
		darkTextColor: '#9CA3AF',
	},
	'Not Interested': {
		icon: 'pi pi-x-circle',
		color: '#DC2626', // Red
		bgColor: '#FEF2F2',
		darkBgColor: 'rgba(220, 38, 38, 0.2)',
		textColor: '#DC2626',
		darkTextColor: '#F87171',
		severity: 'danger'
	},

	// Deal statuses
	'Site Visit Scheduled': {
		icon: 'pi pi-calendar',
		color: '#8B5CF6', // Purple
		bgColor: '#F5F3FF',
		darkBgColor: 'rgba(139, 92, 246, 0.2)',
		textColor: '#8B5CF6',
		darkTextColor: '#A78BFA',
	},
	'Site Visit Completed': {
		icon: 'pi pi-check-square',
		color: '#7C3AED', // Violet
		bgColor: '#F5F3FF',
		darkBgColor: 'rgba(124, 58, 237, 0.2)',
		textColor: '#7C3AED',
		darkTextColor: '#A78BFA',
	},
	Negotiation: {
		icon: 'pi pi-message-square',
		color: '#0369A1', // Blue
		bgColor: '#EFF6FF',
		darkBgColor: 'rgba(3, 105, 161, 0.2)',
		textColor: '#0369A1',
		darkTextColor: '#60A5FA',
	},
	'Offer Made': {
		icon: 'pi pi-file-text',
		color: '#0E7490', // Teal
		bgColor: '#ECFEFF',
		darkBgColor: 'rgba(14, 116, 144, 0.2)',
		textColor: '#0E7490',
		darkTextColor: '#22D3EE',
	},
	'Under Review': {
		icon: 'pi pi-search',
		color: '#A16207', // Yellow
		bgColor: '#FEFCE8',
		darkBgColor: 'rgba(161, 98, 7, 0.2)',
		textColor: '#A16207',
		darkTextColor: '#FDE68A',
	},
	'Under Contract': {
		icon: 'pi pi-file-plus',
		color: '#D97706', // Amber
		bgColor: '#FFFBEB',
		darkBgColor: 'rgba(217, 119, 6, 0.2)',
		textColor: '#D97706',
		darkTextColor: '#FBBF24',
	},
	'Closed - Won': {
		icon: 'pi pi-award',
		color: '#15803D', // Green
		bgColor: '#F0FDF4',
		darkBgColor: 'rgba(21, 128, 61, 0.2)',
		textColor: '#15803D',
		darkTextColor: '#4ADE80',
	},
	'Closed - Lost': {
		icon: 'pi pi-slash',
		color: '#B91C1C', // Red
		bgColor: '#FEF2F2',
		darkBgColor: 'rgba(185, 28, 28, 0.2)',
		textColor: '#B91C1C',
		darkTextColor: '#F87171',
	},
}

/**
 * Get status configuration for a specific status
 * @param {string} status - The status value
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {object} The status configuration object
 */
export function getStatusConfig(status, isDarkMode = false) {
	const config = STATUS_CONFIG[status] || {
		icon: 'pi pi-help-circle',
		color: '#6B7280',
		bgColor: '#F3F4F6',
		darkBgColor: 'rgba(107, 114, 128, 0.2)',
		textColor: '#6B7280',
		darkTextColor: '#9CA3AF',
	}

	return {
		...config,
		currentBgColor: isDarkMode ? config.darkBgColor : config.bgColor,
		currentTextColor: isDarkMode ? config.darkTextColor : config.textColor,
	}
}

/**
 * Check if a status is a lead status
 * @param {string} status - The status to check
 * @returns {boolean} Whether the status is a lead status
 */
export function isLeadStatus(status) {
	return LEAD_STATUSES.includes(status)
}

/**
 * Check if a status is a deal status
 * @param {string} status - The status to check
 * @returns {boolean} Whether the status is a deal status
 */
export function isDealStatus(status) {
	return DEAL_STATUSES.includes(status)
}

export default {
	STATUS_CONFIG,
	LEAD_STATUSES,
	DEAL_STATUSES,
	getStatusConfig,
	isLeadStatus,
	isDealStatus,
}
