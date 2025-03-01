import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'

import { userResource, userInfoResource } from './user'

export function sessionUser() {
	const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
	let _sessionUser = cookies.get('user_id')
	if (_sessionUser === 'Guest') {
		_sessionUser = null
	}
	return _sessionUser
}

export const session = reactive({
	login: createResource({
		url: 'login',
		makeParams({ email, password }) {
			return {
				usr: email,
				pwd: password,
			}
		},
		onSuccess(data) {
			userResource.reload()
			userInfoResource.submit() // Fetch the extended user info
			session.user = sessionUser()
			session.login.reset()
			router.replace(data.default_route || '/')
		},
	}),
	logout: createResource({
		url: 'logout',
		onSuccess() {
			userResource.reset()
			userInfoResource.reset()
			session.user = sessionUser()
			router.replace({ name: 'Login' })
		},
	}),
	user: sessionUser(),
	userInfo: computed(() => userInfoResource.data || {}),
	userImage: computed(() => session.userInfo.user_image),
	userRoles: computed(() => session.userInfo.roles || []),
	isLoggedIn: computed(() => !!session.user),
})
