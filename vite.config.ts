import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // 127.0.0.1 evita ECONNREFUSED ::1:8080 (Node usa IPv6 para "localhost" y Tomcat a veces solo en IPv4)
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
