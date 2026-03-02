import { HardDrive, Images, FolderOpen, TrendingUp } from 'lucide-react'
import { useOrgStorage, useOrg } from '@/hooks/useOrg'
import { useAssets } from '@/hooks/useAssets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetCard } from '@/components/asset/AssetCard'
import { formatBytes } from '@/lib/format'
import type { Asset } from '@/types'
import { useState } from 'react'
import { AssetDetail } from '@/components/asset/AssetDetail'

function StorageBar({ used, quota }: { used: number; quota: number }) {
  const pct = quota > 0 ? Math.min((used / quota) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(quota)} total</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-gray-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% used</p>
    </div>
  )
}

export function DashboardPage() {
  const { data: org } = useOrg()
  const { data: storage } = useOrgStorage()
  const { data: recentData } = useAssets({ sort_by: 'created_at', sort_dir: 'desc', limit: 8 })
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const recent = recentData?.pages?.[0]?.data ?? []
  const total = recentData?.pages?.[0]?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Welcome back{org ? `, ${org.name}` : ''}</h2>
        <p className="text-sm text-gray-500">Here's an overview of your DAM</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Images className="h-3.5 w-3.5" /> Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" /> Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{storage ? formatBytes(storage.used_bytes) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" /> Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{org?.plan ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Quota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{storage ? formatBytes(storage.quota_bytes) : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage bar */}
      {storage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <StorageBar used={storage.used_bytes} quota={storage.quota_bytes} />
          </CardContent>
        </Card>
      )}

      {/* Recent uploads */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Uploads</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {recent.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
            ))}
          </div>
        </div>
      )}

      <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  )
}
