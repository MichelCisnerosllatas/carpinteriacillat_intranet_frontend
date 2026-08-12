// src/features/auth/ui/forgot-password-form.tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { authService } from '@/features/auth/services/auth.service'
import { applyApiErrors } from '@/shared/lib/api-errors'

const schema = z.object({
  email: z.email({ error: (i) => (i.input === '' ? 'Ingresa tu correo electrónico.' : undefined) }),
})

type FormValues = z.infer<typeof schema>

interface ForgotPasswordFormProps extends React.HTMLAttributes<HTMLFormElement> {}

export function ForgotPasswordForm({ className, ...props }: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await authService.forgotPassword(data.email)

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'No se pudo enviar el correo de recuperación')
      }

      setSentTo(data.email)
    } catch (err: any) {
      const fieldErrors = err?.response?.data?.errors
      if (fieldErrors) applyApiErrors(form, fieldErrors)

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'No se pudo enviar el correo de recuperación'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        <AlertDescription className="text-current">
          Si <strong>{sentTo}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-4', className)} {...props}>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
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
                    disabled={isSubmitting}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2 h-11 w-full font-semibold" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>
      </form>
    </Form>
  )
}
