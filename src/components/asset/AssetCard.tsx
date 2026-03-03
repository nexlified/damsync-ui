import { Image, File, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Asset } from '@/types'
import { formatBytes } from '@/lib/format'

interface AssetCardProps {
  asset: Asset
  selected?: boolean
  onClick: () => void
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Video
  return File
}

export function AssetCard({ asset, selected, onClick }: AssetCardProps) {
  const isImage = asset.mime_type.startsWith('image/')
  const Icon = getMimeIcon(asset.mime_type)
  const title = asset.metadata?.title ?? asset.filename

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border bg-white text-left transition-all hover:border-gray-400 hover:shadow-md',
        selected ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {isImage ? (
          <img
            src={asset.url}
            alt={asset.metadata?.alt_text ?? title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="truncate text-xs font-medium text-gray-900" title={title}>{title}</p>
        <p className="text-xs text-gray-400">{formatBytes(asset.size_bytes)}</p>
      </div>
    </button>
  )
}
