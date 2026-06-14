'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { swalConfirm, swalError, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { useRoleListStore } from '@/features/roles/stores/useRoleListStore'
import { useRoleFormStore } from '@/features/roles/stores/useRoleFormStore'
import { AlertError } from '@/widgets/alerts_components'

// ─── Schema ──────────────────────────────────────────────────────────────────

const roleFormSchema = z.object({
  role_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  role_description: z.string().optional(),
  role_state:       z.coerce.number(),
})

type FormValues = z.infer<typeof roleFormSchema>

interface RoleFormProps {
  mode: 'create' | 'edit'
  id?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RoleForm({ mode, id }: RoleFormProps) {
  const router  = useRouter()
  const { currentRole, roles }                                      = useRoleListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useRoleFormStore()

  const isEdit = mode === 'edit'

  const resolvedRole =
    currentRole ??
    (id ? roles.find((r) => r.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      role_name:        '',
      role_description: '',
      role_state:       1,
    },
  })

  useEffect(() => {
    if (isEdit && resolvedRole) {
      form.reset({
        role_name:        resolvedRole.name,
        role_description: resolvedRole.description ?? '',
        role_state:       resolvedRole.status === 'active' ? 1 : 0,
      })
    }
  }, [isEdit, resolvedRole?.id])

  useEffect(() => () => reset(), [])

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title:       isEdit ? '¿Guardar cambios?' : '¿Crear rol?',
      text:        values.role_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText:  'Cancelar',
    })
    if (!confirmed) return

    let success: boolean

    if (!isEdit) {
      success = await create({
        role_name:        values.role_name,
        role_description: values.role_description,
        role_state:       String(values.role_state),
        role_created_at:  formatDatetime(),
      })
    } else {
      if (!resolvedRole?.id) {
        await swalError('Error', 'No se encontraron los datos del rol a editar.')
        return
      }

      success = await update({
        id: resolvedRole.id,
        data: {
          role_name:        values.role_name,
          role_description: values.role_description ?? '',
          role_state:       values.role_state,
          role_updated_at:  formatDatetime(),
        },
      })
    }

    if (success) {
      await swalSuccess(
        isEdit ? 'Rol actualizado' : 'Rol creado',
        values.role_name
      )
      router.push('/roles')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <Card>
          <CardContent className="pt-6">
            <SectionTitle>Datos del Rol</SectionTitle>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

              <FormField
                control={form.control}
                name="role_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Administrador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      key={`role_state-${field.value}`}
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Activo</SelectItem>
                        <SelectItem value="0">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del rol (opcional)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </CardContent>
        </Card>

        <Separator />

        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}

        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/roles')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar Cambios' : 'Crear Rol'
            }
          </Button>
        </div>

      </form>
    </Form>
  )
}

// ── Small helper ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-primary" />
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  )
}
