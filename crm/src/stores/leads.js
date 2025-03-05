import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useLeadStore = defineStore('leads', {
	state: () => ({
		// Store lead list resource
		leadList: null,

		// Current selected lead
		currentLead: null,
		currentLeadResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all leads data
		leads: (state) => state.leadList?.data || [],

		// Check if leads are currently loading
		isLoading: (state) => state.leadList?.list?.loading || false,

		// Check if there was an error loading leads
		hasError: (state) => !!state.leadList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.leadList?.list?.error?.message || '',

		// Check if there are more leads to load
		hasMoreLeads: (state) => state.leadList?.hasNextPage || false,
	},

	actions: {
		// Initialize the leads list resource and setup socket listeners
		initLeadList() {
			// console.log('🔍 Attempting to initialize lead list resource')
			const global = globalStore()
			// console.log('🔌 Socket status:', global.socket ? 'Available' : 'Not available')

			if (!this.leadList && global.socket) {
				// console.log('📋 Creating lead list resource with socket')
				this.leadList = createListResource(
					{
						doctype: 'PRP Lead',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_lead',
						auto: true,
						transform(data) {
							// console.log('📊 Transforming lead data', data?.length || 0)
							return data
						},
						onSuccess(data) {
							// console.log('✅ Successfully loaded leads data', data.length)
						},
						onError(error) {
							// console.error('❌ Error loading leads data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)

				// console.log('✅ Lead list resource created successfully')
			} else if (this.leadList) {
				// console.log('ℹ️ Lead list resource already exists')
			} else {
				console.warn('⚠️ Cannot initialize lead list: Socket not available')
			}
			return this.leadList
		},

		// Setup realtime listeners for our custom event
		setupRealtimeListeners(socket) {
			if (!socket) {
				console.warn('⚠️ Cannot setup realtime listeners: Socket not available')
				return
			}

			// console.log('🔌 Setting up custom realtime event listeners')

			// Listen for our custom refetch_resource event
			socket.on('prp:refetch_resource', (data) => {
				console.log('🔄 Received refetch_resource event:', data)

				if (data.cache_key === 'prp:prp_lead') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('📋 Detected list change (add/delete), reloading lead list')
						this.refetchLeads()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`📄 Detected document update for ${data.doc}`)

						// If our current lead was updated, refetch it
						if (this.currentLead && this.currentLead.name === data.doc) {
							// console.log('🔄 Current lead was updated, refetching details')
							this.refreshCurrentLead()
						}

						// Also refresh the list to show updated data
						this.refetchLeads()
					}
				}
			})

			// console.log('✅ Realtime listeners setup complete')
		},

		// Refetch leads when notified of changes
		async refetchLeads() {
			// console.log('🔄 Refetching leads due to realtime update')
			if (this.leadList) {
				try {
					await this.leadList.reload()
					// console.log('✅ Leads refetched successfully')
					return this.leads
				} catch (error) {
					console.error('❌ Error refetching leads:', error)
				}
			}
			return null
		},

		// Refresh only the current lead
		async refreshCurrentLead() {
			if (this.currentLead && this.currentLeadResource) {
				try {
					await this.currentLeadResource.get.submit()
					// console.log('✅ Current lead refreshed successfully')
					return this.currentLead
				} catch (error) {
					console.error('❌ Error refreshing current lead:', error)
				}
			}
			return null
		},

		// Fetch initial leads data
		async fetchLeads() {
			// console.log('🔄 Fetching leads')
			try {
				const leadList = this.initLeadList()
				if (leadList) {
					// console.log('📥 Loading lead list data')
					await leadList.reload()
					// console.log('✅ Lead list load complete')
				} else {
					console.error(
						'❌ Lead list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('❌ Error fetching leads:', error)
			}
		},

		// Load next page of leads
		async loadMoreLeads() {
			if (this.hasMoreLeads && this.leadList) {
				try {
					await this.leadList.next()
				} catch (error) {
					console.error('Error loading more leads:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.leadList) {
				this.leadList.update({
					filters: this.filters,
				})
				try {
					await this.leadList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.leadList) {
				this.leadList.update({
					filters: {},
				})
				try {
					await this.leadList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single lead by ID
		async fetchLead(leadId) {
			// console.log(`🔍 Fetching lead with ID: ${leadId}`)
			const global = globalStore()

			if (!global.socket) {
				console.warn('⚠️ Socket not available for fetching lead')
			}

			this.currentLeadResource = createDocumentResource(
				{
					doctype: 'PRP Lead',
					name: leadId,
					auto: true,
					onSuccess: (lead) => {
						// console.log('✅ Lead fetched successfully:', leadId)
						this.currentLead = lead
					},
					onError: (error) => {
						console.error(`Error fetching lead ${leadId}:`, error)
						this.currentLead = null
					},
				},
				global.socket,
			)

			try {
				await this.currentLeadResource.get.submit()
				return this.currentLead
			} catch (error) {
				console.error(`Error submitting fetch for lead ${leadId}:`, error)
				return null
			}
		},

		// Create a new lead
		async createLead(leadData) {
			// console.log('➕ Creating new lead')
			if (!this.leadList) {
				// console.log('🔄 Lead list not initialized, trying to initialize')
				this.initLeadList()
			}

			if (!this.leadList) {
				const errorMsg = 'Cannot create lead: Lead list not initialized'
				console.error(`❌ ${errorMsg}`)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.leadList.insert.submit(leadData)
				// console.log('✅ Lead created successfully')
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating lead:', error)
				throw error
			}
		},

		// Update a lead
		async updateLead(name, data) {
			// console.log(`🔄 Updating lead: ${name}`)
			if (!this.leadList) {
				this.initLeadList()
			}

			if (!this.leadList) {
				throw new Error(`Cannot update lead ${name}: Lead list not initialized`)
			}

			try {
				const result = await this.leadList.setValue.submit({
					name,
					...data,
				})

				// console.log(`✅ Lead ${name} updated`)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating lead ${name}:`, error)
				throw error
			}
		},

		// Delete a lead
		async deleteLead(name) {
			// console.log(`❌ Deleting lead: ${name}`)
			if (!this.leadList) {
				this.initLeadList()
			}

			if (!this.leadList) {
				throw new Error(`Cannot delete lead ${name}: Lead list not initialized`)
			}

			try {
				await this.leadList.delete.submit(name)

				// If deleted lead was the current lead, clear it
				if (this.currentLead && this.currentLead.name === name) {
					this.currentLead = null
					this.currentLeadResource = null
				}

				// console.log(`✅ Lead ${name} deleted`)
				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting lead ${name}:`, error)
				throw error
			}
		},

		// Update phonebook entries for a lead
		async updatePhonebook(leadName, phonebookEntries) {
			// console.log(`📱 Updating phonebook for lead: ${leadName}`)
			try {
				const result = await this.updateLead(leadName, {
					phonebook: phonebookEntries,
				})

				// console.log(`✅ Phonebook updated for lead: ${leadName}`)
				return result
			} catch (error) {
				console.error(`Error updating phonebook for lead ${leadName}:`, error)
				throw error
			}
		},
	},
})
