import { defineStore } from 'pinia'
import { createListResource, createDocumentResource } from 'frappe-ui'

export const useLeadStore = defineStore('leads', {
	state: () => ({
		// Store lead list resource
		leadList: createListResource({
			doctype: 'PRP Lead',
			fields: [
				'name',
				'lead_name',
				'first_name',
				'last_name',
				'company',
				'position',
				'salary',
				'lead_owner',
				'lead_source',
				'is_deal',
				'status',
				'deal_owner',
				'phonebook',
			],
			orderBy: 'creation desc',
			start: 0,
			pageLength: 20,
			cache: 'prp-leads',
			auto: true,
			transform(data) {
				// Transform data if needed
				return data
			},
			onSuccess(data) {
				console.log('Successfully loaded leads data', data.length)
			},
			onError(error) {
				console.error('Error loading leads data:', error)
			},
		}),

		// Current selected lead
		currentLead: null,

		// Filters state
		filters: {},
	}),

	getters: {
		// Get all leads data
		leads: (state) => state.leadList.data || [],

		// Check if leads are currently loading
		isLoading: (state) => state.leadList.list?.loading || false,

		// Check if there was an error loading leads
		hasError: (state) => !!state.leadList.list?.error,

		// Get error message if exists
		errorMessage: (state) => state.leadList.list?.error?.message || '',

		// Check if there are more leads to load
		hasMoreLeads: (state) => state.leadList.hasNextPage || false,
	},

	actions: {
		// Fetch initial leads data
		async fetchLeads() {
			try {
				await this.leadList.reload()
			} catch (error) {
				console.error('Error fetching leads:', error)
			}
		},

		// Load next page of leads
		async loadMoreLeads() {
			if (this.hasMoreLeads) {
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
			this.leadList.update({
				filters: this.filters,
			})
			try {
				await this.leadList.reload()
			} catch (error) {
				console.error('Error updating filters:', error)
			}
		},

		// Reset filters
		async resetFilters() {
			this.filters = {}
			this.leadList.update({
				filters: {},
			})
			try {
				await this.leadList.reload()
			} catch (error) {
				console.error('Error resetting filters:', error)
			}
		},

		// Fetch a single lead by ID with full details including phonebook
		async fetchLead(leadId) {
			const leadDoc = createDocumentResource({
				doctype: 'PRP Lead',
				name: leadId,
				onSuccess: (lead) => {
					this.currentLead = lead
				},
				onError: (error) => {
					console.error(`Error fetching lead ${leadId}:`, error)
					this.currentLead = null
				},
			})

			try {
				await leadDoc.get.submit()
				return leadDoc.doc
			} catch (error) {
				console.error(`Error submitting fetch for lead ${leadId}:`, error)
				return null
			}
		},

		// Create a new lead
		async createLead(leadData) {
			try {
				const result = await this.leadList.insert.submit(leadData)
				// Reload the list to include the new lead
				await this.leadList.reload()
				return result
			} catch (error) {
				console.error('Error creating lead:', error)
				throw error
			}
		},

		// Update a lead
		async updateLead(name, data) {
			try {
				const result = await this.leadList.setValue.submit({
					name,
					...data,
				})

				// If current lead is updated, refresh it
				if (this.currentLead && this.currentLead.name === name) {
					await this.fetchLead(name)
				}

				return result
			} catch (error) {
				console.error(`Error updating lead ${name}:`, error)
				throw error
			}
		},

		// Delete a lead
		async deleteLead(name) {
			try {
				await this.leadList.delete.submit(name)

				// If deleted lead was the current lead, clear it
				if (this.currentLead && this.currentLead.name === name) {
					this.currentLead = null
				}

				// Reload the list
				await this.leadList.reload()
			} catch (error) {
				console.error(`Error deleting lead ${name}:`, error)
				throw error
			}
		},

		// Update phonebook entries for a lead
		async updatePhonebook(leadName, phonebookEntries) {
			try {
				// First get the current lead to ensure we have the latest data
				const lead = await this.fetchLead(leadName)

				if (!lead) {
					throw new Error(`Lead ${leadName} not found`)
				}

				// Update the phonebook entries
				return await this.updateLead(leadName, {
					phonebook: phonebookEntries,
				})
			} catch (error) {
				console.error(`Error updating phonebook for lead ${leadName}:`, error)
				throw error
			}
		},
	},
})
