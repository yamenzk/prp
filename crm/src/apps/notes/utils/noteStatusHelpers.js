/**
 * Status options for dropdown
 */
export const statusOptions = [
	{ label: 'Backlog', value: 'Backlog' },
	{ label: 'To Do', value: 'To Do' },
	{ label: 'In Progress', value: 'In Progress' },
	{ label: 'On Hold', value: 'On Hold' },
	{ label: 'Completed', value: 'Completed' },
	{ label: 'Cancelled', value: 'Cancelled' },
]

/**
 * Status options specific to tasks
 */
export const taskStatusOptions = [
	{ label: 'To Do', value: 'To Do' },
	{ label: 'In Progress', value: 'In Progress' },
	{ label: 'On Hold', value: 'On Hold' },
	{ label: 'Cancelled', value: 'Cancelled' },
]

/**
 * Get status options based on note type
 * @param {string} noteType - The type of note (note, task, journal)
 * @returns {Array} Array of status options appropriate for the note type
 */
export const getStatusOptionsForNoteType = (noteType) => {
	switch (noteType) {
		case 'task':
			return taskStatusOptions
		case 'journal':
			return [] // No statuses for journal
		case 'note':
		default:
			return statusOptions
	}
}

/**
 * Get the default status for a note type
 * @param {string} noteType - The type of note (note, task, journal)
 * @returns {string} Default status for the note type
 */
export const getDefaultStatusForNoteType = (noteType) => {
	switch (noteType) {
		case 'task':
			return 'To Do'
		case 'journal':
			return '' // No status for journal
		case 'note':
		default:
			return 'Backlog'
	}
}

/**
 * Check if status should be shown for a note type
 * @param {string} noteType - The type of note (note, task, journal)
 * @returns {boolean} Whether status should be shown
 */
export const shouldShowStatus = (noteType) => {
	return noteType !== 'journal'
}

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
 * Get PrimeVue Icon for status
 * @param {string} status - The status name
 * @returns {string} PrimeVue icon class
 */
export const getStatusIcon = (status) => {
	switch (status) {
		case 'Completed':
			return 'pi pi-check-circle text-green-500'
		case 'To Do':
			return 'pi pi-clock text-blue-500'
		case 'On Hold':
			return 'pi pi-pause text-orange-500'
		case 'In Progress':
			return 'pi pi-sync text-purple-500'
		case 'Cancelled':
			return 'pi pi-times-circle text-gray-500'
		case 'Backlog':
			return 'pi pi-inbox text-gray-500'
		default:
			return 'pi pi-circle-fill text-gray-400'
	}
}

/**
 * Get PrimeVue Icon for priority
 * @param {string} priority - The priority name
 * @returns {string} PrimeVue icon class
 */
export const getPriorityIcon = (priority) => {
	switch (priority) {
		case 'High':
			return 'pi pi-flag-fill text-red-500'
		case 'Medium':
			return 'pi pi-flag text-yellow-500'
		case 'Low':
			return 'pi pi-flag text-blue-500'
		default:
			return 'pi pi-flag text-gray-400'
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
			return 'warning'
		case 'In Progress':
			return 'info'
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
			return 'warning'
		case 'Low':
			return 'info'
		default:
			return 'info'
	}
}

/**
 * Get CSS class for note type indicator (subtle accent)
 * @param {string} noteType - Type of note (note, task, journal)
 * @returns {string} CSS class string for the indicator
 */
export const getNoteTypeIndicatorClass = (noteType) => {
	if (noteType === 'note') {
		return 'text-blue-600 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-400'
	} else if (noteType === 'task') {
		return 'text-green-600 dark:text-green-400 border-l-2 border-green-600 dark:border-green-400'
	} else {
		return 'text-purple-600 dark:text-purple-400 border-l-2 border-purple-600 dark:border-purple-400'
	}
}
