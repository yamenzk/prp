import { defineStore } from 'pinia'
import { createListResource, createDocumentResource, call } from 'frappe-ui'
import { globalStore } from './global'

export const useTerritoryStore = defineStore('territories', {
	state: () => ({
		// Store territory list resource
		territoryList: null,

		// Current selected territory
		currentTerritory: null,
		currentTerritoryResource: null,

		// Filters state
		filters: {},

		// Store for potential phases detected by the backend
		potentialPhases: [],
	}),

	getters: {
		// Get all territories data
		territories: (state) => state.territoryList?.data || [],

		// Check if territories are currently loading
		isLoading: (state) => state.territoryList?.list?.loading || false,

		// Check if there was an error loading territories
		hasError: (state) => !!state.territoryList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.territoryList?.list?.error?.message || '',

		// Check if there are more territories to load
		hasMoreTerritories: (state) => state.territoryList?.hasNextPage || false,

		// Get only project territories
		projectTerritories: (state) =>
			state.territoryList?.data?.filter((t) => t.is_project) || [],

		// Get only phase territories
		phaseTerritories: (state) => state.territoryList?.data?.filter((t) => t.is_phase) || [],

		// Get only custom territories
		customTerritories: (state) => state.territoryList?.data?.filter((t) => t.is_custom) || [],

		// Get territories with GeoJSON data
		territoriesWithGeometry: (state) => state.territoryList?.data?.filter((t) => t.geo) || [],
	},

	actions: {
		// Initialize the territories list resource and setup socket listeners
		initTerritoryList() {
			const global = globalStore()

			if (!this.territoryList && global.socket) {
				this.territoryList = createListResource(
					{
						doctype: 'PRP Territory',
						fields: ['*'],
						orderBy: 'name_en asc',
						start: 0,
						pageLength: 50,
						cache: 'prp:prp_territory',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded territories data', data.length)
						},
						onError(error) {
							console.error('Error loading territories data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.territoryList) {
				console.warn('Cannot initialize territory list: Socket not available')
			}
			return this.territoryList
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

				if (data.cache_key === 'prp:prp_territory') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading territory list')
						this.refetchTerritories()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current territory was updated, refetch it
						if (this.currentTerritory && this.currentTerritory.name === data.doc) {
							this.refreshCurrentTerritory()
						}

						// Also refresh the list to show updated data
						this.refetchTerritories()
					}
				}
			})
		},

		// Refetch territories when notified of changes
		async refetchTerritories() {
			if (this.territoryList) {
				try {
					await this.territoryList.reload()
					return this.territories
				} catch (error) {
					console.error('Error refetching territories:', error)
				}
			}
			return null
		},

		// Refresh only the current territory
		async refreshCurrentTerritory() {
			if (this.currentTerritory && this.currentTerritoryResource) {
				try {
					await this.currentTerritoryResource.get.submit()
					return this.currentTerritory
				} catch (error) {
					console.error('Error refreshing current territory:', error)
				}
			}
			return null
		},

		// Fetch initial territories data
		async fetchTerritories() {
			try {
				const territoryList = this.initTerritoryList()
				if (territoryList) {
					await territoryList.reload()
				} else {
					console.error(
						'Territory list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('Error fetching territories:', error)
			}
		},

		// Load next page of territories
		async loadMoreTerritories() {
			if (this.hasMoreTerritories && this.territoryList) {
				try {
					await this.territoryList.next()
				} catch (error) {
					console.error('Error loading more territories:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.territoryList) {
				this.territoryList.update({
					filters: this.filters,
				})
				try {
					await this.territoryList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.territoryList) {
				this.territoryList.update({
					filters: {},
				})
				try {
					await this.territoryList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single territory by ID (osm_id)
		async fetchTerritory(osmId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching territory')
				return null
			}

			this.currentTerritoryResource = createDocumentResource(
				{
					doctype: 'PRP Territory',
					name: osmId,
					auto: true,
					// Use whitelisted methods from the backend
					whitelistedMethods: {
						// Define any methods you might want to call
						detectPotentialSubprojects: 'detect_potential_subprojects',
						updateTerritoryHierarchy: 'update_territory_hierarchy',
						updateSpatialIndex: 'update_spatial_index',
						getPotentialOverlaps: 'get_potential_overlaps',
					},
					onSuccess: (territory) => {
						this.currentTerritory = territory
					},
					onError: (error) => {
						console.error(`Error fetching territory ${osmId}:`, error)
						this.currentTerritory = null
					},
				},
				global.socket,
			)

			try {
				await this.currentTerritoryResource.get.submit()
				return this.currentTerritory
			} catch (error) {
				console.error(`Error submitting fetch for territory ${osmId}:`, error)
				return null
			}
		},

		// Create a new territory
		async createTerritory(territoryData) {
			if (!this.territoryList) {
				this.initTerritoryList()
			}

			if (!this.territoryList) {
				const errorMsg = 'Cannot create territory: Territory list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.territoryList.insert.submit(territoryData)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating territory:', error)
				throw error
			}
		},

		// Update a territory
		async updateTerritory(osmId, data) {
			if (!this.territoryList) {
				this.initTerritoryList()
			}

			if (!this.territoryList) {
				throw new Error(`Cannot update territory ${osmId}: Territory list not initialized`)
			}

			try {
				const result = await this.territoryList.setValue.submit({
					name: osmId,
					...data,
				})

				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating territory ${osmId}:`, error)
				throw error
			}
		},

		// Delete a territory
		async deleteTerritory(osmId) {
			if (!this.territoryList) {
				this.initTerritoryList()
			}

			if (!this.territoryList) {
				throw new Error(`Cannot delete territory ${osmId}: Territory list not initialized`)
			}

			try {
				await this.territoryList.delete.submit(osmId)

				// If deleted territory was the current territory, clear it
				if (this.currentTerritory && this.currentTerritory.name === osmId) {
					this.currentTerritory = null
					this.currentTerritoryResource = null
				}

				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting territory ${osmId}:`, error)
				throw error
			}
		},

		// Create a custom territory
		async createCustomTerritory(data) {
			// Ensure it's marked as custom
			const territoryData = {
				...data,
				is_custom: 1,
			}

			return this.createTerritory(territoryData)
		},

		// Get child territories for a parent territory
		async getChildTerritories(parentOsmId) {
			try {
				await this.updateFilters({ parent_territory: parentOsmId })
				return this.territories
			} catch (error) {
				console.error(`Error fetching children for territory ${parentOsmId}:`, error)
				throw error
			}
		},

		// Update territory geo data
		async updateGeoData(osmId, geoData) {
			try {
				await this.updateTerritory(osmId, {
					geo: geoData,
					// Update bounding box data if provided
					...(geoData.bounds && {
						min_lat: geoData.bounds.min_lat,
						max_lat: geoData.bounds.max_lat,
						min_lng: geoData.bounds.min_lng,
						max_lng: geoData.bounds.max_lng,
						lng: geoData.centroid ? geoData.centroid[0] : null,
						lat: geoData.centroid ? geoData.centroid[1] : null,
					}),
				})
			} catch (error) {
				console.error(`Error updating geo data for territory ${osmId}:`, error)
				throw error
			}
		},

		// Set territory type (project, phase)
		async setTerritoryType(osmId, isProject = false, isPhase = false) {
			try {
				await this.updateTerritory(osmId, {
					is_project: isProject ? 1 : 0,
					is_phase: isPhase ? 1 : 0,
				})
			} catch (error) {
				console.error(`Error updating territory type for ${osmId}:`, error)
				throw error
			}
		},

		// Expose the whitelisted method to create territory from geometry
		async createTerritoryFromGeometry(territoryName, geometry, isProject = true) {
			try {
				// Use Frappe's call method for standalone API methods
				const result = await call('prp.prp.doctype.prp_territory.prp_territory.create_territory_from_geometry', {
					name: territoryName,
					geometry: geometry,
					is_project: isProject ? 1 : 0,
				})

				if (result.success) {
					// Store potential phases if returned
					if (result.potential_phases) {
						this.potentialPhases = result.potential_phases
					}

					// Refresh territory list to include the new territory
					await this.refetchTerritories()
					return result
				} else {
					throw new Error(result.message || 'Failed to create territory')
				}
			} catch (error) {
				console.error('Error creating territory from geometry:', error)
				throw error
			}
		},

		// Create a phase for an existing project
		async createPhaseForProject(projectId, phaseName, geometry) {
			try {
				// Use Frappe's call method for standalone API methods
				const result = await call(
					'prp.prp.doctype.prp_territory.prp_territory.create_phase_for_project',
					{
						project_id: projectId,
						phase_data: {
							name: phaseName,
							geometry: geometry,
						},
					},
				)

				if (result.success) {
					// Refresh territory list to include the new phase
					await this.refetchTerritories()
					return result
				} else {
					throw new Error(result.message || 'Failed to create phase')
				}
			} catch (error) {
				console.error(`Error creating phase for project ${projectId}:`, error)
				throw error
			}
		},

		// Convert detected territories to phases for a project
		async convertToPhasesForProject(projectId) {
			try {
				// Use Frappe's call method for standalone API methods
				const result = await call(
					'prp.prp.doctype.prp_territory.prp_territory.convert_to_phases',
					{
						project_id: projectId,
					},
				)

				if (result.success) {
					// Refresh territory list to reflect the changes
					await this.refetchTerritories()

					// Clear stored potential phases
					this.potentialPhases = []

					return result
				} else {
					throw new Error(result.message || 'Failed to convert territories to phases')
				}
			} catch (error) {
				console.error(
					`Error converting territories to phases for project ${projectId}:`,
					error,
				)
				throw error
			}
		},

		// Run territory spatial index update
		async updateTerritorySpatialIndex(osmId) {
			if (!this.currentTerritoryResource) {
				await this.fetchTerritory(osmId)
			}

			if (this.currentTerritoryResource) {
				try {
					await this.currentTerritoryResource.updateSpatialIndex.submit()
					return true
				} catch (error) {
					console.error(`Error updating spatial index for ${osmId}:`, error)
					throw error
				}
			}

			return false
		},

		// Detect potential subprojects for a project territory
		async detectPotentialSubprojects(osmId) {
			if (!this.currentTerritoryResource) {
				await this.fetchTerritory(osmId)
			}

			if (this.currentTerritoryResource) {
				try {
					await this.currentTerritoryResource.detectPotentialSubprojects.submit()
					// Refresh to get any potential phases that were detected
					await this.refreshCurrentTerritory()
					return true
				} catch (error) {
					console.error(`Error detecting subprojects for ${osmId}:`, error)
					throw error
				}
			}

			return false
		},

		// Get potential overlapping territories
		async getPotentialOverlaps(osmId) {
			if (!this.currentTerritoryResource) {
				await this.fetchTerritory(osmId)
			}

			if (this.currentTerritoryResource) {
				try {
					return await this.currentTerritoryResource.getPotentialOverlaps.submit()
				} catch (error) {
					console.error(`Error getting potential overlaps for ${osmId}:`, error)
					throw error
				}
			}

			return []
		},

		// Update territory hierarchy based on spatial relationships
		async updateTerritoryHierarchy(osmId) {
			if (!this.currentTerritoryResource) {
				await this.fetchTerritory(osmId)
			}

			if (this.currentTerritoryResource) {
				try {
					await this.currentTerritoryResource.updateTerritoryHierarchy.submit()
					// Refresh to get updated relationships
					await this.refreshCurrentTerritory()
					return true
				} catch (error) {
					console.error(`Error updating hierarchy for ${osmId}:`, error)
					throw error
				}
			}

			return false
		},
	},
})
