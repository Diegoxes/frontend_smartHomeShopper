import axios from 'axios'
import type {
  LoginRequest, RegisterRequest, AuthResponse, AuthMeResponse,
  CreateProductRequest, UpdateProductRequest, AdjustRequest, AdjustStockRequest,
  Product, Dashboard, ProductMovement,
  RbacMatrixResponse, RoleModuleCellDto, AdminUserRowDto, AdminCreateUserRequest,
  OnboardingRequest, OrganizationDto, OrgMemberDto, CreateOrgMemberRequest,
  PlatformOrganizationRow, PlatformUserRow, PendingOrgDto,
  Supplier, CreateSupplierRequest, PurchasesPage,
  RotationReport, InventoryReport, ExecutiveDashboard,
  Category, CreateCategoryRequest,
  MeasureUnit, CreateMeasureUnitRequest, ProductUom, ProductUomInput,
} from '@/types'

export const API_PREFIX = '/api'

// VITE_API_BASE_URL en .env (ej. http://localhost:8080). Sin valor en dev → proxy de Vite (/api → :8080).
function resolveOrigin(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (raw) return raw.replace(/\/$/, '').replace(/\/api$/i, '')
  if (import.meta.env.DEV) return ''
  return ''
}

const http = axios.create({ baseURL: `${resolveOrigin()}${API_PREFIX}` })// se crear una instancia personalizada Axios baseURL
// Concatena dinámicamente el dominio y el prefijo de API.
// http -> se usa en toda la app para hacer requests sin repetir la URL ni headers.

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('shs_token')
  if (token) cfg.headers!.Authorization = `Bearer ${token}`//Si token existe lo agrega al encabezado de HTTP
  return cfg //devuelve la confi. modificada
})

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 503) {//En mantenimiento
      maintenance503Listeners.forEach(fn => { try { fn() } catch { /* noop */ } })//recorre lista de funciones registradas
    }
    if (err.response?.status === 403) {//Prohibido o sin permiso
      const msg = err.response?.data?.error as string | undefined
      console.warn('[API 403]', err.config?.url, msg ?? 'Sin permiso')
    }
    // Token expirado o inválido: forzar re-login (recarga completa para limpiar estado React)
    if (err.response?.status === 401) {//No autenticado
      localStorage.removeItem('shs_token')
      localStorage.removeItem('shs_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// Patrón pub/sub: App.tsx se suscribe para mostrar pantalla de mantenimiento
const maintenance503Listeners = new Set<() => void>()
export function onMaintenance503(callback: () => void) {
  maintenance503Listeners.add(callback)
  return () => { maintenance503Listeners.delete(callback) }
}

//
export const authService = {// authService es un servicio de autenticación frontend
  login: (data: LoginRequest): Promise<AuthResponse> => http.post('auth/login', data).then(r => r.data),//Inicia sesión, Retorno esperado: token y datos del usuario. recibe un objeto con los datos del login, recibe una promesa que resolverá con los datos de autenticación (token, user)
  register: (data: RegisterRequest): Promise<AuthResponse> => http.post('auth/register', data).then(r => r.data),//Crea usuario, Retorno esperado: token y datos del usuario. Similar a login, pero para crear un nuevo usuario. RegisterRequest puede incluir: { email, password, nombre, apellido }.Devuelve la misma estructura que login (AuthResponse).
  me: (): Promise<AuthMeResponse> => http.get('auth/me').then(r => r.data), // Info del usuario actual, Retorno esperado: datos del usuario logueado. Función sin parámetros. consulta la información del usuario actualmente logueado. AuthMeResponse → tipo esperado del backend, por ejemplo: { id: 1, email: 'user@example.com', roles: ['admin'] }
  maintenanceStatus: (): Promise<{ enabled: boolean }> => http.get('auth/maintenance').then(r => r.data), //Consulta mantenimiento, Retorno esperado: { enabled: boolean }. Consulta si el sistema está en modo mantenimiento. Devuelve un objeto simple: { enabled: true } // o false. Útil para mostrar una pantalla de mantenimiento antes de permitir acciones del usuario.
  passwordReset: (email: string) => http.post('auth/password-reset', { email }).then(r => r.data), //Solicita restablecimiento, Retorno esperado:mensaje de backend. Envía un correo para restablecer la contraseña. email → string con el correo del usuario. POST a auth/password-reset con payload: { email: "usuario@ejemplo.com" } y .then(r => r.data) → devuelve solo la respuesta del backend.
}

export const organizationService = { //objeto que agrupa todas las funciones relacionadas con organizaciones y sus miembros.
  onboard: (data: OnboardingRequest): Promise<AuthResponse> => http.post('organizations', data).then(r => r.data),//Función para crear/registrar una nueva organización. Endpoint: POST /organizations. Retorno: AuthResponse
  me: (): Promise<OrganizationDto> => http.get('organizations/me').then(r => r.data), //Info de la organización actual. Endpoint: GET /organizations/me. Retorno: OrganizationDto 
  members: (): Promise<OrgMemberDto[]> => http.get('organizations/me/members').then(r => r.data), //Función Lista miembros. Endpoint: /organizations/me/members. Retorno: OrgMemberDto[]
  addMember: (data: CreateOrgMemberRequest): Promise<OrgMemberDto> =>
    http.post('organizations/me/members', data).then(r => r.data), //Función Agregar miembro. Endpoint: POST /organizations/me/members. Retorno: OrgMemberDto
  updateMember: (id: string, data: Partial<CreateOrgMemberRequest>): Promise<OrgMemberDto> =>
    http.patch(`organizations/me/members/${id}`, data).then(r => r.data), //Función Actualizar miembro. Endpoint: PATCH /organizations/me/members/:id. Retorno: OrgMemberDto
  removeMember: (id: string): Promise<void> => http.delete(`organizations/me/members/${id}`).then(() => undefined), //Función para Eliminar miembro. Endpoint: DELETE /organizations/me/members/:id. Retorno: void
}

export const platformService = {// objeto que agrupa funciones para administrar la plataforma, como organizaciones y usuarios.
  organizations: (): Promise<PlatformOrganizationRow[]> => http.get('platform/organizations').then(r => r.data),//Lista organizaciones. Endpoint: GET /platform/organizations. Retorno: PlatformOrganizationRow[]
  users: (): Promise<PlatformUserRow[]> => http.get('platform/users').then(r => r.data),//Lista usuarios. Endpoint: GET /platform/users. Retorno: PlatformUserRow[]
  setMaxMembers: (orgId: string, maxMembers: number) =>
    http.patch(`platform/organizations/${orgId}/max-members`, { maxMembers }).then(r => r.data),//Actualiza máximo de miembros. Endpoint: PATCH /platform/organizations/:orgId/max-members. Retorno: Datos de la organización actualizada
}

export const dashboardService = {//objeto que agrupa todas las funciones relacionadas con el dashboard de la aplicación.
  get: (): Promise<Dashboard> => http.get('dashboard').then(r => r.data), //Dashboard general. Endpoint: GET /dashboard. Retorno: Dashboard
  executive: (): Promise<ExecutiveDashboard> => http.get('dashboard/executive').then(r => r.data),//Dashboard ejecutivo. Endpoint: GET /dashboard/executive. Retorno: ExecutiveDashboard
}

export interface ProductFilters {//tipado de objeto, se defina de forma estructura de un objeto.
  lowStock?: boolean      //obejtos con stock bajo
  expiringSoon?: boolean //producto está próximo a vencer.
  stagnantDays?: number //número de días que el producto no se ha vendido.
  category?: string     //categoría del producto (ej. “bebidas”, “lácteos”).
  q?: string           // texto de búsqueda libre (query), por ejemplo para filtrar por nombre.
}

export const productService = {
  getAll: (filters?: ProductFilters): Promise<Product[]> =>
    http.get('products', { params: filters }).then(r => r.data),
  getById: (id: string): Promise<Product> => http.get(`products/${id}`).then(r => r.data),
  movements: (id: string, from?: string, to?: string): Promise<ProductMovement[]> =>
    http.get(`products/${id}/movements`, { params: { from, to } }).then(r => r.data),
  create: (data: CreateProductRequest): Promise<Product> => http.post('products', data).then(r => r.data),
  update: (id: string, data: UpdateProductRequest): Promise<Product> =>
    http.patch(`products/${id}`, data).then(r => r.data),
  delete: (id: string): Promise<void> => http.delete(`products/${id}`).then(() => undefined),
  consume: (id: string, data: AdjustRequest): Promise<Product> =>
    http.post(`products/${id}/consume`, data).then(r => r.data),
  restock: (id: string, data: AdjustRequest): Promise<Product> =>
    http.post(`products/${id}/restock`, data).then(r => r.data),
  adjust: (id: string, data: AdjustStockRequest): Promise<Product> =>
    http.post(`products/${id}/adjust`, data).then(r => r.data),
  addAlias: (id: string, alias: string) =>
    http.post(`products/${id}/aliases`, { alias }).then(r => r.data),
  listUoms: (id: string): Promise<ProductUom[]> =>
    http.get(`products/${id}/uoms`).then(r => r.data),
  replaceUoms: (id: string, items: ProductUomInput[]): Promise<ProductUom[]> =>
    http.put(`products/${id}/uoms`, { items }).then(r => r.data),
}

export const measureUnitService = {
  list: (): Promise<MeasureUnit[]> => http.get('measure-units').then(r => r.data),
  create: (data: CreateMeasureUnitRequest): Promise<MeasureUnit> =>
    http.post('measure-units', data).then(r => r.data),
  update: (id: string, data: { name?: string; active?: boolean }): Promise<MeasureUnit> =>
    http.patch(`measure-units/${id}`, data).then(r => r.data),
  delete: (id: string): Promise<void> => http.delete(`measure-units/${id}`).then(() => undefined),
}

export const supplierService = {
  list: (): Promise<Supplier[]> => http.get('suppliers').then(r => r.data),
  create: (data: CreateSupplierRequest): Promise<Supplier> => http.post('suppliers', data).then(r => r.data),
  update: (id: string, data: Partial<CreateSupplierRequest>): Promise<Supplier> =>
    http.patch(`suppliers/${id}`, data).then(r => r.data),
  delete: (id: string): Promise<void> => http.delete(`suppliers/${id}`).then(() => undefined),
}

export const purchaseService = {
  list: (params?: { productId?: string; from?: string; to?: string }): Promise<PurchasesPage> =>
    http.get('purchases', { params }).then(r => r.data),
  create: (data: Record<string, unknown>) => http.post('purchases', data).then(r => r.data),
}

export const reportService = {
  rotation: (from?: string, to?: string): Promise<RotationReport> =>
    http.get('reports/rotation', { params: { from, to } }).then(r => r.data),
  inventory: (): Promise<InventoryReport> => http.get('reports/inventory').then(r => r.data),
  byCategory: (): Promise<InventoryReport['byCategory']> => http.get('reports/by-category').then(r => r.data),
  bySupplier: (from?: string, to?: string) => http.get('reports/by-supplier', { params: { from, to } }).then(r => r.data),
  exportXlsx: (from?: string, to?: string) =>
    http.get('reports/export', { params: { from, to, format: 'xlsx' }, responseType: 'blob' }).then(r => r.data),
}

export const adminService = {
  getRbac: (): Promise<RbacMatrixResponse> => http.get('admin/rbac').then(r => r.data),
  listRoles: (): Promise<{ id: number; name: string }[]> => http.get('admin/roles').then(r => r.data),
  updatePermissions: (cells: RoleModuleCellDto[]): Promise<void> =>
    http.put('admin/rbac/permissions', { cells }).then(() => undefined),
  listUsers: (): Promise<AdminUserRowDto[]> => http.get('admin/users').then(r => r.data),
  createUser: (data: AdminCreateUserRequest): Promise<AdminUserRowDto> =>
    http.post('admin/users', data).then(r => r.data),
  updateUserRole: (userId: string, roleId: number, organizationId?: string): Promise<void> =>
    http.patch(`admin/users/${userId}/role`, { roleId, organizationId }).then(() => undefined),
  getMaintenance: (): Promise<{ enabled: boolean }> => http.get('admin/maintenance').then(r => r.data),
  setMaintenance: (enabled: boolean): Promise<void> =>
    http.put('admin/maintenance', { enabled }).then(() => undefined),
  listOrganizations: (status = 'PENDING'): Promise<PendingOrgDto[]> =>
    http.get('admin/organizations', { params: { status } }).then(r => r.data),
  reviewOrganization: (orgId: string, action: 'APPROVE' | 'REJECT'): Promise<void> =>
    http.post(`admin/organizations/${orgId}/review`, { action }).then(() => undefined),
}

export const categoryService = {
  list: (): Promise<Category[]> => http.get('categories').then(r => r.data),
  create: (data: CreateCategoryRequest): Promise<Category> =>
    http.post('categories', data).then(r => r.data),
  delete: (id: string): Promise<void> => http.delete(`categories/${id}`).then(() => undefined),
}
