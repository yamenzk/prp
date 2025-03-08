import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useListingStore = defineStore('listings', {
	state: () => ({
		// Store listing list resource
		listingList: null,

		// Current selected listing
		currentListing: null,
		currentListingResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all listings data
		listings: (state) => state.listingList?.data || [],

		// Check if listings are currently loading
		isLoading: (state) => state.listingList?.list?.loading || false,

		// Check if there was an error loading listings
		hasError: (state) => !!state.listingList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.listingList?.list?.error?.message || '',

		// Check if there are more listings to load
		hasMoreListings: (state) => state.listingList?.hasNextPage || false,
	},

	actions: {
		// Initialize the listings list resource and setup socket listeners
		initListingList() {
			const global = globalStore()

			if (!this.listingList && global.socket) {
				this.listingList = createListResource(
					{
						doctype: 'PRP Listing',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_listing',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded listings data', data.length)
						},
						onError(error) {
							console.error('Error loading listings data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.listingList) {
				console.warn('Cannot initialize listing list: Socket not available')
			}
			return this.listingList
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

				if (data.cache_key === 'prp:prp_listing') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading listing list')
						this.refetchListings()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current listing was updated, refetch it
						if (this.currentListing && this.currentListing.name === data.doc) {
							this.refreshCurrentListing()
						}

						// Also refresh the list to show updated data
						this.refetchListings()
					}
				}
			})
		},

		// Refetch listings when notified of changes
		async refetchListings() {
			if (this.listingList) {
				try {
					await this.listingList.reload()
					return this.listings
				} catch (error) {
					console.error('Error refetching listings:', error)
				}
			}
			return null
		},

		// Refresh only the current listing
		async refreshCurrentListing() {
			if (this.currentListing && this.currentListingResource) {
				try {
					await this.currentListingResource.get.submit()
					return this.currentListing
				} catch (error) {
					console.error('Error refreshing current listing:', error)
				}
			}
			return null
		},

		// Fetch initial listings data
		async fetchListings() {
			try {
				const listingList = this.initListingList()
				if (listingList) {
					await listingList.reload()
				} else {
					console.error(
						'Listing list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('Error fetching listings:', error)
			}
		},

		// Load next page of listings
		async loadMoreListings() {
			if (this.hasMoreListings && this.listingList) {
				try {
					await this.listingList.next()
				} catch (error) {
					console.error('Error loading more listings:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.listingList) {
				this.listingList.update({
					filters: this.filters,
				})
				try {
					await this.listingList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.listingList) {
				this.listingList.update({
					filters: {},
				})
				try {
					await this.listingList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single listing by ID
		async fetchListing(listingId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching listing')
			}

			this.currentListingResource = createDocumentResource(
				{
					doctype: 'PRP Listing',
					name: listingId,
					auto: true,
					onSuccess: (listing) => {
						this.currentListing = listing
					},
					onError: (error) => {
						console.error(`Error fetching listing ${listingId}:`, error)
						this.currentListing = null
					},
				},
				global.socket,
			)

			try {
				await this.currentListingResource.get.submit()
				return this.currentListing
			} catch (error) {
				console.error(`Error submitting fetch for listing ${listingId}:`, error)
				return null
			}
		},

		// Create a new listing
		async createListing(listingData) {
			if (!this.listingList) {
				this.initListingList()
			}

			if (!this.listingList) {
				const errorMsg = 'Cannot create listing: Listing list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.listingList.insert.submit(listingData)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating listing:', error)
				throw error
			}
		},

		// Update a listing
		async updateListing(name, data) {
			if (!this.listingList) {
				this.initListingList()
			}

			if (!this.listingList) {
				throw new Error(`Cannot update listing ${name}: Listing list not initialized`)
			}

			try {
				const result = await this.listingList.setValue.submit({
					name,
					...data,
				})

				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating listing ${name}:`, error)
				throw error
			}
		},

		// Delete a listing
		async deleteListing(name) {
			if (!this.listingList) {
				this.initListingList()
			}

			if (!this.listingList) {
				throw new Error(`Cannot delete listing ${name}: Listing list not initialized`)
			}

			try {
				await this.listingList.delete.submit(name)

				// If deleted listing was the current listing, clear it
				if (this.currentListing && this.currentListing.name === name) {
					this.currentListing = null
					this.currentListingResource = null
				}

				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting listing ${name}:`, error)
				throw error
			}
		},

		// Update listing availability
		async updateAvailability(listingName, availability) {
			try {
				const result = await this.updateListing(listingName, {
					availability: availability,
				})

				return result
			} catch (error) {
				console.error(`Error updating availability for listing ${listingName}:`, error)
				throw error
			}
		},

		// Update listing handover status
		async updateHandoverStatus(listingName, status) {
			try {
				const result = await this.updateListing(listingName, {
					status: status,
				})

				return result
			} catch (error) {
				console.error(`Error updating handover status for listing ${listingName}:`, error)
				throw error
			}
		},

		// Toggle secondhand options
		async toggleSecondhandOptions(listingName, enableSelling, enableRenting) {
			try {
				const result = await this.updateListing(listingName, {
					enable_secondhand_selling: enableSelling,
					enable_secondhand_renting: enableRenting,
				})

				return result
			} catch (error) {
				console.error(
					`Error updating secondhand options for listing ${listingName}:`,
					error,
				)
				throw error
			}
		},
	},
})
