import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { setConfig, frappeRequest, resourcesPlugin, FeatherIcon } from 'frappe-ui'
import { createPinia } from 'pinia'

// Import PrimeVue components
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Avatar from 'primevue/avatar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'

let app = createApp(App)
setConfig('resourceFetcher', frappeRequest)

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)

app.use(router)
app.use(resourcesPlugin)

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
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Checkbox', Checkbox)
app.component('Avatar', Avatar)
app.component('Card', Card)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Tag', Tag)
app.component('FeatherIcon', FeatherIcon)

app.mount('#app')
