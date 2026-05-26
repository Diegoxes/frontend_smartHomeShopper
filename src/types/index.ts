// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'PLATFORM_OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER' | 'PENDING'

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
  platformRole?: string | null
  orgRole?: string | null
  orgId?: string | null
  needsOnboarding?: boolean
  permissions: ModulePermission[]
}

export interface AuthMeResponse extends AuthResponse {}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  platformRole?: string | null
  orgRole?: string | null
  orgId?: string | null
  needsOnboarding?: boolean
  permissions: ModulePermission[]
}

export type AppPage =
  | 'dashboard'
  | 'inventory'
  | 'alerts'
  | 'stats'
  | 'whatsapp'
  | 'purchases'
  | 'suppliers'
  | 'team'
  | 'admin'
  | 'platform'

// ── Organization ──────────────────────────────────────────────────────────────
export interface OnboardingRequest {
  name: string
  industry?: string
  currency?: string
  country?: string
  timezone?: string
}

export interface OrganizationDto {
  id: string
  name: string
  industry?: string
  currency: string
  country?: string
  timezone?: string
  maxMembers: number
  expiryAlertDays?: number
  predictionHorizonDays?: number
}

export interface OrgMemberDto {
  id: string
  userId: string
  email: string
  name: string
  orgRole: string
  whatsappNumber?: string
}

export interface CreateOrgMemberRequest {
  email: string
  password: string
  name: string
  orgRole: string
  whatsappNumber?: string
}

export interface PlatformOrganizationRow {
  id: string
  name: string
  industry?: string
  memberCount: number
  maxMembers: number
  createdAt?: string
}

export interface PlatformUserRow {
  id: string
  email: string
  name: string
  orgName?: string
  orgRole?: string
  platformRole?: string
}

// ── Admin (PLATFORM_OWNER) ────────────────────────────────────────────────────
export interface AdminRoleDto { id: number; name: string }
export interface AdminModuleDto { id: number; name: string; key: string }
export interface RoleModuleCellDto {
  roleId: number; moduleId: number
  canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean
}
export interface RbacMatrixResponse {
  roles: AdminRoleDto[]; modules: AdminModuleDto[]; permissions: RoleModuleCellDto[]
}
export interface AdminUserRowDto {
  id: string; email: string; name: string
  whatsappNumber?: string | null; roleId: number | null; roleName: string | null
}
export interface AdminCreateUserRequest {
  email: string; password: string; name: string; roleId: number; whatsappNumber?: string
}

// ── Product ───────────────────────────────────────────────────────────────────
export type UnitType = 'UNIT' | 'KG' | 'LITER' | 'GRAM' | 'ML' | 'PACK'

export const UNIT_LABELS: Record<UnitType, string> = {
  UNIT: 'unid', KG: 'kg', LITER: 'L', GRAM: 'g', ML: 'ml', PACK: 'paq',
}

export const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'UNIT', label: 'Unidades' },
  { value: 'KG', label: 'Kilogramos (kg)' },
  { value: 'LITER', label: 'Litros (L)' },
  { value: 'GRAM', label: 'Gramos (g)' },
  { value: 'ML', label: 'Mililitros (ml)' },
  { value: 'PACK', label: 'Paquetes' },
]

// Categorías deprecadas - ahora se cargan dinámicamente desde el backend
export const CATEGORIES = [
  'General', 'Alimentos', 'Bebidas', 'Limpieza', 'Electrónica',
  'Ropa', 'Herramientas', 'Servicios', 'Otros',
]

export interface Category {
  id: string
  name: string
  description?: string
  colorHex?: string
  createdAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  colorHex?: string
}

export interface Product {
  id: string
  sku?: string
  internalCode?: string
  name: string
  quantity: number
  minQuantity: number
  unit: UnitType | string
  consumptionPerUse: number
  expiryDate?: string | null
  barcode?: string | null
  category?: string | null
  imageUrl?: string | null
  salePrice?: number | null
  lastCost?: number | null
  avgCost?: number | null
  marginPercent?: number | null
  purchaseUnit?: string | null
  unitsPerPurchaseUnit?: number | null
  lowStock: boolean
  expiringSoon: boolean
  daysUntilEmpty?: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  internalCode?: string
  quantity: number
  minQuantity: number
  unit: UnitType
  consumptionPerUse: number
  expiryDate?: string | null
  barcode?: string | null
  category?: string | null
  salePrice?: number | null
}

export type UpdateProductRequest = Partial<CreateProductRequest>

export interface AdjustRequest {
  amount: number
  note?: string
  supplierId?: string
  unitPrice?: number
}

export interface AdjustStockRequest {
  delta: number
  reason: string
}

export interface ProductMovement {
  at: string
  actionType: string
  quantityChange: number
  source?: string
  note?: string
  purchaseId?: string
}

// ── Suppliers & Purchases ─────────────────────────────────────────────────────
export interface Supplier {
  id: string; name: string; phone?: string; leadTimeDays?: number; notes?: string
}

export interface CreateSupplierRequest {
  name: string; phone?: string; leadTimeDays?: number; notes?: string
}

export interface PurchaseRow {
  id: string; productId: string; productName: string
  supplierId?: string; supplierName?: string
  quantity: number; unitPrice?: number; totalAmount?: number
  currency?: string; purchasedAt: string; source?: string
}

export interface PurchasesPage {
  items: PurchaseRow[]
  periodTotalSpend: number
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface RotationReportRow {
  productId: string; productName: string; category: string
  unitsConsumed: number; avgDailyConsumption?: number
  estimatedDaysRemaining?: number; velocity: string
}

export interface RotationReport {
  fromInclusive: string; toInclusive: string; rows: RotationReportRow[]
}

export interface CategoryBreakdown {
  category: string; skuCount: number; quantitySum: number; estimatedSpend: number
}

export interface InventoryReport {
  totalSku: number; totalEstimatedValue: number
  byCategory: CategoryBreakdown[]
  topConsumed30d: RotationReportRow[]
  stagnantProductIds: string[]
}

export interface ExecutiveDashboard {
  totalStockValue: number
  monthPurchaseSpend: number
  lowStockCount: number
  expiringCount: number
  topRotation: RotationReportRow[]
  stagnantProductIds: string[]
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

export type ModalState =
  | { type: 'form'; data?: Product }
  | { type: 'consume'; data: Product }
  | { type: 'restock'; data: Product }
  | { type: 'adjust'; data: Product }
  | { type: 'history'; data: Product }
  | null
