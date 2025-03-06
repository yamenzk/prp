/**
 * Set up keyboard shortcuts for the notes dialog
 * @param {Object} options - Configuration options
 * @returns {Object} Functions to setup and cleanup event listeners
 */
export const useKeyboardShortcuts = (options) => {
	const {
		isDialogVisible,
		composingNote,
		activeView,
		activeTabIndex,
		cancelCompose,
		navigateBack,
		saveNote,
		createNewNote,
		createNewTask,
		createNewJournal,
	} = options

	const handleKeyboardShortcuts = (e) => {
		// Only handle shortcuts when dialog is visible
		if (!isDialogVisible()) return

		// Escape to go back or cancel compose
		if (e.key === 'Escape') {
			if (composingNote.value) {
				e.preventDefault()
				cancelCompose()
			} else if (activeView.value !== 'home') {
				e.preventDefault()
				navigateBack()
			}
		}

		// Cmd/Ctrl + S to save when composing
		if ((e.metaKey || e.ctrlKey) && e.key === 's' && composingNote.value) {
			e.preventDefault()
			saveNote()
		}

		// Cmd/Ctrl + N to create new note
		if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !composingNote.value) {
			e.preventDefault()
			createNewNote()
		}

		// Cmd/Ctrl + T to create new task
		if ((e.metaKey || e.ctrlKey) && e.key === 't' && !composingNote.value) {
			e.preventDefault()
			createNewTask()
		}

		// Cmd/Ctrl + J to create new journal
		if ((e.metaKey || e.ctrlKey) && e.key === 'j' && !composingNote.value) {
			e.preventDefault()
			createNewJournal()
		}

		// Tab navigation in home view
		if (activeView.value === 'home' && !composingNote.value) {
			if (e.key === '1' && e.altKey) {
				e.preventDefault()
				activeTabIndex.value = 0
			} else if (e.key === '2' && e.altKey) {
				e.preventDefault()
				activeTabIndex.value = 1
			} else if (e.key === '3' && e.altKey) {
				e.preventDefault()
				activeTabIndex.value = 2
			}
		}
	}

	const setupKeyboardShortcuts = () => {
		document.addEventListener('keydown', handleKeyboardShortcuts)
	}

	const cleanupKeyboardShortcuts = () => {
		document.removeEventListener('keydown', handleKeyboardShortcuts)
	}

	return {
		setupKeyboardShortcuts,
		cleanupKeyboardShortcuts,
	}
}

/**
 * Generate keyboard shortcut help text
 * @returns {Array} Array of shortcut descriptions
 */
export const getKeyboardShortcutHelp = () => {
	return [
		{ key: 'Esc', description: 'Cancel compose or go back' },
		{ key: '⌘/Ctrl + S', description: 'Save note' },
		{ key: '⌘/Ctrl + N', description: 'Create new note' },
		{ key: '⌘/Ctrl + T', description: 'Create new task' },
		{ key: '⌘/Ctrl + J', description: 'Create new journal entry' },
		{ key: 'Alt + 1', description: 'Switch to Notes tab' },
		{ key: 'Alt + 2', description: 'Switch to Tasks tab' },
		{ key: 'Alt + 3', description: 'Switch to Journal tab' },
	]
}
