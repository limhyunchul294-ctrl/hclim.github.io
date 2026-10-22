import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so GitHub Pages can serve this app from /meal-controller/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})
