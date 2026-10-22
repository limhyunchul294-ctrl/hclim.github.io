import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub project Pages (repo hclim.github.io under limhyunchul294-ctrl):
// https://limhyunchul294-ctrl.github.io/hclim.github.io/meal-controller/
export default defineConfig({
  plugins: [react()],
  base: '/hclim.github.io/meal-controller/',
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    // Publish static site at repo path meal-controller/ (source lives in apps/)
    outDir: '../../meal-controller',
    emptyOutDir: true,
  },
})
