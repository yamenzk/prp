import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useDocumentStore = defineStore('documents', {
	state: () => ({
		// Store document list resource
		documentList: null,

		// Current selected document
		currentDocument: null,
		currentDocumentResource: null,

		// Filters state
		filters: {},

		// Cache for document room queries
		documentRoomCache: {},
		cacheDuration: 60000, // Cache entries valid for 1 minute
	}),

	getters: {
		// Get all documents data
		documents: (state) => state.documentList?.data || [],

		// Check if documents are currently loading
		isLoading: (state) => state.documentList?.list?.loading || false,

		// Check if there was an error loading documents
		hasError: (state) => !!state.documentList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.documentList?.list?.error?.message || '',

		// Check if there are more documents to load
		hasMoreDocuments: (state) => state.documentList?.hasNextPage || false,

		// Get expired documents
		expiredDocuments: (state) => state.documents.filter((doc) => doc.expired),

		// Get archived documents
		archivedDocuments: (state) => state.documents.filter((doc) => doc.archived),

		// Get public documents
		publicDocuments: (state) => state.documents.filter((doc) => doc.public),
	},

	actions: {
		// Initialize the documents list resource and setup socket listeners
		initDocumentList() {
			const global = globalStore()

			if (!this.documentList && global.socket) {
				this.documentList = createListResource(
					{
						doctype: 'PRP Document',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_document',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded documents data', data.length)
						},
						onError(error) {
							console.error('Error loading documents data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.documentList) {
				console.warn('Cannot initialize document list: Socket not available')
			}
			return this.documentList
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

				if (data.cache_key === 'prp:prp_document') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading document list')
						this.refetchDocuments()
						// Clear the cache when documents are updated
						this.clearDocumentRoomCache()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current document was updated, refetch it
						if (this.currentDocument && this.currentDocument.name === data.doc) {
							this.refreshCurrentDocument()
						}

						// Also refresh the list to show updated data
						this.refetchDocuments()
						// Clear the cache when documents are updated
						this.clearDocumentRoomCache()
					}
				}
			})
		},

		// Clear all cache entries
		clearDocumentRoomCache() {
			this.documentRoomCache = {}
		},

		// Refetch documents when notified of changes
		async refetchDocuments() {
			if (this.documentList) {
				try {
					await this.documentList.reload()
					return this.documents
				} catch (error) {
					console.error('Error refetching documents:', error)
				}
			}
			return null
		},

		// Refresh only the current document
		async refreshCurrentDocument() {
			if (this.currentDocument && this.currentDocumentResource) {
				try {
					await this.currentDocumentResource.get.submit()
					return this.currentDocument
				} catch (error) {
					console.error('Error refreshing current document:', error)
				}
			}
			return null
		},

		// Fetch initial documents data
		async fetchDocuments() {
			try {
				const documentList = this.initDocumentList()
				if (documentList) {
					await documentList.reload()
				} else {
					console.error(
						'Document list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('Error fetching documents:', error)
			}
		},

		// Load next page of documents
		async loadMoreDocuments() {
			if (this.hasMoreDocuments && this.documentList) {
				try {
					await this.documentList.next()
				} catch (error) {
					console.error('Error loading more documents:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.documentList) {
				this.documentList.update({
					filters: this.filters,
				})
				try {
					await this.documentList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.documentList) {
				this.documentList.update({
					filters: {},
				})
				try {
					await this.documentList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single document by ID
		async fetchDocument(documentId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching document')
			}

			this.currentDocumentResource = createDocumentResource(
				{
					doctype: 'PRP Document',
					name: documentId,
					auto: true,
					onSuccess: (document) => {
						this.currentDocument = document
					},
					onError: (error) => {
						console.error(`Error fetching document ${documentId}:`, error)
						this.currentDocument = null
					},
				},
				global.socket,
			)

			try {
				await this.currentDocumentResource.get.submit()
				return this.currentDocument
			} catch (error) {
				console.error(`Error submitting fetch for document ${documentId}:`, error)
				return null
			}
		},

		// Create a new document
		async createDocument(documentData) {
			if (!this.documentList) {
				this.initDocumentList()
			}

			if (!this.documentList) {
				const errorMsg = 'Cannot create document: Document list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.documentList.insert.submit(documentData)
				// Clear cache since documents have changed
				this.clearDocumentRoomCache()
				return result
			} catch (error) {
				console.error('Error creating document:', error)
				throw error
			}
		},

		// Update a document
		async updateDocument(name, data) {
			if (!this.documentList) {
				this.initDocumentList()
			}

			if (!this.documentList) {
				throw new Error(`Cannot update document ${name}: Document list not initialized`)
			}

			try {
				const result = await this.documentList.setValue.submit({
					name,
					...data,
				})

				// Clear cache since documents have changed
				this.clearDocumentRoomCache()
				return result
			} catch (error) {
				console.error(`Error updating document ${name}:`, error)
				throw error
			}
		},

		// Delete a document
		async deleteDocument(name) {
			if (!this.documentList) {
				this.initDocumentList()
			}

			if (!this.documentList) {
				throw new Error(`Cannot delete document ${name}: Document list not initialized`)
			}

			try {
				await this.documentList.delete.submit(name)

				// If deleted document was the current document, clear it
				if (this.currentDocument && this.currentDocument.name === name) {
					this.currentDocument = null
					this.currentDocumentResource = null
				}

				// Clear cache since documents have changed
				this.clearDocumentRoomCache()
				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting document ${name}:`, error)
				throw error
			}
		},

		// Add a document to a room (associate with a doctype/docname)
		async addDocumentToRoom(documentName, doctype, docname) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			if (!this.currentDocument) {
				throw new Error(`Cannot add document ${documentName} to room: Document not found`)
			}

			const rooms = this.currentDocument.rooms || []

			// Check if the room already exists
			const existingRoom = rooms.find(
				(room) => room.rel_doctype === doctype && room.rel_docname === docname,
			)

			if (existingRoom) {
				console.log(
					`Document ${documentName} is already associated with ${doctype}/${docname}`,
				)
				return this.currentDocument
			}

			// Add the new room
			rooms.push({
				rel_doctype: doctype,
				rel_docname: docname,
			})

			// Clear the cache for this room
			this.clearRoomCache(doctype, docname)

			// Update the document
			return this.updateDocument(documentName, { rooms })
		},

		// Remove a document from a room (disassociate from a doctype/docname)
		async removeDocumentFromRoom(documentName, doctype, docname) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			if (!this.currentDocument) {
				throw new Error(
					`Cannot remove document ${documentName} from room: Document not found`,
				)
			}

			const rooms = this.currentDocument.rooms || []

			// Filter out the room to remove
			const updatedRooms = rooms.filter(
				(room) => !(room.rel_doctype === doctype && room.rel_docname === docname),
			)

			// Only update if we actually removed something
			if (updatedRooms.length !== rooms.length) {
				// Clear the cache for this room
				this.clearRoomCache(doctype, docname)
				return this.updateDocument(documentName, { rooms: updatedRooms })
			}

			console.log(`Document ${documentName} is not associated with ${doctype}/${docname}`)
			return this.currentDocument
		},

		// Find all documents associated with a specific doctype/docname
		// In your document.js store
		// In document.js store
		async findDocumentsInRoom(doctype, docname) {
			if (!doctype || !docname) {
				console.log('Invalid parameters for findDocumentsInRoom:', { doctype, docname })
				return []
			}

			// Create a cache key from doctype and docname
			const cacheKey = `${doctype}/${docname}`

			// Check if we have a valid cached response
			const cachedData = this.documentRoomCache[cacheKey]
			if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
				return cachedData.documents
			}

			console.log(`Finding documents for ${doctype}/${docname}`)

			try {
				// Use the custom API endpoint to get documents in the room
				const response = await fetch(
					`/api/method/prp.api.get_documents_in_room?rel_doctype=${encodeURIComponent(doctype)}&rel_docname=${encodeURIComponent(docname)}`,
					{
						method: 'GET',
						headers: {
							Accept: 'application/json',
						},
					},
				)

				if (!response.ok) {
					throw new Error(`Failed to fetch documents in room: ${response.statusText}`)
				}

				const result = await response.json()
				const documents = result.message.documents || []

				console.log(
					`Found ${documents.length} documents for ${doctype}/${docname} using API`,
				)

				// Store in cache with timestamp
				this.documentRoomCache[cacheKey] = {
					documents,
					timestamp: Date.now(),
				}

				return documents
			} catch (error) {
				console.error(`Error finding documents for ${doctype}/${docname}:`, error)

				// Fallback to the original method if API fails
				if (this.documentList) {
					await this.fetchDocuments()

					// Filter documents client-side
					const documents = this.documents.filter((doc) => {
						if (!doc.rooms || !Array.isArray(doc.rooms)) {
							return false
						}

						return doc.rooms.some(
							(room) => room.rel_doctype === doctype && room.rel_docname === docname,
						)
					})

					// Even for fallback results, cache them
					this.documentRoomCache[cacheKey] = {
						documents,
						timestamp: Date.now(),
					}

					return documents
				}

				return []
			}
		},

		// Clear the cache for a specific room
		clearRoomCache(doctype, docname) {
			const cacheKey = `${doctype}/${docname}`
			if (this.documentRoomCache[cacheKey]) {
				delete this.documentRoomCache[cacheKey]
			}
		},

		// Update document status flags
		async updateDocumentStatus(documentName, statusData) {
			// statusData could include: archived, expired, public, disabled
			return this.updateDocument(documentName, statusData)
		},

		// Toggle archived status
		async toggleArchived(documentName) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			return this.updateDocument(documentName, {
				archived: !this.currentDocument.archived,
			})
		},

		// Toggle expired status
		async toggleExpired(documentName) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			return this.updateDocument(documentName, {
				expired: !this.currentDocument.expired,
			})
		},

		// Toggle public status
		async togglePublic(documentName) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			return this.updateDocument(documentName, {
				public: !this.currentDocument.public,
			})
		},

		// Check if a document is expired based on expiry_date
		checkIfExpired(documentName) {
			if (!this.currentDocument) {
				this.fetchDocument(documentName)
				return false
			}

			if (!this.currentDocument.expiry_date) {
				return false
			}

			const today = new Date()
			const expiryDate = new Date(this.currentDocument.expiry_date)

			return today > expiryDate
		},

		// Auto-update expired status based on expiry_date
		async updateExpiredStatus(documentName) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			const isExpired = this.checkIfExpired(documentName)

			// Only update if the expired status is different
			if (isExpired !== this.currentDocument.expired) {
				return this.updateDocument(documentName, { expired: isExpired })
			}

			return this.currentDocument
		},

		// Clear current document
		clearCurrentDocument() {
			this.currentDocument = null
			this.currentDocumentResource = null
		},

		// Find documents by tag
		async findDocumentsByTag(tag) {
			await this.fetchDocuments()

			return this.documents.filter((doc) => {
				if (!doc.tags) return false

				// Simple tag match check - you might want to improve this
				// to handle multiple tags properly
				return doc.tags.toLowerCase().includes(tag.toLowerCase())
			})
		},

		// Add a tag to a document
		async addTagToDocument(documentName, newTag) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			if (!this.currentDocument) {
				throw new Error(`Cannot add tag to document ${documentName}: Document not found`)
			}

			const currentTags = this.currentDocument.tags || ''
			let tagsArray = currentTags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean)

			// Add the new tag if it doesn't already exist
			if (!tagsArray.includes(newTag)) {
				tagsArray.push(newTag)

				const updatedTags = tagsArray.join(', ')
				return this.updateDocument(documentName, { tags: updatedTags })
			}

			return this.currentDocument
		},

		// Remove a tag from a document
		async removeTagFromDocument(documentName, tagToRemove) {
			if (!this.currentDocument) {
				await this.fetchDocument(documentName)
			}

			if (!this.currentDocument) {
				throw new Error(
					`Cannot remove tag from document ${documentName}: Document not found`,
				)
			}

			const currentTags = this.currentDocument.tags || ''
			let tagsArray = currentTags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean)

			// Remove the tag
			tagsArray = tagsArray.filter((tag) => tag !== tagToRemove)

			const updatedTags = tagsArray.join(', ')
			return this.updateDocument(documentName, { tags: updatedTags })
		},
	},
})
