import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { useStyles, useDeleteStyle, useImportDefaultStyles } from '@/hooks/useStyles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'

export function StylesPage() {
  const { data: styles = [], isLoading } = useStyles()
  const deleteStyle = useDeleteStyle()
  const importDefaults = useImportDefaultStyles()
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete style "${name}"?`)) return
    deleteStyle.mutate(id, {
      onSuccess: () => toast({ title: 'Style deleted' }),
    })
  }

  const handleImportConfirm = () => {
    importDefaults.mutate(undefined, {
      onSuccess: (result) => {
        setShowImportDialog(false)
        toast({
          title: `Imported ${result.imported} styles (${result.updated} updated)`,
        })
      },
    })
  }

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Image Styles</h3>
          <p className="text-sm text-gray-500">Define transform pipelines for on-demand image resizing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Download className="mr-1.5 h-4 w-4" /> Import Defaults
          </Button>
          <Button asChild>
            <Link to="/settings/styles/new"><Plus className="mr-1.5 h-4 w-4" /> New Style</Link>
          </Button>
        </div>
      </div>

      {styles.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-400">No styles defined yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {styles.map((style) => (
            <Card key={style.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-sm">{style.name}</CardTitle>
                      <p className="text-xs text-gray-400 font-mono">{style.slug}</p>
                    </div>
                    <Badge variant="secondary">{style.output_format}</Badge>
                    <Badge variant="outline">q{style.quality}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-400 mr-2">
                      {style.operations.length} operation{style.operations.length !== 1 ? 's' : ''}
                    </p>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/settings/styles/${style.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(style.id, style.name)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import default styles?</DialogTitle>
            <DialogDescription>
              This will create any missing default styles and <strong>overwrite</strong> existing
              styles that share the same slug. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleImportConfirm}
              disabled={importDefaults.isPending}
            >
              {importDefaults.isPending ? 'Importing…' : 'Import & Overwrite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
