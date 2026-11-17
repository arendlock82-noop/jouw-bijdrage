import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://<user>.github.io/jouw-bijdrage/
export default defineConfig({
  plugins: [react()],
  base: '/jouw-bijdrage/',
})
