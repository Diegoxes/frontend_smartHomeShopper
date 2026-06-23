import type { AuthUser } from '@/types'

export function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'MANAGER',
    orgRole: 'MANAGER',
    orgId: 'org-1',
    needsOnboarding: false,
    permissions: [],
    ...overrides,
  }
}
