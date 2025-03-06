import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		frappeui(),
		vue(),
		Components({
			resolvers: [PrimeVueResolver()],
			dts: true,
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			quill: path.resolve(__dirname, 'node_modules/quill/dist/quill.js'),
		},
	},
	build: {
		outDir: `../${path.basename(path.resolve('..'))}/public/crm`,
		emptyOutDir: true,
		target: 'es2015',
	},
	optimizeDeps: {
		include: ['frappe-ui > feather-icons', 'showdown', 'engine.io-client', 'quill'],
	},
})
