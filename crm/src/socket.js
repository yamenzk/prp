import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'


export function initSocket() {
	let host = window.location.hostname
	let siteName = window.site_name
	let port = window.location.port ? `:${socketio_port}` : ''
	let protocol = port ? 'http' : 'https'
	let url = `${protocol}://${host}${port}/${siteName}`

	console.log('🔌 Initializing socket connection to:', url)

	let socket = io(url, {
		withCredentials: true,
		reconnectionAttempts: 5,
	})

	socket.on('connect', () => {
		console.log('🟢 Socket connected successfully, ID:', socket.id)
	})

	socket.on('connect_error', (error) => {
		console.error('🔴 Socket connection error:', error.message)
	})

	socket.on('disconnect', (reason) => {
		console.warn('🟠 Socket disconnected:', reason)
	})

	return socket
}
