import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Images } from 'lucide-react'

const schema = z.object({
  org_name: z.string().min(2, 'Name must be at least 2 characters'),
  org_slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.register(data),
    onSuccess: ({ tokens }) => {
      setTokens(tokens)
      void navigate('/')
    },
  })

  const onSubmit = (data: FormValues) => mutation.mutate(data)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
            <Images className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>Get started with DAM</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="org_name">Organization Name</Label>
              <Input id="org_name" placeholder="Acme Inc" {...register('org_name')} />
              {errors.org_name && <p className="text-xs text-red-500">{errors.org_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org_slug">Organization Slug</Label>
              <Input id="org_slug" placeholder="acme-inc" {...register('org_slug')} />
              {errors.org_slug && <p className="text-xs text-red-500">{errors.org_slug.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            {mutation.isError && (
              <p className="text-xs text-red-500">Registration failed. The slug may already be taken.</p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
