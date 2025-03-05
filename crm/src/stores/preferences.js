import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'

export const usePreferenceStore = defineStore('preferences', {
	state: () => ({
		// Store preference list resource
		preferenceList: createListResource({
			doctype: 'PRP Preference',
			fields: [
				'name',
				'type',
                'lead',
				'territory',
				'bedrooms',
				'master_bedrooms',
				'bathrooms',
				'min_sqft',
				'max_sqft',
				'min_sqm',
				'max_sqm',
				'is_listing',
				'is_project',
				'gated_community',
				'pet_friendly',
				'walkable',
				'gym',
				'pool',
				'sauna',
				'park',
				'security',
				'conceirge',
				'covered_parking',
				'ev_stations',
				'central_ac',
				'chiller_free',
				'service_provider',
				'smart_home',
				'furnished',
				'pets_allowed',
				'balcony',
				'walkin_closet',
				'open_kitchen',
				'kitchen_appliances',
				'city_view',
				'sea_view',
				'garden_view',
				'sqft',
				'sqm',
			],
			orderBy: 'creation desc',
			start: 0,
			pageLength: 20,
			cache: 'prp-preferences',
			auto: true,
			transform(data) {
				// Transform data if needed
				return data
			},
			onSuccess(data) {
				console.log('Successfully loaded preferences data', data.length)
			},
			onError(error) {
				console.error('Error loading preferences data:', error)
			},
		}),

		// Current selected preference
		currentPreference: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all preferences data
		preferences: (state) => state.preferenceList.data || [],

		// Check if preferences are currently loading
		isLoading: (state) => state.preferenceList.list?.loading || false,

		// Check if there was an error loading preferences
		hasError: (state) => !!state.preferenceList.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.preferenceList.list?.error?.message || '',

		// Check if there are more preferences to load
		hasMorePreferences: (state) => state.preferenceList.hasNextPage || false,
	},

	actions: {
		// Fetch initial preferences data
		async fetchPreferences() {
			try {
				await this.preferenceList.reload()
			} catch (error) {
				console.error('Error fetching preferences:', error)
			}
		},

		// Load next page of preferences
		async loadMorePreferences() {
			if (this.hasMorePreferences) {
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
			this.preferenceList.update({
				filters: this.filters,
			})
			try {
				await this.preferenceList.reload()
			} catch (error) {
				console.error('Error updating filters:', error)
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}
			this.preferenceList.update({
				filters: {},
			})
			try {
				await this.preferenceList.reload()
			} catch (error) {
				console.error('Error resetting filters:', error)
			}
		},

		// Fetch a single preference by ID
		async fetchPreference(preferenceId) {
			const preferenceDoc = createDocumentResource({
				doctype: 'PRP Preference',
				name: preferenceId,
				onSuccess: (preference) => {
					this.currentPreference = preference
				},
				onError: (error) => {
					console.error(`Error fetching preference ${preferenceId}:`, error)
					this.currentPreference = null
				},
			})

			try {
				await preferenceDoc.get.submit()
				return preferenceDoc.doc
			} catch (error) {
				console.error(`Error submitting fetch for preference ${preferenceId}:`, error)
				return null
			}
		},

		// Create a new preference
		async createPreference(preferenceData) {
			try {
				const result = await this.preferenceList.insert.submit(preferenceData)
				// Reload the list to include the new preference
				await this.preferenceList.reload()
				return result
			} catch (error) {
				console.error('Error creating preference:', error)
				throw error
			}
		},

		// Update a preference
		async updatePreference(name, data) {
			try {
				const result = await this.preferenceList.setValue.submit({
					name,
					...data,
				})

				// If current preference is updated, refresh it
				if (this.currentPreference && this.currentPreference.name === name) {
					await this.fetchPreference(name)
				}

				return result
			} catch (error) {
				console.error(`Error updating preference ${name}:`, error)
				throw error
			}
		},

		// Delete a preference
		async deletePreference(name) {
			try {
				await this.preferenceList.delete.submit(name)

				// If deleted preference was the current preference, clear it
				if (this.currentPreference && this.currentPreference.name === name) {
					this.currentPreference = null
				}

				// Reload the list
				await this.preferenceList.reload()
			} catch (error) {
				console.error(`Error deleting preference ${name}:`, error)
				throw error
			}
		},

		// Toggle a boolean field
		async toggleField(name, field) {
			try {
				// First get the current preference to ensure we have the latest data
				const preference = await this.fetchPreference(name)

				if (!preference) {
					throw new Error(`Preference ${name} not found`)
				}

				// Toggle the boolean field
				const currentValue = preference[field] || 0
				return await this.updatePreference(name, {
					[field]: currentValue ? 0 : 1,
				})
			} catch (error) {
				console.error(`Error toggling field ${field} for preference ${name}:`, error)
				throw error
			}
		},
	},
})
