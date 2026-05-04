'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { cn, sleep } from '@/shared/lib/utils'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { toastError, toastSuccess } from '@/shared/lib/toast'

const schema = z.object({
  email: z.email({ error: (i) => (i.input === '' ? 'Ingresa tu correo electrónico.' : undefined) }),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type FormValues = z.infer<typeof schema>

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignInForm({ className, redirectTo, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()
  const {login, loginDataDTO, error} = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    setServerError(null)

    const ok = await login(data.email, data.password);
    if (!ok) {
      setIsLoading(false);
      toastError("Credenciales incorrectas", "verifica tus credenciales nuevamente");
      return;
    }

    toastSuccess("Bienvenido a la intranet", `Has iniciado sesión exitosamente ${loginDataDTO?.person?.person_name} ${loginDataDTO?.person?.person_lastname}`)
    router.replace('/dashboard')

    // toast.promise(sleep(900), {
    //   loading: 'Validando credenciales...',
    //   success: () => {
    //     setIsLoading(false);
    //
    //     // auth.setUser({
    //     //   accountNo: 'ACC001',
    //     //   email: data.email,
    //     //   role: ['user'],
    //     //   exp: Date.now() + 24 * 60 * 60 * 1000,
    //     // })
    //     // auth.setAccessToken('mock-access-token')
    //     router.replace(redirectTo ?? '/dashboard')
    //     return 'Bienvenido a la intranet.'
    //   },
    //   error: () => {
    //     setIsLoading(false)
    //     setServerError('No se pudo iniciar sesión. Verifica tus credenciales.')
    //     return 'No se pudo iniciar sesión.'
    //   },
    // })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-4', className)} {...props}>
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@empresa.com"
                    className="h-11 pl-10"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>Contraseña</FormLabel>
                <Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <FormControl>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="[&_input]:h-11 [&_input]:pl-10 [&_input]:pr-10"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2 h-11 w-full font-semibold" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {isLoading ? 'Ingresando...' : 'Ingresar al sistema'}
        </Button>
      </form>
    </Form>
  )
}