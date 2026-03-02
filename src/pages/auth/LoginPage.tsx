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
  org_slug: z.string().min(1, 'Org slug is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.login(data),
    onSuccess: (tokens) => {
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
          <CardTitle>Sign in to DAM</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="org_slug">Organization Slug</Label>
              <Input id="org_slug" placeholder="my-org" {...register('org_slug')} />
              {errors.org_slug && <p className="text-xs text-red-500">{errors.org_slug.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            {mutation.isError && (
              <p className="text-xs text-red-500">Invalid credentials. Please try again.</p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
