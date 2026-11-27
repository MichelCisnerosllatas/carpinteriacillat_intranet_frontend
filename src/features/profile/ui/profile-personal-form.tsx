'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useProfileStore } from '../stores/useProfileStore'
import type { ProfileDto } from '../model/profile.dto'

const schema = z.object({
  person_name: z.string().trim().min(1, 'El nombre es obligatorio.').max(120, 'Máximo 120 caracteres.'),
  person_lastname: z.string().trim().min(1, 'El apellido es obligatorio.').max(120, 'Máximo 120 caracteres.'),
  // Opcional: vacío o un correo válido.
  person_email: z.union([z.literal(''), z.string().trim().email('El correo personal no es válido.')]),
  id_typedoc: z.number().min(1, 'Selecciona un tipo de documento.'),
  person_numdoc: z.string().trim().min(1, 'El número de documento es obligatorio.').max(20, 'Máximo 20 caracteres.'),
})

type FormValues = z.infer<typeof schema>

type ProfilePersonalFormProps = {
  profile: ProfileDto
  /** Se llama al presionar "Cancelar" (vuelve a la vista de lectura). */
  onCancel: () => void
  /** Se llama cuando se guardó bien (vuelve a la vista de lectura). */
  onSaved: () => void
}

/** Formulario de "Datos personales" (modo edición de Mi perfil). */
export function ProfilePersonalForm({ profile, onCancel, onSaved }: ProfilePersonalFormProps) {
  const { typeDocs, loadTypeDocs, isSavingProfile, profileError, profileFieldErrors, updateProfile, resetProfileState } =
    useProfileStore()

  // Los inputs empiezan con los datos actuales.
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      person_name: profile.person?.person_name ?? '',
      person_lastname: profile.person?.person_lastname ?? '',
      person_email: profile.person?.person_email ?? '',
      id_typedoc: profile.person?.id_typedoc ?? 0,
      person_numdoc: profile.person?.person_numdoc ?? '',
    },
  })

  // Al abrir el formulario cargamos los tipos de documento; al cerrarlo limpiamos los errores.
  useEffect(() => {
    void loadTypeDocs()
    return () => resetProfileState()
  }, [loadTypeDocs, resetProfileState])

  const onSubmit = async (values: FormValues) => {
    const ok = await updateProfile({
      person_name: values.person_name,
      person_lastname: values.person_lastname,
      // Si lo dejó vacío, se guarda como "sin correo personal".
      person_email: values.person_email === '' ? null : values.person_email,
      id_typedoc: values.id_typedoc,
      person_numdoc: values.person_numdoc,
    })

    if (ok) {
      onSaved()
      return
    }
    // Errores por campo del backend (ej. "Ese documento ya lo tiene otro usuario.").
    applyApiErrors(form, useProfileStore.getState().profileFieldErrors)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {profileError && !profileFieldErrors && <AlertError message={profileError} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="person_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Tus nombres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="person_lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Tus apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_typedoc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de documento</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeDocs.map((typeDoc) => (
                      <SelectItem key={typeDoc.id_typedoc} value={String(typeDoc.id_typedoc)}>
                        {typeDoc.typedoc_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="person_numdoc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de documento</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="person_email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Correo personal (opcional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSavingProfile}>
            <X className="size-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  )
}
