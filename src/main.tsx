/**
 * Punto de entrada de la SPA.
 * Monta los proveedores globales antes de renderizar App:
 *  - React Query: cache y fetching del servidor
 *  - AuthProvider: sesión JWT en memoria + localStorage
 *  - Toaster: notificaciones toast en toda la app
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import App from '@/App'
import '@/index.css'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: 13, borderRadius: 10 },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
