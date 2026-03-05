import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // When deploying to GitHub Pages the app is served under /<repo-name>/
  // Set the VITE_BASE_PATH env var in the Actions workflow to match your repo name.
  // For local dev this defaults to '/' so nothing changes.
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    proxy: {
      '/rabbitmq-proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
