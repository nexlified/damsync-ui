import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AssetFiltersProps {
  q: string
  onQChange: (q: string) => void
  mimeGroup: string
  onMimeGroupChange: (v: string) => void
  sortBy: string
  onSortByChange: (v: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (v: 'grid' | 'list') => void
  onUpload: () => void
}

export function AssetFilters({
  q, onQChange, mimeGroup, onMimeGroupChange,
  sortBy, onSortByChange, viewMode, onViewModeChange, onUpload,
}: AssetFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        placeholder="Search assets..."
        className="w-48"
      />
      <Select value={mimeGroup} onValueChange={onMimeGroupChange}>
        <SelectTrigger className="w-32">
          <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="image">Images</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="document">Documents</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at_desc">Newest first</SelectItem>
          <SelectItem value="created_at_asc">Oldest first</SelectItem>
          <SelectItem value="name_asc">Name A-Z</SelectItem>
          <SelectItem value="size_desc">Largest first</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1">
        <Button
          size="icon"
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button onClick={onUpload} className="ml-2">
          Upload
        </Button>
      </div>
    </div>
  )
}
