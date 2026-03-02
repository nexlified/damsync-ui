import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useStyle, useCreateStyle, useUpdateStyle } from '@/hooks/useStyles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { StyleOperation } from '@/types'
import { toast } from '@/hooks/useToast'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  output_format: z.string(),
  quality: z.number().min(1).max(100),
})
type FormValues = z.infer<typeof schema>

export function StyleFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing } = useStyle(id ?? '')
  const createStyle = useCreateStyle()
  const updateStyle = useUpdateStyle()

  const [operations, setOperations] = useState<StyleOperation[]>(
    existing?.operations ?? []
  )

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    values: existing ? {
      name: existing.name,
      slug: existing.slug,
      output_format: existing.output_format,
      quality: existing.quality,
    } : {
      output_format: 'webp',
      quality: 85,
      name: '',
      slug: '',
    },
    resolver: zodResolver(schema),
  })

  const outputFormat = watch('output_format')

  const addOp = () => setOperations((ops) => [...ops, { type: 'resize', width: 800 }])
  const removeOp = (idx: number) => setOperations((ops) => ops.filter((_, i) => i !== idx))
  const updateOp = (idx: number, patch: Partial<StyleOperation>) => {
    setOperations((ops) => ops.map((op, i) => i === idx ? { ...op, ...patch } : op))
  }

  const onSubmit = (data: FormValues) => {
    const payload = { ...data, operations }
    if (isEdit) {
      updateStyle.mutate({ id: id!, data: payload }, {
        onSuccess: () => { toast({ title: 'Style updated' }); void navigate('/settings/styles') },
      })
    } else {
      createStyle.mutate(payload, {
        onSuccess: () => { toast({ title: 'Style created' }); void navigate('/settings/styles') },
      })
    }
  }

  const isPending = createStyle.isPending || updateStyle.isPending

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h3 className="font-medium">{isEdit ? 'Edit Style' : 'New Style'}</h3>
        <p className="text-sm text-gray-500">Define a named image transform pipeline</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input placeholder="Thumbnail" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input placeholder="thumbnail" {...register('slug')} />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={(v) => setValue('output_format', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Quality (1–100)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  {...register('quality', { valueAsNumber: true })}
                />
                {errors.quality && <p className="text-xs text-red-500">{errors.quality.message}</p>}
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Operations</Label>
                <Button type="button" size="sm" variant="outline" onClick={addOp}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {operations.length === 0 && (
                <p className="text-xs text-gray-400">No operations — the image will only be reformatted</p>
              )}
              {operations.map((op, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-md border border-gray-200 p-2">
                  <GripVertical className="mt-1.5 h-4 w-4 text-gray-300 shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={op.type} onValueChange={(v) => updateOp(idx, { type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resize">Resize</SelectItem>
                          <SelectItem value="crop">Crop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {op.type === 'resize' && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Fit</Label>
                          <Select value={op.fit ?? 'contain'} onValueChange={(v) => updateOp(idx, { fit: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contain">Contain</SelectItem>
                              <SelectItem value="cover">Cover</SelectItem>
                              <SelectItem value="fill">Fill</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Width</Label>
                          <Input
                            type="number"
                            value={op.width ?? ''}
                            onChange={(e) => updateOp(idx, { width: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="e.g. 800"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Height</Label>
                          <Input
                            type="number"
                            value={op.height ?? ''}
                            onChange={(e) => updateOp(idx, { height: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="e.g. 600"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <button type="button" onClick={() => removeOp(idx)} className="mt-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => void navigate('/settings/styles')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Update Style' : 'Create Style'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
