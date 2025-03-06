import { computed } from 'vue'
import { globalStore } from '@/stores/global'

export function useTagsAndContexts(noteStore) {
	// Auto-generated rooms based on notes
	const autoRooms = computed(() => {
		// Get unique doctype/docname combinations
		const uniqueContexts = new Map()

		// Always include user's own room
		if (globalStore.user?.name) {
			uniqueContexts.set('User_' + globalStore.user.name, {
				doctype: 'User',
				docname: globalStore.user.name,
			})
		}

		// Add all contexts from existing notes
		noteStore.notes.forEach((note) => {
			if (note.rel_doctype && note.rel_docname) {
				const key = `${note.rel_doctype}_${note.rel_docname}`
				if (!uniqueContexts.has(key)) {
					uniqueContexts.set(key, {
						doctype: note.rel_doctype,
						docname: note.rel_docname,
					})
				}
			}
		})

		// Convert to array and sort by doctype
		return Array.from(uniqueContexts.values()).sort((a, b) => {
			if (a.doctype === 'User' && a.docname === globalStore.user?.name) return -1
			if (b.doctype === 'User' && b.docname === globalStore.user?.name) return 1
			return a.doctype.localeCompare(b.doctype) || a.docname.localeCompare(b.docname)
		})
	})

	// Popular tags extracted from notes
	const popularTags = computed(() => {
		const tagMap = new Map()

		// Extract tags from note content and tags field
		noteStore.notes.forEach((note) => {
			// Process tags field if exists
			if (note.tags) {
				const tagsList =
					typeof note.tags === 'string'
						? note.tags.split(',').filter((t) => t.trim())
						: note.tags

				tagsList.forEach((tag) => {
					if (tagMap.has(tag)) {
						tagMap.set(tag, tagMap.get(tag) + 1)
					} else {
						tagMap.set(tag, 1)
					}
				})
			}

			// Also look for hashtags in content
			const content = note.details || ''
			const tagMatches = content.match(/#[a-zA-Z0-9_]+/g) || []

			tagMatches.forEach((tag) => {
				const tagName = tag.substring(1)
				if (tagMap.has(tagName)) {
					tagMap.set(tagName, tagMap.get(tagName) + 1)
				} else {
					tagMap.set(tagName, 1)
				}
			})
		})

		// Convert to array and sort by frequency
		return Array.from(tagMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
			.map(([name, count]) => {
				// Generate a pseudo-random color based on the tag name
				const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
				const hue = hash % 360
				const color = `hsl(${hue}, 70%, 50%)`

				return { name, count, color }
			})
	})

	// Check if a context is active
	const isActiveContext = (context, currentContext, activeView) => {
		return (
			context.doctype === currentContext.doctype &&
			context.docname === currentContext.docname &&
			activeView === 'room'
		)
	}

	// Get the color for a context type
	const getContextColor = (doctype) => {
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

	// Get the icon for a context type
	const getContextFeatherIcon = (doctype) => {
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

	// Room filter options
	const roomFilterOptions = [
		{ label: 'All', value: 'all' },
		{ label: 'Notes', value: 'notes' },
		{ label: 'Tasks', value: 'tasks' },
		{ label: 'Journals', value: 'journals' },
	]

	return {
		autoRooms,
		popularTags,
		isActiveContext,
		getContextColor,
		getContextFeatherIcon,
		roomFilterOptions,
	}
}
