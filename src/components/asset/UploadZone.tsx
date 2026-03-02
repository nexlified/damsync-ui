import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { assetsApi } from '@/api/assets'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { ASSETS_KEY } from '@/hooks/useAssets'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/format'

interface FileStatus {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface UploadZoneProps {
  open: boolean
  onClose: () => void
  folderId?: string
}

export function UploadZone({ open, onClose, folderId }: UploadZoneProps) {
  const [files, setFiles] = useState<FileStatus[]>([])
  const qc = useQueryClient()

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => ({ file: f, status: 'pending' as const })),
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending')
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i]
      const idx = files.indexOf(item)
      setFiles((prev) => prev.map((f, j) => j === idx ? { ...f, status: 'uploading' } : f))
      try {
        const fd = new FormData()
        fd.append('file', item.file)
        if (folderId) fd.append('folder_id', folderId)
        await assetsApi.upload(fd)
        setFiles((prev) => prev.map((f, j) => j === idx ? { ...f, status: 'done' } : f))
      } catch {
        setFiles((prev) => prev.map((f, j) => j === idx ? { ...f, status: 'error', error: 'Upload failed' } : f))
      }
    }
    await qc.invalidateQueries({ queryKey: [ASSETS_KEY] })
  }

  const handleClose = () => {
    setFiles([])
    onClose()
  }

  const allDone = files.length > 0 && files.every((f) => f.status === 'done')
  const hasUploading = files.some((f) => f.status === 'uploading')
  const hasPending = files.some((f) => f.status === 'pending')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            'mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop files here' : 'Drop files or click to select'}
          </p>
          <p className="text-xs text-gray-400">Any file type accepted</p>
        </div>

        {files.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
            {files.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(item.file.size)}</p>
                </div>
                {item.status === 'pending' && (
                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
                {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {item.status === 'done' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {item.status === 'error' && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">{item.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={handleClose}>
            {allDone ? 'Close' : 'Cancel'}
          </Button>
          {hasPending && (
            <Button onClick={() => void uploadAll()} disabled={hasUploading}>
              {hasUploading ? 'Uploading...' : `Upload ${files.filter((f) => f.status === 'pending').length} file(s)`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
