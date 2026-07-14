/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/** Quita /api final; el proxy y axios añaden el prefijo por separado. */
function gatewayOrigin(raw: string | undefined): string {
  const base = (raw || 'http://localhost:8080').trim()
  return base.replace(/\/$/, '').replace(/\/api$/i, '')
}

// Alias @ → src/ para imports limpios (@/components, @/hooks…)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gateway = gatewayOrigin(env.VITE_API_BASE_URL)

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 3000,
      proxy: {
        // Todas las rutas /api/* → API Gateway (enruta a identity, core, reporting, whatsapp)
        '/api': {
          target: gateway,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.d.ts'],
      },
    },
  }
})
