import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/useRole'

const navItems = [
  { to: '/settings/org', label: 'General' },
  { to: '/settings/styles', label: 'Image Styles' },
  { to: '/settings/users', label: 'Users', adminOnly: true },
  { to: '/settings/api-keys', label: 'API Keys' },
  { to: '/settings/domains', label: 'Domains', adminOnly: true },
  { to: '/settings/webhooks', label: 'Webhooks', adminOnly: true },
]

export function SettingsLayout() {
  const { isAdmin } = useRole()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Settings</h2>
        <p className="text-sm text-gray-500">Manage your organization settings</p>
      </div>
      <div className="flex gap-6">
        <nav className="w-40 shrink-0">
          <ul className="space-y-0.5">
            {navItems.filter((i) => !i.adminOnly || isAdmin).map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-1.5 text-sm transition-colors',
                      isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
