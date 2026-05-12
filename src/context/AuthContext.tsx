import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AuthUser, AuthResponse, UserRole, ModulePermission } from '@/types'
import { authService } from '@/services/api'

interface AuthContextType {
  user: AuthUser | null
  login: (res: AuthResponse) => void
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function parseStoredUser(): AuthUser | null {
  const token = localStorage.getItem('shs_token')
  const stored = localStorage.getItem('shs_user')
  if (token && stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<AuthUser> & Record<string, unknown>
      const role = (parsed.role as UserRole | undefined) ?? 'MEMBER'
      const permissions = (parsed.permissions as ModulePermission[] | undefined) ?? []
      if (parsed.id && parsed.name && parsed.email) {
        return { id: parsed.id, name: parsed.name, email: parsed.email, role, permissions }
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

  const login = useCallback(
    (res: AuthResponse) => {
      localStorage.setItem('shs_token', res.token)
      const u: AuthUser = {
        id: res.userId,
        name: res.name,
        email: res.email,
        role: res.role,
        permissions: res.permissions ?? [],
      }
      persist(u)
      setUser(u)
    },
    [persist]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('shs_token')
    persist(null)
    setUser(null)
  }, [persist])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('shs_token')
    if (!token) return
    const me = await authService.me()
    const u: AuthUser = {
      id: me.userId,
      name: me.name,
      email: me.email,
      role: me.role,
      permissions: me.permissions ?? [],
    }
    persist(u)
    setUser(u)
  }, [persist])

  useEffect(() => {
    const token = localStorage.getItem('shs_token')
    if (!token) return
    refreshUser().catch(() => {
      /* sesión inválida: 401 lo limpia en interceptor */
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar con sesión guardada; tras login vienen permisos en la respuesta
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
