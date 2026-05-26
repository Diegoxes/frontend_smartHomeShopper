import type { AuthUser, ModulePermission, AppPage } from '@/types'

export const MOD = {
  INVENTORY: 'INVENTORY',
  REPORTS: 'REPORTS',
  PURCHASES: 'PURCHASES',
  USERS: 'USERS',
} as const

function emptyPerm(key: string): ModulePermission {
  return { key, canCreate: false, canRead: false, canUpdate: false, canDelete: false }
}

function fullPerm(key: string): ModulePermission {
  return { key, canCreate: true, canRead: true, canUpdate: true, canDelete: true }
}

/** Usuario que pertenece a una organización (opera inventario, compras, etc.). */
export function belongsToOrganization(user: AuthUser | null): boolean {
  return !!user?.orgId
}

/** Permisos por defecto cuando el backend aún no devolvió la matriz RBAC (org PENDING, token antiguo, etc.). */
function defaultPermForOrgRole(orgRole: string | null | undefined, key: string): ModulePermission | null {
  if (!orgRole) return null
  if (orgRole === 'MANAGER') return fullPerm(key)
  if (orgRole === 'MEMBER') {
    if (key === MOD.INVENTORY) return fullPerm(key)
    return { key, canCreate: false, canRead: true, canUpdate: false, canDelete: false }
  }
  if (orgRole === 'VIEWER') {
    return { key, canCreate: false, canRead: true, canUpdate: false, canDelete: false }
  }
  return null
}

export function modulePerm(user: AuthUser | null, key: string): ModulePermission {
  if (!user) return emptyPerm(key)

  // PLATFORM_OWNER administra la plataforma; sin org no opera módulos de negocio
  if (isPlatformOwner(user) && !belongsToOrganization(user)) {
    return emptyPerm(key)
  }

  const fromApi = user.permissions?.find(p => p.key === key)
  if (fromApi) return fromApi
  return defaultPermForOrgRole(user.orgRole, key) ?? emptyPerm(key)
}

export function isPlatformOwner(user: AuthUser | null): boolean {
  return user?.role === 'PLATFORM_OWNER' || user?.platformRole === 'PLATFORM_OWNER'
}

export function isOrgManager(user: AuthUser | null): boolean {
  return belongsToOrganization(user) && user?.orgRole === 'MANAGER'
}

export function canAccessPage(user: AuthUser | null, page: AppPage): boolean {
  if (!user) return false

  if (page === 'platform' || page === 'admin') {
    return isPlatformOwner(user)
  }

  // Inventario, compras, reportes y equipo: solo usuarios con organización
  if (!belongsToOrganization(user)) return false

  if (page === 'team') {
    return isOrgManager(user) || modulePerm(user, MOD.USERS).canRead
  }
  if (page === 'dashboard' || page === 'inventory' || page === 'alerts') {
    return modulePerm(user, MOD.INVENTORY).canRead
  }
  if (page === 'stats') return modulePerm(user, MOD.REPORTS).canRead
  if (page === 'purchases' || page === 'suppliers') return modulePerm(user, MOD.PURCHASES).canRead
  if (page === 'whatsapp') return modulePerm(user, MOD.PURCHASES).canRead
  return false
}

export function firstAllowedPage(user: AuthUser | null): AppPage {
  if (!user) return 'dashboard'

  if (isPlatformOwner(user) && !belongsToOrganization(user)) {
    return 'platform'
  }

  const order: AppPage[] = [
    'dashboard', 'inventory', 'alerts', 'purchases', 'suppliers',
    'stats', 'whatsapp', 'team', 'platform', 'admin',
  ]
  for (const p of order) {
    if (canAccessPage(user, p)) return p
  }
  return isPlatformOwner(user) ? 'platform' : 'dashboard'
}
