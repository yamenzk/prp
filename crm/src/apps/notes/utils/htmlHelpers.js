/**
 * Strip HTML tags from text
 * @param {string} html - HTML content
 * @param {number} maxLength - Maximum length of returned text
 * @returns {string} Plain text without HTML tags
 */
export const stripHtml = (html, maxLength = 120) => {
	if (!html) return ''
	return html.replace(/<[^>]*>/g, '').substring(0, maxLength)
}

/**
 * Generate a random hex color
 * @returns {string} Hex color code
 */
export const generateRandomColor = () => {
	return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Generate a color based on a string (consistent for same input)
 * @param {string} str - Input string
 * @returns {string} HSL color string
 */
export const stringToColor = (str) => {
	if (!str) return 'hsl(0, 0%, 80%)'

	// Hash the string to get a consistent number
	const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
	const hue = hash % 360

	return `hsl(${hue}, 70%, 50%)`
}

/**
 * Get contrasting text color (black or white) for a background color
 * @param {string} color - Background color in hex format
 * @returns {string} 'black' or 'white'
 */
export const getContrastColor = (color) => {
	// Remove '#' if present
	const hex = color.replace('#', '')

	// Convert to RGB
	const r = parseInt(hex.substr(0, 2), 16)
	const g = parseInt(hex.substr(2, 2), 16)
	const b = parseInt(hex.substr(4, 2), 16)

	// Calculate luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

	// Return black for bright backgrounds, white for dark
	return luminance > 0.5 ? 'black' : 'white'
}

/**
 * Safe HTML - Creates a sanitized version of HTML string
 * @param {string} html - HTML content
 * @returns {string} Sanitized HTML
 */
export const safeHtml = (html) => {
	if (!html) return ''

	// Less restrictive sanitization approach
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/on\w+="[^"]*"/g, '')
		.replace(/on\w+='[^']*'/g, '')
}