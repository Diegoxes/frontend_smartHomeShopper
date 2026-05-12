import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar       from '@/components/Sidebar'
import AuthPage      from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import AlertsPage    from '@/pages/AlertsPage'
import StatsPage     from '@/pages/StatsPage'
import WhatsAppPage  from '@/pages/WhatsAppPage'
import AdminRolesPage from '@/pages/AdminRolesPage'
import type { AppPage } from '@/types'
import { canAccessPage, firstAllowedPage } from '@/lib/permissions'
import { onMaintenance503 } from '@/services/api'

const PAGES: Record<AppPage, JSX.Element> = {
  dashboard: <DashboardPage />,
  inventory: <InventoryPage />,
  alerts:    <AlertsPage />,
  stats:     <StatsPage />,
  whatsapp:  <WhatsAppPage />,
  admin:     <AdminRolesPage />,
}

function MaintenanceBlockScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <p className="text-4xl mb-4">🔧</p>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Sistema en mantenimiento</h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        Solo el administrador (OWNER) puede usar la aplicación en este modo. Cierra sesión o contacta a tu administrador.
      </p>
      <button type="button" className="btn-primary px-6" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const [page, setPage] = useState<AppPage>('dashboard')
  const [blockedByMaintenance, setBlockedByMaintenance] = useState(false)

  useEffect(() => {
    return onMaintenance503(() => setBlockedByMaintenance(true))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) setBlockedByMaintenance(false)
  }, [isAuthenticated])

  useEffect(() => {
    if (!user) return
    if (!canAccessPage(user, page)) {
      setPage(firstAllowedPage(user))
    }
  }, [page, user])

  if (!isAuthenticated) return <AuthPage />

  if (blockedByMaintenance && user?.role !== 'OWNER') {
    return <MaintenanceBlockScreen onLogout={logout} />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={page} onNav={setPage} />
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        {PAGES[page]}
      </main>
    </div>
  )
}
