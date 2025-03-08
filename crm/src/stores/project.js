import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'
import { globalStore } from './global'

export const useProjectStore = defineStore('projects', {
	state: () => ({
		// Store project list resource
		projectList: null,

		// Current selected project
		currentProject: null,
		currentProjectResource: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all projects data
		projects: (state) => state.projectList?.data || [],

		// Check if projects are currently loading
		isLoading: (state) => state.projectList?.list?.loading || false,

		// Check if there was an error loading projects
		hasError: (state) => !!state.projectList?.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.projectList?.list?.error?.message || '',

		// Check if there are more projects to load
		hasMoreProjects: (state) => state.projectList?.hasNextPage || false,
	},

	actions: {
		// Initialize the projects list resource and setup socket listeners
		initProjectList() {
			const global = globalStore()

			if (!this.projectList && global.socket) {
				this.projectList = createListResource(
					{
						doctype: 'PRP Project',
						fields: ['*'],
						orderBy: 'creation desc',
						start: 0,
						pageLength: 20,
						cache: 'prp:prp_project',
						auto: true,
						transform(data) {
							return data
						},
						onSuccess(data) {
							// console.log('Successfully loaded projects data', data.length)
						},
						onError(error) {
							console.error('Error loading projects data:', error)
						},
					},
					global.socket,
				)

				// Set up socket listener for our custom event
				this.setupRealtimeListeners(global.socket)
			} else if (!this.projectList) {
				console.warn('Cannot initialize project list: Socket not available')
			}
			return this.projectList
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

				if (data.cache_key === 'prp:prp_project') {
					// Handle different event types
					if (data.event === 'list_update') {
						// Document was added or deleted, reload full list
						console.log('Detected list change (add/delete), reloading project list')
						this.refetchProjects()
					} else if (data.event === 'doc_update') {
						// Single document was updated
						console.log(`Detected document update for ${data.doc}`)

						// If our current project was updated, refetch it
						if (this.currentProject && this.currentProject.name === data.doc) {
							this.refreshCurrentProject()
						}

						// Also refresh the list to show updated data
						this.refetchProjects()
					}
				}
			})
		},

		// Refetch projects when notified of changes
		async refetchProjects() {
			if (this.projectList) {
				try {
					await this.projectList.reload()
					return this.projects
				} catch (error) {
					console.error('Error refetching projects:', error)
				}
			}
			return null
		},

		// Refresh only the current project
		async refreshCurrentProject() {
			if (this.currentProject && this.currentProjectResource) {
				try {
					await this.currentProjectResource.get.submit()
					return this.currentProject
				} catch (error) {
					console.error('Error refreshing current project:', error)
				}
			}
			return null
		},

		// Fetch initial projects data
		async fetchProjects() {
			try {
				const projectList = this.initProjectList()
				if (projectList) {
					await projectList.reload()
				} else {
					console.error(
						'Project list not initialized yet. Socket might not be available.',
					)
				}
			} catch (error) {
				console.error('Error fetching projects:', error)
			}
		},

		// Load next page of projects
		async loadMoreProjects() {
			if (this.hasMoreProjects && this.projectList) {
				try {
					await this.projectList.next()
				} catch (error) {
					console.error('Error loading more projects:', error)
				}
			}
		},

		// Update filters and reload
		async updateFilters(newFilters) {
			this.filters = { ...this.filters, ...newFilters }

			if (this.projectList) {
				this.projectList.update({
					filters: this.filters,
				})
				try {
					await this.projectList.reload()
				} catch (error) {
					console.error('Error updating filters:', error)
				}
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}

			if (this.projectList) {
				this.projectList.update({
					filters: {},
				})
				try {
					await this.projectList.reload()
				} catch (error) {
					console.error('Error resetting filters:', error)
				}
			}
		},

		// Fetch a single project by ID
		async fetchProject(projectId) {
			const global = globalStore()

			if (!global.socket) {
				console.warn('Socket not available for fetching project')
			}

			this.currentProjectResource = createDocumentResource(
				{
					doctype: 'PRP Project',
					name: projectId,
					auto: true,
					onSuccess: (project) => {
						this.currentProject = project
					},
					onError: (error) => {
						console.error(`Error fetching project ${projectId}:`, error)
						this.currentProject = null
					},
				},
				global.socket,
			)

			try {
				await this.currentProjectResource.get.submit()
				return this.currentProject
			} catch (error) {
				console.error(`Error submitting fetch for project ${projectId}:`, error)
				return null
			}
		},

		// Create a new project
		async createProject(projectData) {
			if (!this.projectList) {
				this.initProjectList()
			}

			if (!this.projectList) {
				const errorMsg = 'Cannot create project: Project list not initialized'
				console.error(errorMsg)
				throw new Error(errorMsg)
			}

			try {
				const result = await this.projectList.insert.submit(projectData)
				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error('Error creating project:', error)
				throw error
			}
		},

		// Update a project
		async updateProject(name, data) {
			if (!this.projectList) {
				this.initProjectList()
			}

			if (!this.projectList) {
				throw new Error(`Cannot update project ${name}: Project list not initialized`)
			}

			try {
				const result = await this.projectList.setValue.submit({
					name,
					...data,
				})

				// Server will send realtime update that will trigger refetch
				return result
			} catch (error) {
				console.error(`Error updating project ${name}:`, error)
				throw error
			}
		},

		// Delete a project
		async deleteProject(name) {
			if (!this.projectList) {
				this.initProjectList()
			}

			if (!this.projectList) {
				throw new Error(`Cannot delete project ${name}: Project list not initialized`)
			}

			try {
				await this.projectList.delete.submit(name)

				// If deleted project was the current project, clear it
				if (this.currentProject && this.currentProject.name === name) {
					this.currentProject = null
					this.currentProjectResource = null
				}

				// Server will send realtime update that will trigger refetch
			} catch (error) {
				console.error(`Error deleting project ${name}:`, error)
				throw error
			}
		},

		// Update project cover image
		async updateCoverImage(projectName, imageFile) {
			try {
				const result = await this.updateProject(projectName, {
					cover_image: imageFile,
				})

				return result
			} catch (error) {
				console.error(`Error updating cover image for project ${projectName}:`, error)
				throw error
			}
		},

		// Update project handover information
		async updateHandoverInfo(projectName, quarter, year, status) {
			try {
				const result = await this.updateProject(projectName, {
					handover_quarter: quarter,
					handover_year: year,
					status: status,
				})

				return result
			} catch (error) {
				console.error(`Error updating handover info for project ${projectName}:`, error)
				throw error
			}
		},
	},
})
