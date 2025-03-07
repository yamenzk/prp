import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useVersionStore = defineStore('versions', {
	state: () => ({
		// Store versions list resource
		versionList: null,

		// Current selected version
		currentVersion: null,
		currentVersionResource: null,

		// Timeline events
		timelineEvents: [],

		// Reference document info
		refDoctype: null,
		refDocname: null,
		refDocument: null,
		refDocumentResource: null,

		// Loading states
		isTimelineLoading: false,
	}),

	getters: {
		// Get all versions data
		versions: (state) => state.versionList?.data || [],

		// Check if versions are currently loading
		isLoading: (state) => state.versionList?.list?.loading || false,

		// Check if there was an error loading versions
		hasError: (state) => !!state.versionList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.versionList?.list?.error?.message || '',

		// Formatted timeline events for PrimeVue Timeline component
		formattedTimelineEvents: (state) =>
			state.timelineEvents.map((event) => ({
				date: event.date,
				status: event.content,
				icon: event.icon || 'pi pi-calendar',
				color: event.color || null,
				user: event.user,
			})),
	},

	actions: {
		// Initialize the versions list resource
		initVersionList() {
			const global = globalStore()

			if (!this.versionList && global.socket) {
				this.versionList = createListResource(
					{
						doctype: 'Version',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 50,
						cache: 'prp:version',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded versions data', data.length)
						},
						onError(error) {
							console.error('Error loading versions data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for realtime updates
				this.setupRealtimeListeners(global.socket)
			} else if (!this.versionList) {
				console.warn('Cannot initialize version list: Socket not available')
			}

			return this.versionList
		},

		// Setup realtime listeners
		setupRealtimeListeners(socket) {
			if (!socket) {
				console.warn('Cannot setup realtime listeners: Socket not available')
				return
			}

			socket.on('prp:refetch_resource', (data) => {
				if (data.cache_key === 'prp:version') {
					if (data.event === 'list_update' || data.event === 'doc_update') {
						this.refetchVersions()

						// If we're tracking a document, refresh its timeline
						if (this.refDoctype && this.refDocname) {
							this.loadDocumentTimeline(this.refDoctype, this.refDocname)
						}
					}
				}
			})
		},

		// Refetch versions when notified of changes
		async refetchVersions() {
			if (this.versionList) {
				try {
					await this.versionList.reload()
					return this.versions
				} catch (error) {
					console.error('Error refetching versions:', error)
				}
			}
			return null
		},

		// Fetch a specific document's version history
		async fetchDocumentVersions(doctype, docname) {
			this.refDoctype = doctype
			this.refDocname = docname

			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching versions')
				return []
			}

			if (!this.versionList) {
				this.initVersionList()
			}

			if (this.versionList) {
				this.versionList.update({
					filters: {
						ref_doctype: doctype,
						docname: docname,
					},
				})

				try {
					await this.versionList.reload()
					return this.versions
				} catch (error) {
					console.error(`Error fetching versions for ${doctype}/${docname}:`, error)
					return []
				}
			}

			return []
		},

		// Parse version data to extract changes
		parseVersionData(versionData) {
			try {
				if (typeof versionData === 'string') {
					versionData = JSON.parse(versionData)
				}

				const changes = {
					added: versionData.added || [],
					changed: versionData.changed || [],
					removed: versionData.removed || [],
					rowChanged: versionData.row_changed || [],
				}

				return changes
			} catch (error) {
				console.error('Error parsing version data:', error)
				return {
					added: [],
					changed: [],
					removed: [],
					rowChanged: [],
				}
			}
		},

		// Format changes into human-readable text
		formatChanges(changes) {
			const formattedChanges = []

			// Handle field changes
			if (changes.changed.length > 0) {
				changes.changed.forEach((change) => {
					const [fieldName, oldValue, newValue] = change
					formattedChanges.push(
						`Changed ${fieldName} from "${oldValue}" to "${newValue}"`,
					)
				})
			}

			// Handle added rows in child tables
			if (changes.added.length > 0) {
				changes.added.forEach((addition) => {
					const [tableName, rowData] = addition
					const rowDescription = this.getRowDescription(rowData)
					formattedChanges.push(`Added a new ${tableName} entry: ${rowDescription}`)
				})
			}

			// Handle removed rows
			if (changes.removed.length > 0) {
				changes.removed.forEach((removal) => {
					const [tableName, rowData] = removal
					const rowDescription = this.getRowDescription(rowData)
					formattedChanges.push(`Removed ${tableName} entry: ${rowDescription}`)
				})
			}

			// Handle row changes
			if (changes.rowChanged.length > 0) {
				changes.rowChanged.forEach((rowChange) => {
					// Handle row changes format based on your data structure
					formattedChanges.push(`Updated a row in a child table`)
				})
			}

			return formattedChanges
		},

		// Get a readable description of a row
		getRowDescription(rowData) {
			if (!rowData) return 'Unknown'

			// Try to find meaningful fields to display
			const identifierFields = ['name', 'title', 'type', 'value', 'description']

			for (const field of identifierFields) {
				if (rowData[field]) {
					return `${field}: ${rowData[field]}`
				}
			}

			// Fallback to showing one or two data points
			const entries = Object.entries(rowData).filter(
				([key]) =>
					!key.startsWith('__') &&
					![
						'creation',
						'modified',
						'modified_by',
						'owner',
						'docstatus',
						'idx',
						'doctype',
					].includes(key),
			)

			if (entries.length > 0) {
				return entries
					.slice(0, 2)
					.map(([key, value]) => `${key}: ${value}`)
					.join(', ')
			}

			return `ID: ${rowData.name || 'New'}`
		},

		// Fetch the reference document to get creation info
		async fetchReferenceDocument(doctype, docname) {
			try {
				const global = globalStore()
				if (!global.socket) {
					console.warn('Socket not available for fetching reference document')
					return null
				}

				// Use createListResource instead of createDocumentResource
				const refDocListResource = createListResource(
					{
						doctype: doctype,
						fields: ['name', 'creation', 'owner'], // Only fetch what we need
						filters: { name: docname }, // Filter to get exactly one document
						pageLength: 1, // We only need one record
						auto: false, // Don't fetch automatically, we'll do it manually
					},
					global.socket,
				)

				// Fetch the data
				await refDocListResource.reload()

				// Get the document from the response
				const docs = refDocListResource.data || []

				if (docs.length > 0) {
					return docs[0] // Return the first (and should be only) document
				}

				console.warn(`Document ${doctype}/${docname} not found`)
				return null
			} catch (error) {
				console.error(`Error fetching reference document ${doctype}/${docname}:`, error)
				return null
			}
		},

		// Load a document's complete timeline including creation event and all changes
		async loadDocumentTimeline(doctype, docname) {
			this.isTimelineLoading = true
			this.timelineEvents = []

			try {
				// Fetch the reference document to get creation info
				const doc = await this.fetchReferenceDocument(doctype, docname)
				if (doc) {
					const creationDate = new Date(doc.creation)
					this.timelineEvents.push({
						date: this.formatDate(creationDate),
						content: `Created ${doctype}`,
						icon: 'pi pi-plus-circle',
						color: '#171717',
						user: doc.owner,
						timestamp: creationDate.getTime(),
					})
				}

				// Fetch all versions for this document
				const versions = await this.fetchDocumentVersions(doctype, docname)

				// Process each version into timeline events
				for (const version of versions) {
					const changes = this.parseVersionData(version.data)
					const formattedChanges = this.formatChanges(changes)

					if (formattedChanges.length > 0) {
						const versionDate = new Date(version.creation)

						// Create a timeline event for each change
						formattedChanges.forEach((change) => {
							this.timelineEvents.push({
								date: this.formatDate(versionDate),
								content: change,
								icon: this.getChangeIcon(changes),
								color: this.getChangeColor(changes),
								user: version.owner,
								timestamp: versionDate.getTime(),
							})
						})
					}
				}

				// Sort timeline events by date (newest first)
				this.timelineEvents.sort((a, b) => b.timestamp - a.timestamp)

				return this.timelineEvents
			} catch (error) {
				console.error(`Error loading timeline for ${doctype}/${docname}:`, error)
				return []
			} finally {
				this.isTimelineLoading = false
			}
		},

		// New function in VersionStore
		async loadRelatedDocumentsTimeline(mainDoctype, mainDocname, relatedDoctypes) {
			// relatedDoctypes is an array of objects like:
			// [{ doctype: 'PRP Preference', linkField: 'lead', labelField: 'type' }]

			// First load the main document's timeline
			await this.loadDocumentTimeline(mainDoctype, mainDocname)

			// For each related doctype
			for (const related of relatedDoctypes) {
				// Fetch all related documents
				const relatedDocs = await this.fetchRelatedDocuments(
					related.doctype,
					related.linkField,
					mainDocname,
				)

				// For each related document, load its timeline and merge it
				for (const doc of relatedDocs) {
					const relatedEvents = await this.loadDocumentTimeline(
						related.doctype,
						doc.name,
						false, // Don't reset existing timeline
					)

					// Add context to each event to show it's from a related document
					const contextualizedEvents = relatedEvents.map((event) => ({
						...event,
						content: `[${related.doctype}: ${doc[related.labelField] || doc.name}] ${event.content}`,
						relatedDoc: doc.name,
						relatedDoctype: related.doctype,
					}))

					// Add these events to the main timeline
					this.timelineEvents = [...this.timelineEvents, ...contextualizedEvents]
				}
			}

			// Re-sort the combined timeline
			this.timelineEvents.sort((a, b) => b.timestamp - a.timestamp)

			return this.timelineEvents
		},

		// Helper function to fetch related documents
		async fetchRelatedDocuments(doctype, linkField, parentValue) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching related documents')
				return []
			}

			try {
				const relatedResource = createListResource(
					{
						doctype: doctype,
						fields: ['*'],
						filters: {
							[linkField]: parentValue,
						},
						orderBy: 'creation desc',
						pageLength: 100,
					},
					global.socket,
				)

				await relatedResource.reload()
				return relatedResource.data || []
			} catch (error) {
				console.error(`Error fetching related ${doctype} documents:`, error)
				return []
			}
		},

		// Format date for display
		formatDate(date) {
			if (!(date instanceof Date)) {
				date = new Date(date)
			}

			return date.toLocaleString()
		},

		// Get appropriate icon based on change type
		getChangeIcon(changes) {
			if (changes.added.length > 0) return 'pi pi-plus'
			if (changes.removed.length > 0) return 'pi pi-minus'
			if (changes.changed.length > 0) return 'pi pi-pencil'
			return 'pi pi-sync'
		},

		// Get appropriate color based on change type
		getChangeColor(changes) {
			if (changes.added.length > 0) return '#171717' // Green
			if (changes.removed.length > 0) return '#171717' // Red
			if (changes.changed.length > 0) return '#171717' // Orange
			return '#9E9E9E' // Grey
		},
	},
})
