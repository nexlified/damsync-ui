import { useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { Asset } from '@/types'
import { AssetCard } from './AssetCard'

interface AssetGridProps {
  assets: Asset[]
  selectedId?: string
  onSelect: (asset: Asset) => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
}

export function AssetGrid({
  assets, selectedId, onSelect, isFetchingNextPage, hasNextPage, fetchNextPage
}: AssetGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node || !hasNextPage || !fetchNextPage) return
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage()
    })
    observerRef.current.observe(node)
  }, [hasNextPage, fetchNextPage])

  if (assets.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No assets found</p>
        <p className="text-xs text-gray-300">Upload files to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            selected={asset.id === selectedId}
            onClick={() => onSelect(asset)}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>
    </div>
  )
}
