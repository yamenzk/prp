import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useBuildingStore = defineStore('buildings', {
	state: () => ({
		// Store building list resource
		buildingList: null,

		// Current selected building
		currentBuilding: null,
		currentBuildingResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all buildings data
		buildings: (state) => state.buildingList?.data || [],

		// Check if buildings are currently loading
		isLoading: (state) => state.buildingList?.list?.loading || false,

		// Check if there was an error loading buildings
		hasError: (state) => !!state.buildingList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.buildingList?.list?.error?.message || '',

		// Check if there are more buildings to load
		hasMoreBuildings: (state) => state.buildingList?.hasNextPage || false,
	},

	actions: {
		// Initialize the buildings list resource and setup socket listeners
		initBuildingList() {
			const global = globalStore()

			if (!this.buildingList && global.socket) {
				this.buildingList = createListResource(
					{
						doctype: 'PRP Building',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_building',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded buildings data', data.length)
						},
						onError(error) {
							console.error('Error loading buildings data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.buildingList) {
				console.warn('Cannot initialize building list: Socket not available')
			}
			return this.buildingList
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

				if (data.cache_key === 'prp:prp_building') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading building list')
						this.refetchBuildings()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current building was updated, refetch it
						if (this.currentBuilding && this.currentBuilding.name === data.doc) {
							this.refreshCurrentBuilding()
						}

						// Also refresh the list to show updated data
						this.refetchBuildings()
					}
				}
			})
		},

		// Refetch buildings when notified of changes
		async refetchBuildings() {
			if (this.buildingList) {
				try {
					await this.buildingList.reload()
					return this.buildings
				} catch (error) {
					console.error('Error refetching buildings:', error)
				}
			}
			return null
		},

		// Refresh only the current building
		async refreshCurrentBuilding() {
			if (this.currentBuilding && this.currentBuildingResource) {
				try {
					await this.currentBuildingResource.get.submit()
					return this.currentBuilding
				} catch (error) {
					console.error('Error refreshing current building:', error)
				}
			}
			return null
		},

		// Fetch initial buildings data
		async fetchBuildings() {
			try {
				const buildingList = this.initBuildingList()
				if (buildingList) {
					await buildingList.reload()
				} else {
					console.error(
						'Building list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('Error fetching buildings:', error)
			}
		},

		// Load next page of buildings
		async loadMoreBuildings() {
			if (this.hasMoreBuildings && this.buildingList) {
				try {
					await this.buildingList.next()
				} catch (error) {
					console.error('Error loading more buildings:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.buildingList) {
				this.buildingList.update({
					filters: this.filters,
				})
				try {
					await this.buildingList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.buildingList) {
				this.buildingList.update({
					filters: {},
				})
				try {
					await this.buildingList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch buildings by project
		async fetchBuildingsByProject(projectName) {
			try {
				if (!this.buildingList) {
					this.initBuildingList()
				}

				await this.updateFilters({ project: projectName })
				return this.buildings
			} catch (error) {
				console.error(`Error fetching buildings for project ${projectName}:`, error)
				return []
			}
		},

		// Fetch a single building by ID
		async fetchBuilding(buildingId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching building')
			}

			this.currentBuildingResource = createDocumentResource(
				{
					doctype: 'PRP Building',
					name: buildingId,
					auto: true,
					onSuccess: (building) => {
						this.currentBuilding = building
					},
					onError: (error) => {
						console.error(`Error fetching building ${buildingId}:`, error)
						this.currentBuilding = null
					},
				},
				global.socket,
			)

			try {
				await this.currentBuildingResource.get.submit()
				return this.currentBuilding
			} catch (error) {
				console.error(`Error submitting fetch for building ${buildingId}:`, error)
				return null
			}
		},

		// Create a new building
		async createBuilding(buildingData) {
			if (!this.buildingList) {
				this.initBuildingList()
			}

			if (!this.buildingList) {
				const errorMsg = 'Cannot create building: Building list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.buildingList.insert.submit(buildingData)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating building:', error)
				throw error
			}
		},

		// Update a building
		async updateBuilding(name, data) {
			if (!this.buildingList) {
				this.initBuildingList()
			}

			if (!this.buildingList) {
				throw new Error(`Cannot update building ${name}: Building list not initialized`)
			}

			try {
				const result = await this.buildingList.setValue.submit({
					name,
					...data,
				})

				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating building ${name}:`, error)
				throw error
			}
		},

		// Delete a building
		async deleteBuilding(name) {
			if (!this.buildingList) {
				this.initBuildingList()
			}

			if (!this.buildingList) {
				throw new Error(`Cannot delete building ${name}: Building list not initialized`)
			}

			try {
				await this.buildingList.delete.submit(name)

				// If deleted building was the current building, clear it
				if (this.currentBuilding && this.currentBuilding.name === name) {
					this.currentBuilding = null
					this.currentBuildingResource = null
				}

				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting building ${name}:`, error)
				throw error
			}
		},

		// Update building location (lat/lng)
		async updateLocation(buildingName, lat, lng) {
			try {
				const result = await this.updateBuilding(buildingName, {
					lat: lat,
					lng: lng,
				})

				return result
			} catch (error) {
				console.error(`Error updating location for building ${buildingName}:`, error)
				throw error
			}
		},

		// Update building configuration
		async updateConfiguration(buildingName, configuration) {
			try {
				const result = await this.updateBuilding(buildingName, {
					building_configuration: configuration,
				})

				return result
			} catch (error) {
				console.error(`Error updating configuration for building ${buildingName}:`, error)
				throw error
			}
		},

		// Fetch ALL buildings without any filters
		async fetchAllBuildings() {
			try {
				if (!this.buildingList) {
					this.initBuildingList()
				}

				// First reset any existing filters
				this.filters = {}
				this.buildingList.update({
					filters: {},
					pageLength: 100, // Increase page size to get more buildings at once
				})

				await this.buildingList.reload()
				return this.buildings
			} catch (error) {
				console.error('Error fetching all buildings:', error)
				return []
			}
		},
	},
})
