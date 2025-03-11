// composables/useFields.js
import { ref, computed } from 'vue'
import { createListResource } from 'frappe-ui'

export function useFields() {
	// Field type definitions
	const fieldTypes = {
		text: {
			component: 'InputText',
			props: { class: 'w-full' },
			displayFn: (value) => String(value || ''),
		},
		textarea: {
			component: 'Textarea',
			props: { rows: 3, autoResize: true, class: 'w-full' },
			displayFn: (value) => String(value || ''),
		},
		number: {
			component: 'InputNumber',
			props: { class: 'w-full' },
			displayFn: (value) => String(value || ''),
		},
		int: {
			component: 'InputNumber',
			props: { class: 'w-full' },
			displayFn: (value) => String(value || ''),
		},
		currency: {
			component: 'InputNumber',
			props: { mode: 'currency', currency: 'AED', locale: 'en-AE', class: 'w-full' },
			displayFn: (value) => formatCurrency(value),
		},
		date: {
			component: 'DatePicker',
			props: { class: 'w-full' },
			displayFn: (value) => formatDate(value),
		},
		select: {
			component: 'Dropdown',
			props: { class: 'w-full' },
			displayFn: (value) => String(value || ''),
		},
		status: {
			component: 'Dropdown',
			props: { class: 'w-full' },
			displayFn: (value) => String(value || ''),
			tagSeverity: getTagSeverity,
		},
		boolean: {
			component: 'Checkbox',
			props: { binary: true },
			displayFn: (value) => (value ? 'Yes' : 'No'),
		},
		link: {
			component: 'Dropdown',
			props: { class: 'w-full', filter: true, optionLabel: 'label', optionValue: 'value' },
			displayFn: (value) => String(value || ''),
			requiresOptions: true,
		},
	}

	// Cache for link field options
	const linkOptionsCache = ref({})

	// Fetch options for link fields
	const fetchLinkOptions = async (doctype, fieldName) => {
		if (!doctype) return []

		// Check if already in cache
		const cacheKey = `${doctype}:${fieldName}`
		if (linkOptionsCache.value[cacheKey]) {
			return linkOptionsCache.value[cacheKey]
		}

		try {
			// Create resource to fetch options
			const resource = createListResource({
				doctype: doctype,
				fields: ['name'],
				pageLength: 50,
				orderBy: 'name asc',
				auto: true, // Make sure auto is set to true
			})

			// Wait for fetch to complete
			await new Promise((resolve) => {
				// Set up a watcher for the resource loading state
				const checkData = () => {
					if (!resource.list?.loading && resource.data) {
						resolve()
					} else if (resource.list?.error) {
						console.error(`Error loading options for ${doctype}:`, resource.list.error)
						resolve()
					} else {
						setTimeout(checkData, 100)
					}
				}
				checkData()
			})

			// Process data safely
			const data = resource.data || []
			const options = Array.isArray(data)
				? data.map((item) => ({
						value: item.name,
						label: item.full_name || item.name,
					}))
				: []

			// Store in cache
			linkOptionsCache.value[cacheKey] = options
			return options
		} catch (error) {
			console.error(`Error fetching options for ${doctype}:`, error)
			return []
		}
	}

	// Validate a field value based on validation rules
	const validateField = (value, validation) => {
		if (!validation) return true

		if (typeof validation === 'function') {
			const result = validation(value)
			return result === true ? true : result || 'Invalid value'
		}

		if (typeof validation === 'string') {
			// Simple required validation
			if (validation === 'required' && !value) {
				return 'This field is required'
			}
			return true
		}

		if (typeof validation === 'object') {
			// Handle validation object with rules
			if (validation.required && !value) {
				return validation.message || 'This field is required'
			}

			if (validation.pattern && value) {
				const pattern = new RegExp(validation.pattern)
				if (!pattern.test(value)) {
					return validation.message || 'Invalid format'
				}
			}

			if (validation.minLength && value && value.length < validation.minLength) {
				return validation.message || `Minimum length is ${validation.minLength}`
			}

			if (validation.maxLength && value && value.length > validation.maxLength) {
				return validation.message || `Maximum length is ${validation.maxLength}`
			}

			if (validation.min !== undefined && value < validation.min) {
				return validation.message || `Minimum value is ${validation.min}`
			}

			if (validation.max !== undefined && value > validation.max) {
				return validation.message || `Maximum value is ${validation.max}`
			}

			// Custom validation function within the object
			if (validation.custom && typeof validation.custom === 'function') {
				const result = validation.custom(value)
				return result === true ? true : result || validation.message || 'Invalid value'
			}
		}

		return true
	}

	// Helper functions
	function formatCurrency(value) {
		if (value === null || value === undefined || value === '') return ''
		return new Intl.NumberFormat('en-AE', {
			style: 'currency',
			currency: 'AED',
			minimumFractionDigits: 2,
		}).format(value)
	}

	function formatDate(value) {
		if (!value) return ''
		try {
			return new Date(value).toLocaleDateString()
		} catch (e) {
			return String(value)
		}
	}

	function getTagSeverity(status) {
		const statusMap = {
			New: 'info',
			Contacted: 'info',
			Qualified: 'success',
			Proposal: 'warning',
			Negotiation: 'warning',
			Closed: 'success',
			Lost: 'danger',
			Inactive: 'secondary',
		}
		return statusMap[status] || 'info'
	}

	function isEmoji(str) {
		const emojiRegex = /[\p{Emoji}]/u
		return emojiRegex.test(str)
	}

	return {
		fieldTypes,
		fetchLinkOptions,
		validateField,
		formatCurrency,
		formatDate,
		getTagSeverity,
		isEmoji,
	}
}
