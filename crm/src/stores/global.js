import { defineStore } from 'pinia'

export const globalStore = defineStore('global', {
	state: () => ({
		socket: null,
	}),
	getters: {
		getSocket: (state) => {
			console.log(
				'🔍 Getting socket from global store:',
				state.socket ? 'Available' : 'Not available',
			)
			return state.socket
		},
	},
	actions: {
		setSocket(socket) {
			console.log(
				'🔌 Setting socket in global store:',
				socket ? 'Valid socket object' : 'Invalid socket',
			)
			this.socket = socket
		},
	},
})
