import { describe, it, expect } from 'vitest'
import {
  MOD,
  belongsToOrganization,
  canAccessPage,
  firstAllowedPage,
  isOrgManager,
  isPlatformOwner,
  modulePerm,
} from '@/lib/permissions'
import { makeUser } from '@/test/fixtures'
import type { ModulePermission } from '@/types'

function perm(key: string, partial: Partial<ModulePermission>): ModulePermission {
  return {
    key,
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
    ...partial,
  }
}

describe('permissions', () => {
  it('belongsToOrganization es true solo con orgId', () => {
    expect(belongsToOrganization(makeUser({ orgId: 'org-1' }))).toBe(true)
    expect(belongsToOrganization(makeUser({ orgId: null }))).toBe(false)
    expect(belongsToOrganization(null)).toBe(false)
  })

  it('isPlatformOwner detecta rol de plataforma', () => {
    expect(isPlatformOwner(makeUser({ role: 'PLATFORM_OWNER', orgId: null }))).toBe(true)
    expect(isPlatformOwner(makeUser({ platformRole: 'PLATFORM_OWNER' }))).toBe(true)
    expect(isPlatformOwner(makeUser({ role: 'MANAGER' }))).toBe(false)
  })

  it('manager tiene permisos completos por defecto en inventario', () => {
    const p = modulePerm(makeUser({ orgRole: 'MANAGER' }), MOD.INVENTORY)
    expect(p.canRead).toBe(true)
    expect(p.canCreate).toBe(true)
    expect(p.canDelete).toBe(true)
  })

  it('viewer solo puede leer inventario por defecto', () => {
    const p = modulePerm(makeUser({ orgRole: 'VIEWER' }), MOD.INVENTORY)
    expect(p.canRead).toBe(true)
    expect(p.canCreate).toBe(false)
    expect(p.canDelete).toBe(false)
  })

  it('PLATFORM_OWNER no opera módulos de negocio', () => {
    const owner = makeUser({ role: 'PLATFORM_OWNER', orgId: null, orgRole: null })
    expect(modulePerm(owner, MOD.INVENTORY).canRead).toBe(false)
    expect(canAccessPage(owner, 'inventory')).toBe(false)
    expect(canAccessPage(owner, 'platform')).toBe(true)
  })

  it('canAccessPage respeta permisos RBAC del backend', () => {
    const user = makeUser({
      orgRole: 'MEMBER',
      permissions: [perm(MOD.PURCHASES, { canRead: false })],
    })
    expect(canAccessPage(user, 'purchases')).toBe(false)
    expect(canAccessPage(user, 'inventory')).toBe(true)
  })

  it('measureUnits requiere manager o INVENTORY_UPDATE', () => {
    const member = makeUser({ orgRole: 'MEMBER' })
    expect(canAccessPage(member, 'measureUnits')).toBe(true)

    const viewer = makeUser({ orgRole: 'VIEWER' })
    expect(canAccessPage(viewer, 'measureUnits')).toBe(false)
  })

  it('firstAllowedPage redirige platform owner a plataforma', () => {
    expect(firstAllowedPage(makeUser({ role: 'PLATFORM_OWNER', orgId: null }))).toBe('platform')
  })

  it('firstAllowedPage elige dashboard para manager', () => {
    expect(firstAllowedPage(makeUser({ orgRole: 'MANAGER' }))).toBe('dashboard')
  })

  it('isOrgManager identifica managers de org', () => {
    expect(isOrgManager(makeUser({ orgRole: 'MANAGER' }))).toBe(true)
    expect(isOrgManager(makeUser({ orgRole: 'MEMBER' }))).toBe(false)
  })
})
