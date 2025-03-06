/**
 * Common emoji icons for note picker
 */
export const commonEmojis = [
	'📝',
	'✅',
	'📌',
	'⭐',
	'🔖',
	'📎',
	'📁',
	'📞',
	'✉️',
	'💡',
	'⚠️',
	'💰',
	'🔍',
	'📊',
	'🗓️',
	'⏱️',
	'🏆',
	'🎯',
	'📈',
	'📉',
	'✨',
	'🚀',
	'❤️',
	'👍',
	'🔆',
	'🔔',
	'📣',
	'🔧',
	'🛠️',
	'🧩',
]

/**
 * Get status icon for Feather Icons
 * @param {string} status - The status name
 * @returns {string} Feather icon name
 */
export const getStatusFeatherIcon = (status) => {
	switch (status) {
		case 'Completed':
			return 'check-circle'
		case 'To Do':
			return 'clock'
		case 'On Hold':
			return 'pause-circle'
		case 'In Progress':
			return 'rotate-cw'

		case 'Cancelled':
			return 'x-circle'
		case 'Backlog':
			return 'inbox'
		default:
			return 'circle'
	}
}

/**
 * Get context icon for Feather Icons
 * @param {string} doctype - The document type
 * @returns {string} Feather icon name
 */
export const getContextFeatherIcon = (doctype) => {
	switch (doctype) {
		case 'PRP Lead':
			return 'user'
		case 'PRP Deal':
			return 'dollar-sign'
		case 'PRP Customer':
			return 'briefcase'
		case 'User':
			return 'user'
		default:
			return 'file'
	}
}

/**
 * Get context color CSS class
 * @param {string} doctype - The document type
 * @returns {string} CSS class for background color
 */
export const getContextColor = (doctype) => {
	switch (doctype) {
		case 'PRP Lead':
			return 'bg-blue-600'
		case 'PRP Deal':
			return 'bg-green-600'
		case 'PRP Customer':
			return 'bg-purple-600'
		case 'User':
			return 'bg-amber-600'
		default:
			return 'bg-zinc-600'
	}
}

/**
 * Generate icon picker items for PrimeVue menu
 * @param {Function} onSelect - Callback function when icon is selected
 * @returns {Array} Menu items configuration
 */
export const generateIconPickerItems = (onSelect) => {
	return [
		{
			label: 'Emojis',
			items: commonEmojis.map((emoji) => ({
				label: emoji,
				command: () => onSelect(emoji),
			})),
		},
		{
			label: 'Custom',
			command: () => {
				const customIcon = prompt('Enter custom icon (emoji or text):', '')
				if (customIcon) {
					onSelect(customIcon)
				}
			},
		},
	]
}
