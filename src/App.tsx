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

const PAGES: Record<AppPage, JSX.Element> = {
  dashboard: <DashboardPage />,
  inventory: <InventoryPage />,
  alerts:    <AlertsPage />,
  stats:     <StatsPage />,
  whatsapp:  <WhatsAppPage />,
  admin:     <AdminRolesPage />,
}

export default function App() {
  const { isAuthenticated, user } = useAuth()
  const [page, setPage] = useState<AppPage>('dashboard')

  useEffect(() => {
    if (page === 'admin' && user?.role !== 'OWNER') {
      setPage('dashboard')
    }
  }, [page, user?.role])

  if (!isAuthenticated) return <AuthPage />

  return (
    <div className="flex min-h-screen">
      <Sidebar active={page} onNav={setPage} />
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        {PAGES[page]}
      </main>
    </div>
  )
}
