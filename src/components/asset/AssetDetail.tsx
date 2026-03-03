import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ExternalLink, Trash2, Copy, Check } from 'lucide-react'
import type { Asset } from '@/types'
import { useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets'
import { assetsApi } from '@/api/assets'
import { formatBytes, formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from '@/hooks/useToast'

interface AssetDetailProps {
  asset: Asset | null
  onClose: () => void
}

interface MetaForm {
  title: string
  description: string
  alt_text: string
  author: string
  visibility: 'public' | 'private' | 'org'
}

export function AssetDetail({ asset, onClose }: AssetDetailProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const updateMutation = useUpdateAsset()
  const deleteMutation = useDeleteAsset()

  const { register, handleSubmit, reset, setValue, watch } = useForm<MetaForm>({
    values: asset ? {
      title: asset.metadata?.title ?? '',
      description: asset.metadata?.description ?? '',
      alt_text: asset.metadata?.alt_text ?? '',
      author: asset.metadata?.author ?? '',
      visibility: asset.visibility,
    } : undefined,
  })

  const visibility = watch('visibility')

  const onSave = (data: MetaForm) => {
    if (!asset) return
    updateMutation.mutate({
      id: asset.id,
      data: {
        visibility: data.visibility,
        metadata: {
          title: data.title || undefined,
          description: data.description || undefined,
          alt_text: data.alt_text || undefined,
          author: data.author || undefined,
        },
      },
    }, {
      onSuccess: () => toast({ title: 'Saved', description: 'Asset updated successfully' }),
    })
  }

  const handleDelete = () => {
    if (!asset || !confirm('Delete this asset? This cannot be undone.')) return
    deleteMutation.mutate(asset.id, {
      onSuccess: () => { onClose(); toast({ title: 'Deleted' }) },
    })
  }

  const handleGetSignedUrl = async () => {
    if (!asset) return
    const { url } = await assetsApi.getSignedUrl(asset.id, 3600)
    setSignedUrl(url)
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isImage = asset?.mime_type.startsWith('image/')

  return (
    <Sheet open={!!asset} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {asset && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="truncate">{asset.metadata?.title ?? asset.filename}</SheetTitle>
            </SheetHeader>

            {/* Preview */}
            {isImage && (
              <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={asset.url}
                  alt={asset.metadata?.alt_text ?? asset.filename}
                  className="w-full object-contain max-h-48"
                />
              </div>
            )}

            {/* Info */}
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div><span className="font-medium text-gray-700">Size:</span> {formatBytes(asset.size_bytes)}</div>
              {asset.width && <div><span className="font-medium text-gray-700">Dimensions:</span> {asset.width}×{asset.height}</div>}
              <div><span className="font-medium text-gray-700">Type:</span> {asset.mime_type}</div>
              <div><span className="font-medium text-gray-700">Created:</span> {formatDateTime(asset.created_at)}</div>
            </div>

            {/* Tags */}
            {asset.tags?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {asset.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                ))}
              </div>
            )}

            {/* Edit form */}
            <form onSubmit={(e) => void handleSubmit(onSave)(e)} className="space-y-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input placeholder={asset.filename} {...register('title')} />
              </div>
              <div className="space-y-1">
                <Label>Alt Text</Label>
                <Input placeholder="Describe the image" {...register('alt_text')} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input {...register('description')} />
              </div>
              <div className="space-y-1">
                <Label>Author</Label>
                <Input {...register('author')} />
              </div>
              <div className="space-y-1">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setValue('visibility', v as MetaForm['visibility'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="org">Org only</SelectItem>
                    <SelectItem value="private">Private (signed URL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>

            {/* CDN URL */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Input readOnly value={asset.url} className="text-xs" />
                <Button size="icon" variant="outline" onClick={() => void handleCopy(asset.url)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline"><ExternalLink className="h-4 w-4" /></Button>
                </a>
              </div>

              {asset.visibility === 'private' && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => void handleGetSignedUrl()}>
                    Get Signed URL (1h)
                  </Button>
                </div>
              )}
              {signedUrl && (
                <div className="flex items-center gap-2">
                  <Input readOnly value={signedUrl} className="text-xs" />
                  <Button size="icon" variant="outline" onClick={() => void handleCopy(signedUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>

            {/* Reset */}
            <button onClick={() => reset()} className="mt-2 text-xs text-gray-400 hover:text-gray-600">
              Reset changes
            </button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
