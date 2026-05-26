import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import AuthPage from '@/pages/AuthPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import AlertsPage from '@/pages/AlertsPage'
import StatsPage from '@/pages/StatsPage'
import WhatsAppPage from '@/pages/WhatsAppPage'
import PurchasesPage from '@/pages/PurchasesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import OrgTeamPage from '@/pages/OrgTeamPage'
import AdminRolesPage from '@/pages/AdminRolesPage'
import PlatformAdminPage from '@/pages/PlatformAdminPage'
import type { AppPage } from '@/types'
import { canAccessPage, firstAllowedPage, isPlatformOwner } from '@/lib/permissions'
import { onMaintenance503 } from '@/services/api'
import { LuWrench } from 'react-icons/lu'

const PAGES: Record<AppPage, JSX.Element> = {
  dashboard: <DashboardPage />,
  inventory: <InventoryPage />,
  alerts: <AlertsPage />,
  stats: <StatsPage />,
  whatsapp: <WhatsAppPage />,
  purchases: <PurchasesPage />,
  suppliers: <SuppliersPage />,
  team: <OrgTeamPage />,
  admin: <AdminRolesPage />,
  platform: <PlatformAdminPage />,
}

function MaintenanceBlockScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pearl px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <LuWrench className="w-8 h-8 text-orange-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Sistema en mantenimiento</h1>
      <p className="text-sm text-slate-600 max-w-md mb-8">
        Solo el administrador de plataforma puede usar la aplicación en este modo.
      </p>
      <button type="button" className="btn-primary px-6" onClick={onLogout}>Cerrar sesión</button>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, user, logout, needsOnboarding } = useAuth()
  const [page, setPage] = useState<AppPage>('dashboard')
  const [blockedByMaintenance, setBlockedByMaintenance] = useState(false)

  useEffect(() => onMaintenance503(() => setBlockedByMaintenance(true)), [])
  useEffect(() => { if (!isAuthenticated) setBlockedByMaintenance(false) }, [isAuthenticated])
  useEffect(() => {
    if (!user) return
    setPage(firstAllowedPage(user))
  }, [user?.id, user?.role, user?.orgId])

  useEffect(() => {
    if (!user) return
    if (!canAccessPage(user, page)) setPage(firstAllowedPage(user))
  }, [page, user])

  if (!isAuthenticated) return <AuthPage />
  if (needsOnboarding) return <OnboardingPage />
  if (blockedByMaintenance && !isPlatformOwner(user)) {
    return <MaintenanceBlockScreen onLogout={logout} />
  }

  return (
    <div className="flex min-h-screen bg-pearl">
      <Sidebar active={page} onNav={setPage} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{PAGES[page]}</div>
      </main>
    </div>
  )
}
