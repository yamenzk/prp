import { ref, computed } from 'vue'

export function useTasks(noteStore) {
	// Task note collection
	const taskNotes = computed(() => noteStore.notes.filter((note) => note.task))

	// Task dragging state
	const draggingTask = ref(null)

	// Visible task statuses for columns
	const visibleStatuses = ref(['To Do', 'On Hold', 'In Progress', 'Completed'])

	// Task filter options
	const taskFilterOptions = [
		{ label: 'All Tasks', value: 'all' },
		{ label: 'Active', value: 'active' },
		{ label: 'Completed', value: 'completed' },
	]

	// Priority filter options
	const priorityFilterOptions = [
		{ label: 'All Priorities', value: '' },
		{ label: 'High', value: 'High' },
		{ label: 'Medium', value: 'Medium' },
		{ label: 'Low', value: 'Low' },
	]

	// Status options for dropdown
	const statusOptions = [
		{ label: 'Backlog', value: 'Backlog' },
		{ label: 'To Do', value: 'To Do' },
		{ label: 'On Hold', value: 'On Hold' },
		{ label: 'In Progress', value: 'In Progress' },
		{ label: 'Completed', value: 'Completed' },
		{ label: 'Cancelled', value: 'Cancelled' },
	]

	// Priority options for dropdown
	const priorityOptions = [
		{ label: 'High', value: 'High' },
		{ label: 'Medium', value: 'Medium' },
		{ label: 'Low', value: 'Low' },
	]

	// Get status icon
	const getStatusFeatherIcon = (status) => {
		switch (status) {
			case 'Completed':
				return 'check-circle'
			case 'To Do':
				return 'clock'
			case 'On Hold':
				return 'pause-circle'
			case 'In Progress':
				return 'rotate-cw'
			case 'Cancelled':
				return 'x-circle'
			case 'Backlog':
				return 'inbox'
			default:
				return 'circle'
		}
	}

	// Get status severity for UI display
	const getStatusSeverity = (status) => {
		switch (status) {
			case 'Completed':
				return 'success'
			case 'To Do':
				return 'info'
			case 'On Hold':
				return 'warn'
			case 'In Progress':
				return 'info'
			case 'Cancelled':
				return 'secondary'
			default:
				return 'info'
		}
	}

	// Get priority severity for UI display
	const getPrioritySeverity = (priority) => {
		switch (priority) {
			case 'High':
				return 'danger'
			case 'Medium':
				return 'warn'
			case 'Low':
				return 'info'
			default:
				return 'info'
		}
	}

	// Filter tasks by status, task filter, and priority filter
	const getFilteredTasksByStatus = (
		status,
		taskFilter = 'all',
		priorityFilter = '',
		hideCompleted = false,
	) => {
		let filtered = taskNotes.value.filter((task) => task.status === status)

		// Apply task filter
		if (taskFilter === 'active') {
			filtered = filtered.filter(
				(task) => task.status !== 'Completed' && task.status !== 'Cancelled',
			)
		} else if (taskFilter === 'completed') {
			filtered = filtered.filter(
				(task) => task.status === 'Completed' || task.status === 'Cancelled',
			)
		}

		// Apply priority filter
		if (priorityFilter) {
			filtered = filtered.filter((task) => task.priority === priorityFilter)
		}

		// Hide completed if enabled and in "all" mode
		if (hideCompleted && taskFilter === 'all') {
			filtered = filtered.filter(
				(task) => task.status !== 'Completed' && task.status !== 'Cancelled',
			)
		}

		return filtered
	}

	// Update task status
	const updateTaskStatus = async (task, newStatus) => {
		if (!task) return false

		try {
			await noteStore.updateNote(task.name, { status: newStatus })
			return true
		} catch (error) {
			console.error('Failed to update task status:', error)
			return false
		}
	}

	// Update task priority
	const updateTaskPriority = async (task, newPriority) => {
		if (!task) return false

		try {
			await noteStore.updateNote(task.name, { priority: newPriority })
			return true
		} catch (error) {
			console.error('Failed to update task priority:', error)
			return false
		}
	}

	// Toggle task complete status
	const toggleTaskComplete = async (task) => {
		if (!task) return false

		const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed'
		return await updateTaskStatus(task, newStatus)
	}

	// Convert note to task
	const convertToTask = async (noteName) => {
		if (!noteName) return false

		try {
			await noteStore.convertToTask(noteName)
			// Refresh the note
			await noteStore.fetchNote(noteName)
			return true
		} catch (error) {
			console.error('Failed to convert to task:', error)
			return false
		}
	}

	// Task drag and drop functionality
	const dragTask = (event, task) => {
		draggingTask.value = task
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', task.name)
	}

	const dropTask = async (event, status) => {
		event.preventDefault()

		if (draggingTask.value) {
			await updateTaskStatus(draggingTask.value, status)
			draggingTask.value = null
			return true
		}

		return false
	}

	// Check if date is overdue
	const isOverdue = (dateString) => {
		if (!dateString) return false

		try {
			// Parse the date from DD-MM-YYYY HH:MM:SS format
			const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
			if (!parts) return false

			const date = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
			return date < new Date()
		} catch (e) {
			return false
		}
	}

	// Format due date with relative time
	const formatDueDate = (dateString) => {
		if (!dateString) return ''

		try {
			// Parse the date from DD-MM-YYYY HH:MM:SS format
			const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
			if (!parts) return dateString

			const date = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5], parts[6])
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const tomorrow = new Date(today)
			tomorrow.setDate(tomorrow.getDate() + 1)

			// If due today
			if (
				date.getDate() === today.getDate() &&
				date.getMonth() === today.getMonth() &&
				date.getFullYear() === today.getFullYear()
			) {
				return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
			}

			// If due tomorrow
			if (
				date.getDate() === tomorrow.getDate() &&
				date.getMonth() === tomorrow.getMonth() &&
				date.getFullYear() === tomorrow.getFullYear()
			) {
				return `Tomorrow at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
			}

			// Otherwise show full date
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			}).format(date)
		} catch (e) {
			return dateString
		}
	}

	return {
		taskNotes,
		draggingTask,
		visibleStatuses,
		taskFilterOptions,
		priorityFilterOptions,
		statusOptions,
		priorityOptions,
		getStatusFeatherIcon,
		getStatusSeverity,
		getPrioritySeverity,
		getFilteredTasksByStatus,
		updateTaskStatus,
		updateTaskPriority,
		toggleTaskComplete,
		convertToTask,
		dragTask,
		dropTask,
		isOverdue,
		formatDueDate,
	}
}
