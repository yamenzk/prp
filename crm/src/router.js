import { createRouter, createWebHistory } from 'vue-router'
import { session } from './data/session'
import { userResource } from '@/data/user'
import Layout from '@/components/layout/Layout.vue'

const routes = [
	{
		path: '/',
		component: Layout,
		children: [
			{
				path: '',
				name: 'Home',
				component: () => import('@/pages/Home.vue'),
			},
			// Add other routes that should use the layout here
		],
		meta: { requiresAuth: true },
	},
	{
		name: 'Login',
		path: '/account/login',
		component: () => import('@/pages/Login.vue'),
		meta: { requiresAuth: false },
	},
]

let router = createRouter({
	history: createWebHistory('/crm'),
	routes,
})

router.beforeEach(async (to, from, next) => {
	let isLoggedIn = session.isLoggedIn
	try {
		await userResource.promise
	} catch (error) {
		isLoggedIn = false
	}

	if (to.name === 'Login' && isLoggedIn) {
		next({ name: 'Home' })
	} else if (to.meta.requiresAuth && !isLoggedIn) {
		next({ name: 'Login' })
	} else {
		next()
	}
})

export default router
