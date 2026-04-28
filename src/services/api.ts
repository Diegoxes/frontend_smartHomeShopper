import axios from 'axios'
import type {
  LoginRequest, RegisterRequest, AuthResponse,
  CreateProductRequest, UpdateProductRequest, AdjustRequest,
  Product, Dashboard,
} from '@/types'

// ── axios instance ────────────────────────────────────────────────────────────
// Dev: `vite` usa proxy → base `/api`. Prod (Railway, etc.): define VITE_API_BASE_URL en build, ej. https://tu-backend.up.railway.app/api
const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api'

const http = axios.create({ baseURL: apiBase })

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

// ── auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login:    (data: LoginRequest):    Promise<AuthResponse> => http.post('/auth/login',    data).then(r => r.data),
  register: (data: RegisterRequest): Promise<AuthResponse> => http.post('/auth/register', data).then(r => r.data),
}

// ── dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  get: (): Promise<Dashboard> => http.get('/dashboard').then(r => r.data),
}

// ── products ──────────────────────────────────────────────────────────────────
export const productService = {
  getAll:  ():                                Promise<Product[]> => http.get('/products').then(r => r.data),
  getById: (id: string):                      Promise<Product>   => http.get(`/products/${id}`).then(r => r.data),
  create:  (data: CreateProductRequest):      Promise<Product>   => http.post('/products', data).then(r => r.data),
  update:  (id: string, data: UpdateProductRequest): Promise<Product> => http.patch(`/products/${id}`, data).then(r => r.data),
  delete:  (id: string):                      Promise<void>      => http.delete(`/products/${id}`).then(() => undefined),
  consume: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`/products/${id}/consume`, data).then(r => r.data),
  restock: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`/products/${id}/restock`, data).then(r => r.data),
}
