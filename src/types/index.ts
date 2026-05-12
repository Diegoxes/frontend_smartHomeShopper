// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'

export interface ModulePermission {
  key: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  whatsappNumber?: string
}

export interface AuthResponse {
  token: string
  userId: string
  name: string
  email: string
  role: UserRole
  permissions: ModulePermission[]
}

export interface AuthMeResponse {
  userId: string
  name: string
  email: string
  role: UserRole
  permissions: ModulePermission[]
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: ModulePermission[]
}

export type AppPage = 'dashboard' | 'inventory' | 'alerts' | 'stats' | 'whatsapp' | 'admin'

// ── Admin (OWNER) ─────────────────────────────────────────────────────────────
export interface AdminRoleDto {
  id: number
  name: string
}

export interface AdminModuleDto {
  id: number
  name: string
  key: string
}

export interface RoleModuleCellDto {
  roleId: number
  moduleId: number
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface RbacMatrixResponse {
  roles: AdminRoleDto[]
  modules: AdminModuleDto[]
  permissions: RoleModuleCellDto[]
}

export interface AdminUserRowDto {
  id: string
  email: string
  name: string
  whatsappNumber?: string | null
  roleId: number | null
  roleName: string | null
}

export interface AdminCreateUserRequest {
  email: string
  password: string
  name: string
  roleId: number
  whatsappNumber?: string
}

// ── Product ───────────────────────────────────────────────────────────────────
export type UnitType = 'UNIT' | 'KG' | 'LITER' | 'GRAM' | 'ML' | 'PACK'

export const UNIT_LABELS: Record<UnitType, string> = {
  UNIT:  'unid',
  KG:    'kg',
  LITER: 'L',
  GRAM:  'g',
  ML:    'ml',
  PACK:  'paq',
}

export const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'UNIT',  label: 'Unidades' },
  { value: 'KG',    label: 'Kilogramos (kg)' },
  { value: 'LITER', label: 'Litros (L)' },
  { value: 'GRAM',  label: 'Gramos (g)' },
  { value: 'ML',    label: 'Mililitros (ml)' },
  { value: 'PACK',  label: 'Paquetes' },
]

export const CATEGORIES = [
  'Lácteos', 'Cereales', 'Carnes', 'Verduras',
  'Bebidas', 'Limpieza', 'Higiene', 'Otros',
]

export interface Product {
  id: string
  name: string
  quantity: number
  minQuantity: number
  unit: UnitType
  consumptionPerUse: number
  expiryDate?: string | null
  barcode?: string | null
  category?: string | null
  imageUrl?: string | null
  lowStock: boolean
  expiringSoon: boolean
  daysUntilEmpty?: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  quantity: number
  minQuantity: number
  unit: UnitType
  consumptionPerUse: number
  expiryDate?: string | null
  barcode?: string | null
  category?: string | null
}

export type UpdateProductRequest = Partial<CreateProductRequest>

export interface AdjustRequest {
  amount: number
  note?: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface Dashboard {
  totalProducts: number
  lowStockCount: number
  expiringCount: number
  lowStockProducts: Product[]
  expiringProducts: Product[]
  allProducts: Product[]
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export type ModalState =
  | { type: 'form'; data?: Product }
  | { type: 'consume'; data: Product }
  | { type: 'restock'; data: Product }
  | null
