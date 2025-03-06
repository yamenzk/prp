import { format, parse, parseISO, isAfter, addDays } from 'date-fns'

/**
 * Format date for display (DD/MM/YYYY, 12-hour format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
	if (!date) return ''

	try {
		const dateObj = date instanceof Date ? date : new Date(date)
		return format(dateObj, 'dd/MM/yyyy h:mm a')
	} catch (e) {
		console.error('Error formatting date for display:', e)
		return ''
	}
}

/**
 * Format date for server (YYYY-MM-DD HH:MM:SS in 24h format)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string for server
 */
export const formatDateForServer = (date) => {
	if (!date) return null

	try {
		// Format as YYYY-MM-DD HH:MM:SS for Frappe backend in 24-hour format
		return format(date, 'yyyy-MM-dd HH:mm:ss')
	} catch (e) {
		console.error('Error formatting date for server:', e)
		return null
	}
}

export const formatDate = (date) => {
	if (!date) return ''

	try {
		return format(parseISO(date), 'dd/MM/yyyy')
	} catch (e) {
		console.error('Error formatting date:', e)
		return ''
	}
}

/**
 * Parse server date format to JavaScript Date
 * @param {string} dateString - Date string from server in format DD-MM-YYYY HH:MM:SS
 * @returns {Date|null} JavaScript Date object or null if invalid
 */
export const parseServerDate = (dateString) => {
	if (!dateString) return null

	try {
		// Parse the date from DD-MM-YYYY HH:MM:SS format
		return parse(dateString, 'dd-MM-yyyy HH:mm:ss', new Date())
	} catch (e) {
		console.error('Error parsing server date:', e)
		return null
	}
}

/**
 * Format due date with relative time (Today, Tomorrow)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date with relative indicators
 */
export const formatDueDate = (dateString) => {
	if (!dateString) return ''

	try {
		const date = dateString instanceof Date ? dateString : parseServerDate(dateString)
		if (!date) return ''

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Get just the date parts for comparison
		const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
		const tomorrowDay = new Date(
			tomorrow.getFullYear(),
			tomorrow.getMonth(),
			tomorrow.getDate(),
		)

		// If due today
		if (dateDay.getTime() === todayDay.getTime()) {
			return `Today at ${format(date, 'h:mm a')}`
		}

		// If due tomorrow
		if (dateDay.getTime() === tomorrowDay.getTime()) {
			return `Tomorrow at ${format(date, 'h:mm a')}`
		}

		// Otherwise show date
		return format(date, 'dd/MM/yyyy h:mm a')
	} catch (e) {
		console.error('Error formatting due date:', e)
		return dateString instanceof Date ? format(dateString, 'dd/MM/yyyy h:mm a') : dateString
	}
}

/**
 * Check if a date is overdue
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is overdue
 */
export const isOverdue = (dateString) => {
	if (!dateString) return false

	try {
		const date = dateString instanceof Date ? dateString : parseServerDate(dateString)
		return date && date < new Date()
	} catch (e) {
		console.error('Error checking if date is overdue:', e)
		return false
	}
}

/**
 * Format date for journal entries (Today, Yesterday, etc)
 * @param {string} dateString - ISO date string or date object
 * @returns {string} Formatted date with relative indicators
 */
export const formatJournalDate = (dateString) => {
	if (!dateString) return ''

	try {
		const date = dateString instanceof Date ? dateString : new Date(dateString)
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		// Get just the date parts for comparison
		const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
		const yesterdayDay = new Date(
			yesterday.getFullYear(),
			yesterday.getMonth(),
			yesterday.getDate(),
		)

		// If today
		if (dateDay.getTime() === todayDay.getTime()) {
			return 'Today'
		}

		// If yesterday
		if (dateDay.getTime() === yesterdayDay.getTime()) {
			return 'Yesterday'
		}

		// Otherwise show date
		return format(date, 'dd MMMM yyyy')
	} catch (e) {
		console.error('Error formatting journal date:', e)
		return ''
	}
}

/**
 * Format date based on note type
 * @param {string|Date} date - Date to format
 * @param {string} noteType - Type of note (note, task, journal)
 * @returns {string} Formatted date appropriate for the note type
 */
export const formatDateForNoteType = (date, noteType) => {
	if (!date) return ''

	try {
		const dateObj = date instanceof Date ? date : new Date(date)

		switch (noteType) {
			case 'task':
				return formatDueDate(dateObj)
			case 'journal':
				return formatJournalDate(dateObj)
			case 'note':
			default:
				return formatDateForDisplay(dateObj)
		}
	} catch (e) {
		console.error('Error formatting date for note type:', e)
		return ''
	}
}
