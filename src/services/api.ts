import axios from 'axios'
import type {
  LoginRequest, RegisterRequest, AuthResponse, AuthMeResponse,
  CreateProductRequest, UpdateProductRequest, AdjustRequest,
  Product, Dashboard,
  RbacMatrixResponse, RoleModuleCellDto, AdminUserRowDto, AdminCreateUserRequest,
} from '@/types'

/**
 * Mismo path que `server.servlet.context-path` del backend Spring.
 */
export const API_PREFIX = '/api'

/** Host del API sin path. Dev: '' (peticiones relativas al origen de Vite). Prod: dominio del backend. */
function resolveOrigin(): string {
  if (import.meta.env.DEV) return ''
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (!raw) return ''
  return raw.replace(/\/$/, '').replace(/\/api$/i, '')
}

/**
 * baseURL de axios: en prod `https://tu-api.com/api`; en dev `/api` (proxy Vite).
 * Rutas deben ir SIN barra inicial (p. ej. `auth/login`) para que combineURLs no pierda el /api.
 */
const http = axios.create({ baseURL: `${resolveOrigin()}${API_PREFIX}` })

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('shs_token')
  if (token) cfg.headers!.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 503) {
      maintenance503Listeners.forEach(fn => {
        try {
          fn()
        } catch {
          /* noop */
        }
      })
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('shs_token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

const maintenance503Listeners = new Set<() => void>()
export function onMaintenance503(callback: () => void) {
  maintenance503Listeners.add(callback)
  return () => {
    maintenance503Listeners.delete(callback)
  }
}

// ── auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data: LoginRequest): Promise<AuthResponse> => http.post('auth/login', data).then(r => r.data),
  register: (data: RegisterRequest): Promise<AuthResponse> => http.post('auth/register', data).then(r => r.data),
  me: (): Promise<AuthMeResponse> => http.get('auth/me').then(r => r.data),
  maintenanceStatus: (): Promise<{ enabled: boolean }> => http.get('auth/maintenance').then(r => r.data),
}

// ── dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  get: (): Promise<Dashboard> => http.get('dashboard').then(r => r.data),
}

// ── products ──────────────────────────────────────────────────────────────────
export const productService = {
  getAll:  ():                                Promise<Product[]> => http.get('products').then(r => r.data),
  getById: (id: string):                      Promise<Product>   => http.get(`products/${id}`).then(r => r.data),
  create:  (data: CreateProductRequest):      Promise<Product>   => http.post('products', data).then(r => r.data),
  update:  (id: string, data: UpdateProductRequest): Promise<Product> => http.patch(`products/${id}`, data).then(r => r.data),
  delete:  (id: string):                      Promise<void>      => http.delete(`products/${id}`).then(() => undefined),
  consume: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`products/${id}/consume`, data).then(r => r.data),
  restock: (id: string, data: AdjustRequest): Promise<Product>   => http.post(`products/${id}/restock`, data).then(r => r.data),
}

// ── admin (solo OWNER en backend) ─────────────────────────────────────────────
export const adminService = {
  getRbac: (): Promise<RbacMatrixResponse> =>
    http.get('admin/rbac').then(r => r.data),
  updatePermissions: (cells: RoleModuleCellDto[]): Promise<void> =>
    http.put('admin/rbac/permissions', { cells }).then(() => undefined),
  listUsers: (): Promise<AdminUserRowDto[]> =>
    http.get('admin/users').then(r => r.data),
  createUser: (data: AdminCreateUserRequest): Promise<AdminUserRowDto> =>
    http.post('admin/users', data).then(r => r.data),
  updateUserRole: (userId: string, roleId: number): Promise<void> =>
    http.patch(`admin/users/${userId}/role`, { roleId }).then(() => undefined),
  getMaintenance: (): Promise<{ enabled: boolean }> =>
    http.get('admin/maintenance').then(r => r.data),
  setMaintenance: (enabled: boolean): Promise<void> =>
    http.put('admin/maintenance', { enabled }).then(() => undefined),
}
