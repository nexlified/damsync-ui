import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { collectionsApi } from '@/api/collections'
import { AssetGrid } from '@/components/asset/AssetGrid'
import { AssetDetail } from '@/components/asset/AssetDetail'
import type { Asset } from '@/types'
import { Loader2 } from 'lucide-react'

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const { data: collection } = useQuery({
    queryKey: ['collections', id],
    queryFn: () => collectionsApi.get(id!),
    enabled: !!id,
  })

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['collections', id, 'assets'],
    queryFn: () => collectionsApi.getAssets(id!),
    enabled: !!id,
  })

  const assets = assetsData?.data ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{collection?.name ?? '...'}</h2>
        {collection?.description && <p className="text-sm text-gray-500">{collection.description}</p>}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <AssetGrid
          assets={assets}
          selectedId={selectedAsset?.id}
          onSelect={setSelectedAsset}
        />
      )}

      <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  )
}
