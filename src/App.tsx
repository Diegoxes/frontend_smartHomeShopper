import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar       from '@/components/Sidebar'
import AuthPage      from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import AlertsPage    from '@/pages/AlertsPage'
import StatsPage     from '@/pages/StatsPage'
import WhatsAppPage  from '@/pages/WhatsAppPage'

type Page = 'dashboard' | 'inventory' | 'alerts' | 'stats' | 'whatsapp'

const PAGES: Record<Page, JSX.Element> = {
  dashboard: <DashboardPage />,
  inventory: <InventoryPage />,
  alerts:    <AlertsPage />,
  stats:     <StatsPage />,
  whatsapp:  <WhatsAppPage />,
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const [page, setPage]     = useState<Page>('dashboard')

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
