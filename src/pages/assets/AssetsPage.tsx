import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAssets } from '@/hooks/useAssets'
import { useFolderTree } from '@/hooks/useFolders'
import { FolderTree } from '@/components/asset/FolderTree'
import { AssetGrid } from '@/components/asset/AssetGrid'
import { AssetList } from '@/components/asset/AssetList'
import { AssetDetail } from '@/components/asset/AssetDetail'
import { AssetFilters } from '@/components/asset/AssetFilters'
import { UploadZone } from '@/components/asset/UploadZone'
import type { Asset } from '@/types'
import { Loader2 } from 'lucide-react'

export function AssetsPage() {
  const [searchParams] = useSearchParams()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [mimeGroup, setMimeGroup] = useState('all')
  const [sortBy, setSortBy] = useState('created_at_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploadOpen, setUploadOpen] = useState(false)

  const [sortField, sortDir] = useMemo(() => {
    const parts = sortBy.split('_')
    const dir = parts.pop() as 'asc' | 'desc'
    return [parts.join('_'), dir]
  }, [sortBy])

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading } = useAssets({
    folder_id: folderId,
    q: q || undefined,
    mime_group: mimeGroup !== 'all' ? mimeGroup : undefined,
    sort_by: sortField,
    sort_dir: sortDir,
    limit: 48,
  })

  const { data: folders = [] } = useFolderTree()

  const assets = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  return (
    <div className="flex gap-0 h-full -m-6">
      {/* Folder tree */}
      <FolderTree
        folders={folders}
        selectedId={folderId}
        onSelect={setFolderId}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden p-6">
        <AssetFilters
          q={q}
          onQChange={setQ}
          mimeGroup={mimeGroup}
          onMimeGroupChange={setMimeGroup}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUpload={() => setUploadOpen(true)}
        />

        <div className="mt-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : viewMode === 'grid' ? (
            <AssetGrid
              assets={assets}
              selectedId={selectedAsset?.id}
              onSelect={setSelectedAsset}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
            />
          ) : (
            <AssetList
              assets={assets}
              selectedId={selectedAsset?.id}
              onSelect={setSelectedAsset}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AssetDetail
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Upload dialog */}
      <UploadZone
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={folderId}
      />
    </div>
  )
}
