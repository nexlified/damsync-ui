import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/assets': 'Assets',
  '/collections': 'Collections',
  '/settings/org': 'General Settings',
  '/settings/styles': 'Image Styles',
  '/settings/users': 'Users',
  '/settings/api-keys': 'API Keys',
  '/settings/domains': 'Custom Domains',
  '/settings/webhooks': 'Webhooks',
}

export function AppShell() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'DAM'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
