'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { PasswordInput } from '@/shared/ui/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { toastSuccess } from '@/shared/lib/toast'
import { AlertError } from '@/widgets/alerts_components'
import { useProfileStore } from '../stores/useProfileStore'

const schema = z
  .object({
    current_password: z.string().min(1, 'Ingresa tu contraseña actual.'),
    password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    password_confirmation: z.string().min(1, 'Confirma la nueva contraseña.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })
  .refine((d) => d.password !== d.current_password, {
    message: 'La nueva contraseña debe ser distinta de la actual.',
    path: ['password'],
  })

type FormValues = z.infer<typeof schema>

/** Cambio de contraseña del usuario autenticado (pide la actual). */
export function ChangePasswordForm() {
  const { isChangingPassword, passwordError, passwordFieldErrors, changePassword, resetPasswordState } = useProfileStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  useEffect(() => () => resetPasswordState(), [resetPasswordState])

  const onSubmit = async (values: FormValues) => {
    const ok = await changePassword(values)
    if (ok) {
      toastSuccess('Contraseña actualizada', 'Usa la nueva contraseña la próxima vez que inicies sesión.')
      form.reset()
      return
    }
    applyApiErrors(form, useProfileStore.getState().passwordFieldErrors)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {passwordError && !passwordFieldErrors && <AlertError message={passwordError} />}

        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contraseña</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contraseña</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Repite la nueva contraseña" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </Form>
  )
}
