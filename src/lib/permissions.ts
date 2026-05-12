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

/** Permisos efectivos del módulo; OWNER sin lista en localStorage antiguo recibe acceso completo. */
export function modulePerm(user: AuthUser | null, key: string): ModulePermission {
  if (!user) return emptyPerm(key)
  if (user.role === 'OWNER' && (!user.permissions || user.permissions.length === 0)) {
    return fullPerm(key)
  }
  return user.permissions.find(p => p.key === key) ?? emptyPerm(key)
}

export function canAccessPage(user: AuthUser | null, page: AppPage): boolean {
  if (!user) return false
  if (page === 'admin') return user.role === 'OWNER'
  if (page === 'dashboard' || page === 'inventory' || page === 'alerts') {
    return modulePerm(user, MOD.INVENTORY).canRead
  }
  if (page === 'stats') return modulePerm(user, MOD.REPORTS).canRead
  if (page === 'whatsapp') return modulePerm(user, MOD.PURCHASES).canRead
  return false
}

export function firstAllowedPage(user: AuthUser | null): AppPage {
  if (!user) return 'dashboard'
  const order: AppPage[] = ['dashboard', 'inventory', 'alerts', 'stats', 'whatsapp', 'admin']
  for (const p of order) {
    if (canAccessPage(user, p)) return p
  }
  return 'dashboard'
}
