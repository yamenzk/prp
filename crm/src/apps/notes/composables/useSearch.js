import { ref, computed, watch } from 'vue'

export function useSearch(notes, hideCompleted) {
	const searchQuery = ref('')
	const viewMode = ref('list') // list or grid

	// Apply search filter to notes
	const filterNotesBySearch = (notesArray) => {
		if (!searchQuery.value) return notesArray

		const query = searchQuery.value.toLowerCase()

		return notesArray.filter(
			(note) =>
				(note.title && note.title.toLowerCase().includes(query)) ||
				(note.details && stripHtml(note.details).toLowerCase().includes(query)) ||
				(note.tags && tagsIncludeQuery(note.tags, query)),
		)
	}

	// Check if tags include search query
	const tagsIncludeQuery = (tags, query) => {
		if (typeof tags === 'string') {
			return tags.toLowerCase().includes(query)
		}

		if (Array.isArray(tags)) {
			return tags.some((tag) => tag.toLowerCase().includes(query))
		}

		return false
	}

	// Strip HTML from text
	const stripHtml = (html) => {
		if (!html) return ''
		return html.replace(/<[^>]*>/g, '').substring(0, 120)
	}

	// Apply all filters (search + hide completed) to regular notes
	const filteredNotes = computed(() => {
		let filtered = filterNotesBySearch(notes.value)

		// Hide completed if enabled
		if (hideCompleted.value) {
			filtered = filtered.filter(
				(note) => note.status !== 'Completed' && note.status !== 'Cancelled',
			)
		}

		return filtered
	})

	return {
		searchQuery,
		viewMode,
		filteredNotes,
		filterNotesBySearch,
		stripHtml,
	}
}
