import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { CollectionsPage } from '@/pages/collections/CollectionsPage'
import { CollectionDetailPage } from '@/pages/collections/CollectionDetailPage'
import { SettingsLayout } from '@/pages/settings/SettingsLayout'
import { OrgSettingsPage } from '@/pages/settings/OrgSettingsPage'
import { StylesPage } from '@/pages/settings/StylesPage'
import { StyleFormPage } from '@/pages/settings/StyleFormPage'
import { DomainsPage } from '@/pages/settings/DomainsPage'
import { UsersPage } from '@/pages/settings/UsersPage'
import { APIKeysPage } from '@/pages/settings/APIKeysPage'
import { WebhooksPage } from '@/pages/settings/WebhooksPage'
import { WebhookDetailPage } from '@/pages/settings/WebhookDetailPage'

function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/assets', element: <AssetsPage /> },
          { path: '/collections', element: <CollectionsPage /> },
          { path: '/collections/:id', element: <CollectionDetailPage /> },
          {
            path: '/settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="/settings/org" replace /> },
              { path: 'org', element: <OrgSettingsPage /> },
              { path: 'styles', element: <StylesPage /> },
              { path: 'styles/new', element: <StyleFormPage /> },
              { path: 'styles/:id/edit', element: <StyleFormPage /> },
              { path: 'domains', element: <DomainsPage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'api-keys', element: <APIKeysPage /> },
              { path: 'webhooks', element: <WebhooksPage /> },
              { path: 'webhooks/:id', element: <WebhookDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
