import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AuthUser, AuthResponse, UserRole, ModulePermission } from '@/types'
import { authService } from '@/services/api'

interface AuthContextType {
  user: AuthUser | null
  login: (res: AuthResponse) => void
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  needsOnboarding: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function toAuthUser(res: AuthResponse | { userId: string; name: string; email: string; role: UserRole; permissions?: ModulePermission[]; platformRole?: string | null; orgRole?: string | null; orgId?: string | null; needsOnboarding?: boolean }): AuthUser {
  return {
    id: res.userId,
    name: res.name,
    email: res.email,
    role: res.role,
    platformRole: res.platformRole,
    orgRole: res.orgRole,
    orgId: res.orgId,
    needsOnboarding: res.needsOnboarding,
    permissions: res.permissions ?? [],
  }
}

function parseStoredUser(): AuthUser | null {
  const token = localStorage.getItem('shs_token')
  const stored = localStorage.getItem('shs_user')
  if (token && stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<AuthUser>
      if (parsed.id && parsed.name && parsed.email) {
        return {
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          role: parsed.role ?? 'PENDING',
          platformRole: parsed.platformRole,
          orgRole: parsed.orgRole,
          orgId: parsed.orgId,
          needsOnboarding: parsed.needsOnboarding,
          permissions: parsed.permissions ?? [],
        }
      }
    } catch {
      return null
    }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => parseStoredUser())

  const persist = useCallback((u: AuthUser | null) => {
    if (u) localStorage.setItem('shs_user', JSON.stringify(u))
    else localStorage.removeItem('shs_user')
  }, [])

  const login = useCallback((res: AuthResponse) => {
    localStorage.setItem('shs_token', res.token)
    const u = toAuthUser(res)
    persist(u)
    setUser(u)
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem('shs_token')
    persist(null)
    setUser(null)
  }, [persist])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('shs_token')
    if (!token) return
    const me = await authService.me()
    const u = toAuthUser(me)
    persist(u)
    setUser(u)
  }, [persist])

  useEffect(() => {
    const token = localStorage.getItem('shs_token')
    if (!token) return
    refreshUser().catch(() => {})
  }, [])

  const needsOnboarding = !!user?.needsOnboarding && user.role !== 'PLATFORM_OWNER'

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
