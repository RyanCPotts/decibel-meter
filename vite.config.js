import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Prevents Vite from switching ports if 5173 is unavailable
    host: 'localhost', // Ensures it binds correctly
    open: true, // Opens the browser automatically
    hmr: {
      overlay: false
    }
  }
})
