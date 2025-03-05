import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useNoteStore = defineStore('notes', {
	state: () => ({
		// Store note list resource
		noteList: null,

		// Current selected note
		currentNote: null,
		currentNoteResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all notes data
		notes: (state) => state.noteList?.data || [],

		// Check if notes are currently loading
		isLoading: (state) => state.noteList?.list?.loading || false,

		// Check if there was an error loading notes
		hasError: (state) => !!state.noteList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.noteList?.list?.error?.message || '',

		// Check if there are more notes to load
		hasMoreNotes: (state) => state.noteList?.hasNextPage || false,

		// Get sticky notes (pinned notes)
		stickyNotes: (state) => state.notes.filter((note) => note.sticky),

		// Get task notes
		taskNotes: (state) => state.notes.filter((note) => note.task),

		// Get journal notes
		journalNotes: (state) => state.notes.filter((note) => note.journal),

		// Get notes by status
		notesByStatus: (state) => (status) => state.notes.filter((note) => note.status === status),

		// Get notes by priority
		notesByPriority: (state) => (priority) =>
			state.notes.filter((note) => note.priority === priority),

		// Get notes by related document
		notesByRelatedDoc: (state) => (doctype, docname) =>
			state.notes.filter(
				(note) => note.rel_doctype === doctype && note.rel_docname === docname,
			),
	},

	actions: {
		// Initialize the notes list resource and setup socket listeners
		initNoteList() {
			const global = globalStore()

			if (!this.noteList && global.socket) {
				this.noteList = createListResource(
					{
						doctype: 'PRP Note',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_note',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// Success handler
						},
						onError(error) {
							console.error('Error loading notes data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.noteList) {
				console.warn('Cannot initialize note list: Socket not available')
			}
			return this.noteList
		},

		// Setup realtime listeners for our custom event
		setupRealtimeListeners(socket) {
			if (!socket) {
				console.warn('Cannot setup realtime listeners: Socket not available')
				return
			}

			// Listen for our custom refetch_resource event
			socket.on('prp:refetch_resource', (data) => {
				console.log('Received refetch_resource event:', data)

				if (data.cache_key === 'prp:prp_note') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading note list')
						this.refetchNotes()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current note was updated, refetch it
						if (this.currentNote && this.currentNote.name === data.doc) {
							this.refreshCurrentNote()
						}

						// Also refresh the list to show updated data
						this.refetchNotes()
					}
				}
			})
		},

		// Refetch notes when notified of changes
		async refetchNotes() {
			if (this.noteList) {
				try {
					await this.noteList.reload()
					return this.notes
				} catch (error) {
					console.error('Error refetching notes:', error)
				}
			}
			return null
		},

		// Refresh only the current note
		async refreshCurrentNote() {
			if (this.currentNote && this.currentNoteResource) {
				try {
					await this.currentNoteResource.get.submit()
					return this.currentNote
				} catch (error) {
					console.error('Error refreshing current note:', error)
				}
			}
			return null
		},

		// Fetch initial notes data
		async fetchNotes() {
			try {
				const noteList = this.initNoteList()
				if (noteList) {
					await noteList.reload()
				} else {
					console.error('Note list not initialized yet. Socket might not be available.')
				}
			} catch (error) {
				console.error('Error fetching notes:', error)
			}
		},

		// Load next page of notes
		async loadMoreNotes() {
			if (this.hasMoreNotes && this.noteList) {
				try {
					await this.noteList.next()
				} catch (error) {
					console.error('Error loading more notes:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.noteList) {
				this.noteList.update({
					filters: this.filters,
				})
				try {
					await this.noteList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.noteList) {
				this.noteList.update({
					filters: {},
				})
				try {
					await this.noteList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single note by ID
		async fetchNote(noteId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching note')
			}

			this.currentNoteResource = createDocumentResource(
				{
					doctype: 'PRP Note',
					name: noteId,
					auto: true,
					onSuccess: (note) => {
						this.currentNote = note
					},
					onError: (error) => {
						console.error(`Error fetching note ${noteId}:`, error)
						this.currentNote = null
					},
				},
				global.socket,
			)

			try {
				await this.currentNoteResource.get.submit()
				return this.currentNote
			} catch (error) {
				console.error(`Error submitting fetch for note ${noteId}:`, error)
				return null
			}
		},

		// Create a new note
		async createNote(noteData) {
			if (!this.noteList) {
				this.initNoteList()
			}

			if (!this.noteList) {
				const errorMsg = 'Cannot create note: Note list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.noteList.insert.submit(noteData)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating note:', error)
				throw error
			}
		},

		// Update a note
		async updateNote(name, data) {
			if (!this.noteList) {
				this.initNoteList()
			}

			if (!this.noteList) {
				throw new Error(`Cannot update note ${name}: Note list not initialized`)
			}

			try {
				const result = await this.noteList.setValue.submit({
					name,
					...data,
				})

				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating note ${name}:`, error)
				throw error
			}
		},

		// Delete a note
		async deleteNote(name) {
			if (!this.noteList) {
				this.initNoteList()
			}

			if (!this.noteList) {
				throw new Error(`Cannot delete note ${name}: Note list not initialized`)
			}

			try {
				await this.noteList.delete.submit(name)

				// If deleted note was the current note, clear it
				if (this.currentNote && this.currentNote.name === name) {
					this.currentNote = null
					this.currentNoteResource = null
				}

				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting note ${name}:`, error)
				throw error
			}
		},

		// Toggle sticky status
		async toggleSticky(name) {
			try {
				const note = this.notes.find((n) => n.name === name)
				if (note) {
					await this.updateNote(name, { sticky: !note.sticky })
				}
			} catch (error) {
				console.error(`Error toggling sticky for note ${name}:`, error)
				throw error
			}
		},

		// Update note status
		async updateStatus(name, status) {
			try {
				await this.updateNote(name, { status })
			} catch (error) {
				console.error(`Error updating status for note ${name}:`, error)
				throw error
			}
		},

		// Update note priority
		async updatePriority(name, priority) {
			try {
				await this.updateNote(name, { priority })
			} catch (error) {
				console.error(`Error updating priority for note ${name}:`, error)
				throw error
			}
		},

		// Convert note to task
		async convertToTask(name) {
			try {
				// Get current note
				const note = this.notes.find((n) => n.name === name)
				if (note) {
					// Set task flag and default due date if not present
					const updates = {
						task: true,
						status: note.status === 'Backlog' ? 'To Do' : note.status,
					}

					// Set due date if not already set
					if (!note.due) {
						// Set due date to tomorrow by default
						const tomorrow = new Date()
						tomorrow.setDate(tomorrow.getDate() + 1)
						updates.due = tomorrow.toISOString().split('.')[0]
					}

					await this.updateNote(name, updates)
				}
			} catch (error) {
				console.error(`Error converting note to task ${name}:`, error)
				throw error
			}
		},

		// Link note to a document
		async linkToDocument(name, doctype, docname) {
			try {
				await this.updateNote(name, {
					rel_doctype: doctype,
					rel_docname: docname,
				})
			} catch (error) {
				console.error(`Error linking note ${name}:`, error)
				throw error
			}
		},
	},
})
