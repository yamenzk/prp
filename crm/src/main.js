import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { setConfig, frappeRequest, resourcesPlugin, FeatherIcon } from 'frappe-ui'
import { createPinia } from 'pinia'
import { initSocket } from './socket'
import { globalStore } from './stores/global'
import { session } from './data/session'

// Import PrimeVue components
import Tabs from 'primevue/tabs'
import TabPanels from 'primevue/tabpanels'
import Select from 'primevue/select'
import 'primeicons/primeicons.css'
import DatePicker from 'primevue/datepicker'
import TagInput from './components/common/TagInput.vue'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import ToastService from 'primevue/toastservice'

let app = createApp(App)
setConfig('resourceFetcher', frappeRequest)

console.log('📊 Creating Pinia store')
// Initialize Pinia
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(resourcesPlugin)
app.use(ToastService)

const Noir = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{zinc.50}',
			100: '{zinc.100}',
			200: '{zinc.200}',
			300: '{zinc.300}',
			400: '{zinc.400}',
			500: '{zinc.500}',
			600: '{zinc.600}',
			700: '{zinc.700}',
			800: '{zinc.800}',
			900: '{zinc.900}',
			950: '{zinc.950}',
		},
		colorScheme: {
			light: {
				primary: {
					color: '{zinc.950}',
					inverseColor: '#ffffff',
					hoverColor: '{zinc.900}',
					activeColor: '{zinc.800}',
				},
				highlight: {
					background: '{zinc.950}',
					focusBackground: '{zinc.700}',
					color: '#ffffff',
					focusColor: '#ffffff',
				},
			},
			dark: {
				primary: {
					color: '{zinc.50}',
					inverseColor: '{zinc.950}',
					hoverColor: '{zinc.100}',
					activeColor: '{zinc.200}',
				},
				highlight: {
					background: 'rgba(250, 250, 250, .16)',
					focusBackground: 'rgba(250, 250, 250, .24)',
					color: 'rgba(255,255,255,.87)',
					focusColor: 'rgba(255,255,255,.87)',
				},
			},
		},
	},
})
app.use(PrimeVue, {
	theme: {
		preset: Noir,
		options: {
			darkModeSelector: '.dark',
		},
	},
})
// Register PrimeVue components
app.component('TabPanels', TabPanels)
app.component('Tabs', Tabs)
app.component('Tab', Tab)
app.component('TabList', TabList)
app.component('FeatherIcon', FeatherIcon)
app.component('Select', Select)
app.component('DatePicker', DatePicker)
app.component('TagInput', TagInput)

document.addEventListener('keydown', (e) => {
	// Cmd+N or Ctrl+N to open notes
	if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
		e.preventDefault()
		const noteStore = useNoteStore()
		noteStore.openDialog()
	}
})

let socket
if (import.meta.env.DEV) {
	console.log('🧪 Running in DEV mode')
	frappeRequest({ url: '/api/method/prp.www.prp.get_context_for_dev' }).then((values) => {
		console.log('📄 Received context for dev', Object.keys(values))
		for (let key in values) {
			window[key] = values[key]
		}

		console.log('🔌 Initializing socket in DEV mode')
		socket = initSocket()
		app.config.globalProperties.$socket = socket

		console.log('🏗️ Mounting app in DEV mode')
		app.mount('#app')

		console.log('🔄 Setting socket in global store after app mount (DEV)')
		const store = globalStore()
		store.setSocket(socket)
		store.setSession(session)
		console.log('Store Session:', store.session)
		console.log('✅ App initialization complete in DEV mode')
	})
} else {
	console.log('🚀 Running in PRODUCTION mode')
	socket = initSocket()
	app.config.globalProperties.$socket = socket

	console.log('🏗️ Mounting app in PRODUCTION mode')
	app.mount('#app')

	console.log('🔄 Setting socket in global store after app mount (PROD)')
	const store = globalStore()
	store.setSocket(socket)
	store.setSession(session)
	console.log('Store Session:', store.session)
	console.log('✅ App initialization complete in PRODUCTION mode')
}
