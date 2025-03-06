// useNoteEditor.js
import { ref, computed } from 'vue'

export function useNoteEditor(initialContext = { doctype: 'User', docname: '' }) {
	// Composing state
	const composingNote = ref(false)
	const noteType = ref('note') // note, task, journal
	const showColorPicker = ref(false)

	// Draft note for composer
	const draftNote = ref({
		title: '',
		details: '',
		color: null,
		icon: null,
		sticky: false,
		task: false,
		journal: false,
		status: 'Backlog',
		priority: null,
		dueDate: null,
		rel_doctype: initialContext.doctype,
		rel_docname: initialContext.docname,
		tags: [],
	})

	// Common emoji list for icon picker
	const commonEmojis = [
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

	// Icon picker menu items
	const iconPickerItems = computed(() => {
		return [
			{
				label: 'Emojis',
				items: commonEmojis.map((emoji) => ({
					label: emoji,
					command: () => {
						draftNote.value.icon = emoji
					},
				})),
			},
			{
				label: 'Custom',
				command: () => {
					const customIcon = prompt('Enter custom icon (emoji or text):', '')
					if (customIcon) {
						draftNote.value.icon = customIcon
					}
				},
			},
		]
	})

	// Get CSS class for note type button
	const getNoteTypeClass = () => {
		if (noteType.value === 'note') {
			return '!bg-blue-100 dark:!bg-blue-900/30 !text-blue-600 dark:!text-blue-400'
		} else if (noteType.value === 'task') {
			return '!bg-green-100 dark:!bg-green-900/30 !text-green-600 dark:!text-green-400'
		} else {
			return '!bg-purple-100 dark:!bg-purple-900/30 !text-purple-600 dark:!text-purple-400'
		}
	}

	// Create new note
	const createNewNote = (
		context = { doctype: initialContext.doctype, docname: initialContext.docname },
	) => {
		// Reset draft note
		draftNote.value = {
			title: '',
			details: '',
			color: null,
			icon: '📝',
			sticky: false,
			task: false,
			journal: false,
			status: 'Backlog',
			priority: null,
			dueDate: null,
			rel_doctype: context.doctype,
			rel_docname: context.docname,
			tags: [],
		}

		noteType.value = 'note'
		composingNote.value = true
	}

	// Create new task
	const createNewTask = (
		context = { doctype: initialContext.doctype, docname: initialContext.docname },
	) => {
		// Reset draft note as a task
		draftNote.value = {
			title: '',
			details: '',
			color: null,
			icon: '✅',
			sticky: false,
			task: true,
			journal: false,
			status: 'To Do',
			priority: 'Medium',
			dueDate: new Date(),
			rel_doctype: context.doctype,
			rel_docname: context.docname,
			tags: [],
		}

		noteType.value = 'task'
		composingNote.value = true
	}

	// Create new journal
	const createNewJournal = (
		context = { doctype: initialContext.doctype, docname: initialContext.docname },
	) => {
		// Reset draft note as a journal
		draftNote.value = {
			title: '',
			details: '',
			color: null,
			icon: '📔',
			sticky: false,
			task: false,
			journal: true,
			status: 'Backlog',
			priority: null,
			dueDate: null,
			rel_doctype: context.doctype,
			rel_docname: context.docname,
			tags: [],
		}

		noteType.value = 'journal'
		composingNote.value = true
	}

	// Edit an existing note
	const editNote = (note) => {
		if (!note) return

		// Copy note to draft
		draftNote.value = { ...note }

		// Convert due date string to date object if exists
		if (note.due) {
			try {
				// Parse the date from DD-MM-YYYY HH:MM:SS format
				const parts = note.due.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
				if (parts) {
					draftNote.value.dueDate = new Date(
						parts[3],
						parts[2] - 1,
						parts[1],
						parts[4],
						parts[5],
						parts[6],
					)
				}
			} catch (e) {
				console.error('Error parsing date:', e)
				draftNote.value.dueDate = null
			}
		}

		// Convert tags string to array if needed
		if (typeof note.tags === 'string') {
			draftNote.value.tags = note.tags.split(',').filter((t) => t.trim())
		} else if (Array.isArray(note.tags)) {
			draftNote.value.tags = [...note.tags]
		} else {
			draftNote.value.tags = []
		}

		// Set note type
		if (note.task) {
			noteType.value = 'task'
		} else if (note.journal) {
			noteType.value = 'journal'
		} else {
			noteType.value = 'note'
		}

		composingNote.value = true
	}

	// Cancel composing
	const cancelCompose = () => {
		composingNote.value = false
	}

	// Toggle between note types
	const toggleNoteType = (type) => {
		noteType.value = type
		draftNote.value.task = type === 'task'
		draftNote.value.journal = type === 'journal'

		// Reset task and journal specific fields based on type
		switch (type) {
			case 'note':
				draftNote.value.status = 'Backlog'
				draftNote.value.priority = null
				draftNote.value.dueDate = null
				draftNote.value.icon = draftNote.value.icon || '📝'
				break
			case 'task':
				draftNote.value.status =
					draftNote.value.status === 'Backlog' ? 'To Do' : draftNote.value.status
				draftNote.value.priority = draftNote.value.priority || 'Medium'
				draftNote.value.dueDate = draftNote.value.dueDate || new Date()
				draftNote.value.icon = draftNote.value.icon || '✅'
				break
			case 'journal':
				draftNote.value.status = 'Backlog'
				draftNote.value.priority = null
				draftNote.value.dueDate = null
				draftNote.value.icon = draftNote.value.icon || '📔'
				break
		}
	}

	// Update tags
	const updateTags = (newTags) => {
		// Remove any empty tags and trim whitespace
		draftNote.value.tags = newTags.filter((tag) => tag.trim()).map((tag) => tag.trim())
	}

	// Save note
	const saveNote = async (noteStore) => {
		try {
			// Set type flags based on noteType
			draftNote.value.task = noteType.value === 'task'
			draftNote.value.journal = noteType.value === 'journal'

			// Format the due date correctly for the server
			let formattedData = { ...draftNote.value }
			delete formattedData.dueDate

			if (draftNote.value.dueDate) {
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
				const parts = formatter.formatToParts(draftNote.value.dueDate)
				const dateObj = {}

				parts.forEach((part) => {
					dateObj[part.type] = part.value
				})

				formattedData.due = `${dateObj.day}-${dateObj.month}-${dateObj.year} ${dateObj.hour}:${dateObj.minute}:${dateObj.second}`
			}

			// Convert tags array to string if needed
			if (Array.isArray(formattedData.tags)) {
				formattedData.tags = formattedData.tags.join(',')
			}

			if (draftNote.value.name) {
				// Update existing note
				await noteStore.updateNote(draftNote.value.name, formattedData)
			} else {
				// Create new note
				await noteStore.createNote(formattedData)
			}

			composingNote.value = false
			return true
		} catch (error) {
			console.error('Failed to save note:', error)
			return false
		}
	}

	return {
		composingNote,
		noteType,
		draftNote,
		showColorPicker,
		commonEmojis,
		iconPickerItems,
		getNoteTypeClass,
		createNewNote,
		createNewTask,
		createNewJournal,
		editNote,
		cancelCompose,
		toggleNoteType,
		updateTags,
		saveNote,
	}
}
