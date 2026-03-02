import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Images, BookOpen,
  LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import { useRole } from '@/hooks/useRole'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assets', label: 'Assets', icon: Images },
  { to: '/collections', label: 'Collections', icon: BookOpen },
]

const settingsItems = [
  { to: '/settings/org', label: 'General' },
  { to: '/settings/styles', label: 'Image Styles' },
  { to: '/settings/users', label: 'Users', adminOnly: true },
  { to: '/settings/api-keys', label: 'API Keys' },
  { to: '/settings/domains', label: 'Custom Domains', adminOnly: true },
  { to: '/settings/webhooks', label: 'Webhooks', adminOnly: true },
]

export function Sidebar() {
  const { clear, refreshToken, email, orgSlug } = useAuthStore()
  const { isAdmin } = useRole()

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    clear()
    window.location.href = '/login'
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900">
          <Images className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900">DAM</span>
        {orgSlug && <span className="ml-auto text-xs text-gray-400">{orgSlug}</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p className="mb-1 px-2.5 text-xs font-medium text-gray-400">Settings</p>
          <ul className="space-y-0.5">
            {settingsItems
              .filter((i) => !i.adminOnly || isAdmin)
              .map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )
                    }
                  >
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="mb-1 px-1 text-xs text-gray-500 truncate">{email}</div>
        <button
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
