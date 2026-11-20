import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' permite publicar la carpeta dist en cualquier ruta (GitHub Pages, Netlify, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
})
