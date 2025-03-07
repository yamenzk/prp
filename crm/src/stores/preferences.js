import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const usePreferenceStore = defineStore('preferences', {
	state: () => ({
		// Store preference list resource
		preferenceList: null,

		// Current selected preference
		currentPreference: null,
		currentPreferenceResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all preferences data
		preferences: (state) => state.preferenceList?.data || [],

		// Check if preferences are currently loading
		isLoading: (state) => state.preferenceList?.list?.loading || false,

		// Check if there was an error loading preferences
		hasError: (state) => !!state.preferenceList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.preferenceList?.list?.error?.message || '',

		// Check if there are more preferences to load
		hasMorePreferences: (state) => state.preferenceList?.hasNextPage || false,
	},

	actions: {
		// Initialize the preferences list resource and setup socket listeners
		initPreferenceList() {
			// console.log('🔍 Attempting to initialize preference list resource')
			const global = globalStore()
			// console.log('🔌 Socket status:', global.socket ? 'Available' : 'Not available')

			if (!this.preferenceList && global.socket) {
				// console.log('📋 Creating preference list resource with socket')
				this.preferenceList = createListResource(
					{
						doctype: 'PRP Preference',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_preference',
						auto: true,
						transform(data) {
							// console.log('📊 Transforming preference data', data?.length || 0)
							return data
						},
						onSuccess(data) {
							// console.log('✅ Successfully loaded preferences data', data.length)
						},
						onError(error) {
							console.error('❌ Error loading preferences data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)

				// console.log('✅ Preference list resource created successfully')
			} else if (this.preferenceList) {
				// console.log('ℹ️ Preference list resource already exists')
			} else {
				console.warn('⚠️ Cannot initialize preference list: Socket not available')
			}
			return this.preferenceList
		},

		// Setup realtime listeners for our custom event
		setupRealtimeListeners(socket) {
			if (!socket) {
				console.warn('⚠️ Cannot setup realtime listeners: Socket not available')
				return
			}

			// console.log('🔌 Setting up custom realtime event listeners for preferences')

			// Listen for our custom refetch_resource event
			socket.on('prp:refetch_resource', (data) => {
				// console.log('🔄 Received refetch_resource event:', data)

				if (data.cache_key === 'prp:prp_preference') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('📋 Detected list change (add/delete), reloading preference list',)
						this.refetchPreferences()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`📄 Detected document update for ${data.doc}`)

						// If our current preference was updated, refetch it
						if (this.currentPreference && this.currentPreference.name === data.doc) {
							// console.log('🔄 Current preference was updated, refetching details')
							this.refreshCurrentPreference()
						}

						// Also refresh the list to show updated data
						this.refetchPreferences()
					}
				}
			})

			// console.log('✅ Preference realtime listeners setup complete')
		},

		// Refetch preferences when notified of changes
		async refetchPreferences() {
			// console.log('🔄 Refetching preferences due to realtime update')
			if (this.preferenceList) {
				try {
					await this.preferenceList.reload()
					// console.log('✅ Preferences refetched successfully')
					return this.preferences
				} catch (error) {
					console.error('❌ Error refetching preferences:', error)
				}
			}
			return null
		},

		// Refresh only the current preference
		async refreshCurrentPreference() {
			if (this.currentPreference && this.currentPreferenceResource) {
				try {
					await this.currentPreferenceResource.get.submit()
					// console.log('✅ Current preference refreshed successfully')
					return this.currentPreference
				} catch (error) {
					console.error('❌ Error refreshing current preference:', error)
				}
			}
			return null
		},

		// Fetch initial preferences data
		async fetchPreferences() {
			// console.log('🔄 Fetching preferences')
			try {
				const preferenceList = this.initPreferenceList()
				if (preferenceList) {
					// console.log('📥 Loading preference list data')
					await preferenceList.reload()
					// console.log('✅ Preference list load complete')
				} else {
					console.error(
						'❌ Preference list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('❌ Error fetching preferences:', error)
			}
		},

		// Load next page of preferences
		async loadMorePreferences() {
			if (this.hasMorePreferences && this.preferenceList) {
				try {
					await this.preferenceList.next()
				} catch (error) {
					console.error('Error loading more preferences:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.preferenceList) {
				this.preferenceList.update({
					filters: this.filters,
				})
				try {
					await this.preferenceList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.preferenceList) {
				this.preferenceList.update({
					filters: {},
				})
				try {
					await this.preferenceList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single preference by ID
		async fetchPreference(preferenceId) {
			// console.log(`🔍 Fetching preference with ID: ${preferenceId}`)
			const global = globalStore()

			if (!global.socket) {
				console.warn('⚠️ Socket not available for fetching preference')
			}

			this.currentPreferenceResource = createDocumentResource(
				{
					doctype: 'PRP Preference',
					name: preferenceId,
					auto: true,
					onSuccess: (preference) => {
						// console.log('✅ Preference fetched successfully:', preferenceId)
						this.currentPreference = preference
					},
					onError: (error) => {
						console.error(`Error fetching preference ${preferenceId}:`, error)
						this.currentPreference = null
					},
				},
				global.socket,
			)

			try {
				await this.currentPreferenceResource.get.submit()
				return this.currentPreference
			} catch (error) {
				console.error(`Error submitting fetch for preference ${preferenceId}:`, error)
				return null
			}
		},

		// Create a new preference
		async createPreference(preferenceData) {
			// console.log('➕ Creating new preference')
			if (!this.preferenceList) {
				// console.log('🔄 Preference list not initialized, trying to initialize')
				this.initPreferenceList()
			}

			if (!this.preferenceList) {
				const errorMsg = 'Cannot create preference: Preference list not initialized'
				console.error(`❌ ${errorMsg}`)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.preferenceList.insert.submit(preferenceData)
				// console.log('✅ Preference created successfully')
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating preference:', error)
				throw error
			}
		},

		// Update a preference
		async updatePreference(name, data) {
			// console.log(`🔄 Updating preference: ${name}`)
			if (!this.preferenceList) {
				this.initPreferenceList()
			}

			if (!this.preferenceList) {
				throw new Error(
					`Cannot update preference ${name}: Preference list not initialized`,
				)
			}

			try {
				const result = await this.preferenceList.setValue.submit({
					name,
					...data,
				})

				// console.log(`✅ Preference ${name} updated`)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating preference ${name}:`, error)
				throw error
			}
		},

		// Delete a preference
		async deletePreference(name) {
			// console.log(`❌ Deleting preference: ${name}`)
			if (!this.preferenceList) {
				this.initPreferenceList()
			}

			if (!this.preferenceList) {
				throw new Error(
					`Cannot delete preference ${name}: Preference list not initialized`,
				)
			}

			try {
				await this.preferenceList.delete.submit(name)

				// If deleted preference was the current preference, clear it
				if (this.currentPreference && this.currentPreference.name === name) {
					this.currentPreference = null
					this.currentPreferenceResource = null
				}

				// console.log(`✅ Preference ${name} deleted`)
				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting preference ${name}:`, error)
				throw error
			}
		},

		// Toggle a boolean field
		async toggleField(name, field) {
			// console.log(`🔄 Toggling field ${field} for preference ${name}`)
			try {
				// Get the current preference to ensure we have the latest data
				const preference = await this.fetchPreference(name)

				if (!preference) {
					throw new Error(`Preference ${name} not found`)
				}

				// Toggle the boolean field
				const currentValue = preference[field] || 0
				const result = await this.updatePreference(name, {
					[field]: currentValue ? 0 : 1,
				})

				// console.log(`✅ Field ${field} toggled for preference ${name}`)
				return result
			} catch (error) {
				console.error(`Error toggling field ${field} for preference ${name}:`, error)
				throw error
			}
		},
	},
})
