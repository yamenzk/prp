import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

import {
	Button,
	Card,
	Input,
	setConfig,
	frappeRequest,
	resourcesPlugin,
	Dialog,
	Avatar,
	FeatherIcon,
} from 'frappe-ui'

let app = createApp(App)

setConfig('resourceFetcher', frappeRequest)

app.use(router)
app.use(resourcesPlugin)

app.component('Button', Button)
app.component('Card', Card)
app.component('Input', Input)
app.component('Dialog', Dialog)
app.component('Avatar', Avatar)
app.component('FeatherIcon', FeatherIcon)

app.mount('#app')
