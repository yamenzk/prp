import { computed } from 'vue'

export function useJournals(noteStore) {
	// Journal notes collection
	const journalNotes = computed(() => noteStore.notes.filter((note) => note.journal))

	// Group journals by date
	const journalsByDate = computed(() => {
		const groups = {}

		for (const journal of journalNotes.value) {
			const date = journal.creation.split(' ')[0] // Extract date part
			if (!groups[date]) {
				groups[date] = []
			}
			groups[date].push(journal)
		}

		// Convert to array and sort by date descending
		return Object.entries(groups)
			.map(([date, entries]) => ({ date, entries }))
			.sort((a, b) => new Date(b.date) - new Date(a.date))
	})

	// Format journal date with relative indicators
	const formatJournalDate = (dateString) => {
		if (!dateString) return ''

		try {
			const date = new Date(dateString)
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const yesterday = new Date(today)
			yesterday.setDate(yesterday.getDate() - 1)

			// Format for "today"
			if (
				date.getDate() === today.getDate() &&
				date.getMonth() === today.getMonth() &&
				date.getFullYear() === today.getFullYear()
			) {
				return 'Today'
			}

			// Format for "yesterday"
			if (
				date.getDate() === yesterday.getDate() &&
				date.getMonth() === yesterday.getMonth() &&
				date.getFullYear() === yesterday.getFullYear()
			) {
				return 'Yesterday'
			}

			// Otherwise show full date
			return new Intl.DateTimeFormat('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			}).format(date)
		} catch (e) {
			return dateString
		}
	}

	return {
		journalNotes,
		journalsByDate,
		formatJournalDate,
	}
}
