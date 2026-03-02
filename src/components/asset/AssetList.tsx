import { useRef, useCallback } from 'react'
import { File, Image, Video, Loader2 } from 'lucide-react'
import type { Asset } from '@/types'
import { formatBytes, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AssetListProps {
  assets: Asset[]
  selectedId?: string
  onSelect: (asset: Asset) => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
}

function MimeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-400" />
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4 text-purple-400" />
  return <File className="h-4 w-4 text-gray-400" />
}

export function AssetList({
  assets, selectedId, onSelect, isFetchingNextPage, hasNextPage, fetchNextPage
}: AssetListProps) {
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
      </div>
    )
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Name</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Type</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Size</th>
            <th className="py-2 pr-4 text-left font-medium text-gray-500">Visibility</th>
            <th className="py-2 text-left font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              onClick={() => onSelect(asset)}
              className={cn(
                'cursor-pointer border-b border-gray-100 hover:bg-gray-50',
                asset.id === selectedId && 'bg-gray-50'
              )}
            >
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <MimeIcon mimeType={asset.mime_type} />
                  <span className="truncate max-w-xs" title={asset.filename}>
                    {asset.metadata?.title ?? asset.filename}
                  </span>
                </div>
              </td>
              <td className="py-2 pr-4 text-gray-500">{asset.mime_type}</td>
              <td className="py-2 pr-4 text-gray-500">{formatBytes(asset.size_bytes)}</td>
              <td className="py-2 pr-4">
                <Badge variant={asset.visibility === 'public' ? 'success' : 'secondary'}>
                  {asset.visibility}
                </Badge>
              </td>
              <td className="py-2 text-gray-500">{formatDate(asset.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>
    </div>
  )
}
