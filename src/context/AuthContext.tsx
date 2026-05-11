import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser, AuthResponse, UserRole } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  login: (res: AuthResponse) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('shs_token')
    const stored = localStorage.getItem('shs_user')
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AuthUser> & Record<string, unknown>
        const role = (parsed.role as UserRole | undefined) ?? 'MEMBER'
        return { id: parsed.id!, name: parsed.name!, email: parsed.email!, role }
      } catch {
        return null
      }
    }
    return null
  })

  const login = useCallback((res: AuthResponse) => {
    localStorage.setItem('shs_token', res.token)
    const u: AuthUser = { id: res.userId, name: res.name, email: res.email, role: res.role }
    localStorage.setItem('shs_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('shs_token')
    localStorage.removeItem('shs_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
