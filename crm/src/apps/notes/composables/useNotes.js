import { ref, computed } from 'vue'
import { useNoteStore } from '@/stores/notes'

export function useNotes() {
	const noteStore = useNoteStore()

	// Base note collections
	const stickyNotes = computed(() =>
		noteStore.notes.filter((note) => note.sticky && !note.task && !note.journal),
	)

	const regularNotes = computed(() =>
		noteStore.notes.filter((note) => !note.sticky && !note.task && !note.journal),
	)

	// Load notes from store
	const loadNotes = async () => {
		try {
			await noteStore.fetchNotes()
			return true
		} catch (error) {
			console.error('Failed to load notes:', error)
			return false
		}
	}

	// Toggle note sticky status
	const toggleSticky = async (noteName, currentNote = null) => {
		try {
			await noteStore.toggleSticky(noteName)

			// Update current note if it's being modified
			if (currentNote && currentNote.name === noteName) {
				currentNote.sticky = !currentNote.sticky
			}

			return true
		} catch (error) {
			console.error('Failed to toggle sticky:', error)
			return false
		}
	}

	// Delete note
	const deleteNote = async (noteName) => {
		if (!noteName) return false

		try {
			await noteStore.deleteNote(noteName)
			return true
		} catch (error) {
			console.error('Failed to delete note:', error)
			return false
		}
	}

	// Duplicate note
	const duplicateNote = async (note) => {
		if (!note) return false

		try {
			// Create a new note with the same content but a different name
			const duplicateData = { ...note }
			delete duplicateData.name
			duplicateData.title = `${duplicateData.title || 'Untitled'} (Copy)`

			await noteStore.createNote(duplicateData)
			return true
		} catch (error) {
			console.error('Failed to duplicate note:', error)
			return false
		}
	}

	// Get note tags as array
	const getNoteTags = (note) => {
		if (!note || !note.tags) return []

		return typeof note.tags === 'string'
			? note.tags.split(',').filter((t) => t.trim())
			: note.tags
	}

	// Strip HTML from text
	const stripHtml = (html) => {
		if (!html) return ''
		return html.replace(/<[^>]*>/g, '').substring(0, 120)
	}

	// Format dates
	const formatDate = (dateString) => {
		if (!dateString) return ''

		try {
			const date = new Date(dateString)
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			}).format(date)
		} catch (e) {
			return dateString
		}
	}

	return {
		noteStore,
		stickyNotes,
		regularNotes,
		loadNotes,
		toggleSticky,
		deleteNote,
		duplicateNote,
		getNoteTags,
		stripHtml,
		formatDate,
	}
}
