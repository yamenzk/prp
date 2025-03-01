import router from '@/router'
import { createResource } from 'frappe-ui'

export const userResource = createResource({
	url: 'frappe.auth.get_logged_user',
	cache: 'User',
	onError(error) {
		if (error && error.exc_type === 'AuthenticationError') {
			router.push({ name: 'LoginPage' })
		}
	},
})

export const userInfoResource = createResource({
	url: 'prp.api.get_user_info',
	cache: 'UserInfo',
	onError(error) {
		if (error && error.exc_type === 'AuthenticationError') {
			router.push({ name: 'LoginPage' })
		}
	},
})
