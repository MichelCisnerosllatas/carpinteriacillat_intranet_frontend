'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useProfileStore } from '../stores/useProfileStore'

type ChangeLoginEmailFormProps = {
  /** Correo de acceso actual: el nuevo debe ser distinto. */
  currentEmail: string
  onCancel: () => void
  onDone: () => void
}

/** Cambia el correo con el que el usuario inicia sesión. Pide la contraseña actual para confirmar. */
export function ChangeLoginEmailForm({ currentEmail, onCancel, onDone }: ChangeLoginEmailFormProps) {
  const { isChangingEmail, emailError, emailFieldErrors, changeLoginEmail, resetEmailState } = useProfileStore()

  const schema = z.object({
    email: z
      .string()
      .trim()
      .email('El correo no es válido.')
      .refine((value) => value.toLowerCase() !== currentEmail.toLowerCase(), 'Es el mismo correo que ya usas.'),
    current_password: z.string().min(1, 'Ingresa tu contraseña actual.'),
  })

  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', current_password: '' },
  })

  // Al cerrar el formulario limpiamos los errores.
  useEffect(() => () => resetEmailState(), [resetEmailState])

  const onSubmit = async (values: FormValues) => {
    const ok = await changeLoginEmail(values)
    if (ok) {
      onDone()
      return
    }
    applyApiErrors(form, useProfileStore.getState().emailFieldErrors)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {emailError && !emailFieldErrors && <AlertError message={emailError} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuevo correo de acceso</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="nuevo@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isChangingEmail}>
            <X className="size-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isChangingEmail}>
            {isChangingEmail ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Cambiar correo
          </Button>
        </div>
      </form>
    </Form>
  )
}
