import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		watch: {
			ignored: ['code/view/**']
		},
	},
	plugins: [sveltekit()]
})
