module.exports = {
	presets: [require('frappe-ui/src/utils/tailwind.config')],
	content: [
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}',
		'./node_modules/frappe-ui/src/components/**/*.{vue,js,ts,jsx,tsx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Gray colors for light mode (using Tailwind's gray palette)
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827', // Accent color
				},
				// GitHub-like colors for dark mode
				dark: {
					DEFAULT: '#0d1117', // GitHub dark background
					accent: '#161b22', // GitHub dark secondary background
					navbar: '#21262d', // GitHub navbar
					border: '#30363d', // GitHub borders
					text: '#c9d1d9', // GitHub primary text
					'text-secondary': '#8b949e', // GitHub secondary text
					button: '#238636', // GitHub button
				},
			},
		},
	},
	plugins: [],
}
