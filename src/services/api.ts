import axios from 'axios'
import type {
  LoginRequest, RegisterRequest, AuthResponse,
  CreateProductRequest, UpdateProductRequest, AdjustRequest,
  Product, Dashboard,
} from '@/types'

/**
 * Mismo path que `server.servlet.context-path` del backend Spring.
 * Todas las peticiones HTTP llevan este prefijo.
 */
export const API_PREFIX = '/api'

/** Origen del backend. En dev: '' (mismo host que Vite; el proxy atiende /api/*). En prod: URL del API sin /api final. */
function resolveOrigin(): string {
  if (import.meta.env.DEV) return ''
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (!raw) return ''
  return raw.replace(/\/$/, '').replace(/\/api$/i, '')
}

const http = axios.create({ baseURL: resolveOrigin() })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('shs_token')
  if (token) cfg.headers!.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shs_token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// Rutas relativas al origen: siempre incluyen API_PREFIX ( /api/auth/..., /api/products/... )

// ── auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:    (data: LoginRequest):    Promise<AuthResponse> => http.post(`${API_PREFIX}/auth/login`,    data).then(r => r.data),
  register: (data: RegisterRequest): Promise<AuthResponse> => http.post(`${API_PREFIX}/auth/register`, data).then(r => r.data),
}

// ── dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  get: (): Promise<Dashboard> => http.get(`${API_PREFIX}/dashboard`).then(r => r.data),
}

// ── products ──────────────────────────────────────────────────────────────────
export const productService = {
  getAll:  ():                                Promise<Product[]> => http.get(`${API_PREFIX}/products`).then(r => r.data),
  getById: (id: string):                      Promise<Product>   => http.get(`${API_PREFIX}/products/${id}`).then(r => r.data),
  create:  (data: CreateProductRequest):      Promise<Product>   => http.post(`${API_PREFIX}/products`, data).then(r => r.data),
  update:  (id: string, data: UpdateProductRequest): Promise<Product> => http.patch(`${API_PREFIX}/products/${id}`, data).then(r => r.data),
  delete:  (id: string):                      Promise<void>      => http.delete(`${API_PREFIX}/products/${id}`).then(() => undefined),
  consume: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`${API_PREFIX}/products/${id}/consume`, data).then(r => r.data),
  restock: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`${API_PREFIX}/products/${id}/restock`, data).then(r => r.data),
}
