import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em desenvolvimento, /api é repassado ao backend Express (evita CORS e URLs fixas no código)
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})
