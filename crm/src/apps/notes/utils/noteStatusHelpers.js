/**
 * Status options for dropdown
 */
export const statusOptions = [
	{ label: 'Backlog', value: 'Backlog' },
	{ label: 'To Do', value: 'To Do' },
	{ label: 'On Hold', value: 'On Hold' },
	{ label: 'In Progress', value: 'In Progress' },
	{ label: 'Delayed', value: 'Delayed' },
	{ label: 'Completed', value: 'Completed' },
	{ label: 'Cancelled', value: 'Cancelled' },
]

/**
 * Priority options for dropdown
 */
export const priorityOptions = [
	{ label: 'High', value: 'High' },
	{ label: 'Medium', value: 'Medium' },
	{ label: 'Low', value: 'Low' },
]

/**
 * Task filter options
 */
export const taskFilterOptions = [
	{ label: 'All Tasks', value: 'all' },
	{ label: 'Active', value: 'active' },
	{ label: 'Completed', value: 'completed' },
]

/**
 * Priority filter options
 */
export const priorityFilterOptions = [
	{ label: 'All Priorities', value: '' },
	{ label: 'High', value: 'High' },
	{ label: 'Medium', value: 'Medium' },
	{ label: 'Low', value: 'Low' },
]

/**
 * Room filter options
 */
export const roomFilterOptions = [
	{ label: 'All', value: 'all' },
	{ label: 'Notes', value: 'notes' },
	{ label: 'Tasks', value: 'tasks' },
	{ label: 'Journals', value: 'journals' },
]

/**
 * Default task board visible statuses
 */
export const defaultVisibleStatuses = ['To Do', 'On Hold', 'In Progress', 'Completed']

/**
 * Get CSS class for note type button
 * @param {string} noteType - Type of note (note, task, journal)
 * @returns {string} CSS class string
 */
export const getNoteTypeClass = (noteType) => {
	if (noteType === 'note') {
		return '!bg-blue-100 dark:!bg-blue-900/30 !text-blue-600 dark:!text-blue-400'
	} else if (noteType === 'task') {
		return '!bg-green-100 dark:!bg-green-900/30 !text-green-600 dark:!text-green-400'
	} else {
		return '!bg-purple-100 dark:!bg-purple-900/30 !text-purple-600 dark:!text-purple-400'
	}
}

/**
 * Get PrimeVue severity class for status
 * @param {string} status - The status name
 * @returns {string} PrimeVue severity class
 */
export const getStatusSeverity = (status) => {
	switch (status) {
		case 'Completed':
			return 'success'
		case 'To Do':
			return 'info'
		case 'On Hold':
			return 'warn'
		case 'In Progress':
			return 'info'
		case 'Delayed':
			return 'danger'
		case 'Cancelled':
			return 'secondary'
		default:
			return 'info'
	}
}

/**
 * Get PrimeVue severity class for priority
 * @param {string} priority - The priority name
 * @returns {string} PrimeVue severity class
 */
export const getPrioritySeverity = (priority) => {
	switch (priority) {
		case 'High':
			return 'danger'
		case 'Medium':
			return 'warn'
		case 'Low':
			return 'info'
		default:
			return 'info'
	}
}
