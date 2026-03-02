import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOrg, useUpdateOrg } from '@/hooks/useOrg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/useToast'

const schema = z.object({ name: z.string().min(2) })
type FormValues = z.infer<typeof schema>

export function OrgSettingsPage() {
  const { data: org, isLoading } = useOrg()
  const updateOrg = useUpdateOrg()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    values: org ? { name: org.name } : undefined,
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    updateOrg.mutate(data, {
      onSuccess: () => toast({ title: 'Settings saved' }),
    })
  }

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <Card>
      <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Organization Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={org?.slug ?? ''} disabled className="bg-gray-50 text-gray-400" />
            <p className="text-xs text-gray-400">Slug cannot be changed after creation</p>
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Input value={org?.plan ?? ''} disabled className="bg-gray-50 text-gray-400 capitalize" />
          </div>
          <Button type="submit" disabled={updateOrg.isPending}>
            {updateOrg.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
