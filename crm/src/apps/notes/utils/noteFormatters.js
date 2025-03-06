import { format, parseISO, isAfter, addDays } from 'date-fns'

/**
 * Format standard date string
 * @param {string} dateString - Date string from server
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
	if (!dateString) return ''

	try {
		return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
	} catch (e) {
		return dateString
	}
}

/**
 * Format due date with relative time (Today, Tomorrow)
 * @param {string} dateString - Date string from server in format DD-MM-YYYY HH:MM:SS
 * @returns {string} Formatted date with relative indicators
 */
export const formatDueDate = (dateString) => {
	if (!dateString) return ''

	try {
		// Parse the date from DD-MM-YYYY HH:MM:SS format
		const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
		if (!parts) return dateString

		const date = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
		const today = new Date()

		// If due today
		if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
			return `Today at ${format(date, 'h:mm a')}`
		}

		// If due tomorrow
		const tomorrow = addDays(today, 1)
		if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
			return `Tomorrow at ${format(date, 'h:mm a')}`
		}

		return format(date, 'MMM d, yyyy h:mm a')
	} catch (e) {
		console.error('Error formatting due date:', e)
		return dateString
	}
}

/**
 * Format journal date with relative time (Today, Yesterday)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with relative indicators
 */
export const formatJournalDate = (dateString) => {
	if (!dateString) return ''

	try {
		const date = parseISO(dateString)
		const today = new Date()

		// If it's today
		if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
			return 'Today'
		}

		// If it's yesterday
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)
		if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
			return 'Yesterday'
		}

		return format(date, 'MMMM d, yyyy')
	} catch (e) {
		return dateString
	}
}

/**
 * Check if a date is overdue
 * @param {string} dateString - Date string from server in format DD-MM-YYYY HH:MM:SS
 * @returns {boolean} True if date is overdue
 */
export const isOverdue = (dateString) => {
	if (!dateString) return false

	try {
		// Parse the date from DD-MM-YYYY HH:MM:SS format
		const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
		if (!parts) return false

		const date = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
		return !isAfter(date, new Date())
	} catch (e) {
		return false
	}
}

/**
 * Format date from client timezone to server format (Dubai timezone)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string in format DD-MM-YYYY HH:MM:SS
 */
export const formatDateForServer = (date) => {
	if (!date) return null

	try {
		// Format the date as DD-MM-YYYY HH:MM:SS in Dubai timezone (GMT+4)
		const options = {
			timeZone: 'Asia/Dubai',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}

		const formatter = new Intl.DateTimeFormat('en-AE', options)
		const parts = formatter.formatToParts(date)
		const dateObj = {}

		parts.forEach((part) => {
			dateObj[part.type] = part.value
		})

		return `${dateObj.day}-${dateObj.month}-${dateObj.year} ${dateObj.hour}:${dateObj.minute}:${dateObj.second}`
	} catch (e) {
		console.error('Error formatting date for server:', e)
		return null
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
		const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
		if (!parts) return null

		return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
	} catch (e) {
		console.error('Error parsing server date:', e)
		return null
	}
}
