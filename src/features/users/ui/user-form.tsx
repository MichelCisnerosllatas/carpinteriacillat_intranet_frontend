'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
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
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import { useUserFormStore } from '@/features/users/stores/useUserFormStore'
import { TypeDocSelect } from '@/features/typedoc/ui/typedoc-select'
import { RoleSelect } from '@/features/role/ui/role-select'
import { AlertError } from '@/widgets/alerts_components'
import { formatDatetime } from '@/shared/lib/utils'

// ─── Schema ──────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  person_name:     z.string().min(1, 'El nombre es requerido.'),
  person_lastname: z.string().min(1, 'El apellido es requerido.'),
  id_tipodoc:      z.coerce.number().min(1, 'Selecciona un tipo de documento.'),
  person_numdoc:   z.string().min(1, 'El número de documento es requerido.'),
  email:           z.string().email('Correo electrónico inválido.'),
  id_rol:          z.coerce.number().min(1, 'Selecciona un rol.'),
  user_state:      z.coerce.number(),
})

const createSchema = baseSchema.extend({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

const editSchema = baseSchema.extend({
  password: z.string().optional(),
})

type FormValues = z.infer<typeof createSchema>

interface UserFormProps {
  mode: 'create' | 'edit'
  id?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserForm({ mode, id }: UserFormProps) {
  const router  = useRouter()
  const { currentUser, users }              = useUserListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useUserFormStore()

  const isEdit = mode === 'edit'

  const resolvedUser =
    currentUser ??
    (id ? users.find((u) => u.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
    defaultValues: {
      person_name:     '',
      person_lastname: '',
      id_tipodoc:      0,
      person_numdoc:   '',
      email:           '',
      password:        '',
      id_rol:          0,
      user_state:      1,
    },
  })

  useEffect(() => {
    if (isEdit && resolvedUser) {
      form.reset({
        person_name:     resolvedUser.firstName,
        person_lastname: resolvedUser.lastName,
        id_tipodoc:      resolvedUser.idTypeDoc ?? 0,
        person_numdoc:   resolvedUser.documentNumber === '-' ? '' : resolvedUser.documentNumber,
        email:           resolvedUser.email,
        password:        '',
        id_rol:          resolvedUser.idRole ?? 0,
        user_state:      resolvedUser.status === 'active' ? 1 : 0,
      })
    }
  }, [isEdit, resolvedUser?.id])

  useEffect(() => () => reset(), [])

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title:       isEdit ? '¿Guardar cambios?' : '¿Crear usuario?',
      text:        `${values.person_name} ${values.person_lastname}`,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText:  'Cancelar',
    })
    if (!confirmed) return

    const personData = {
      person_name:     values.person_name,
      person_lastname: values.person_lastname,
      id_typedoc:      values.id_tipodoc,
      person_numdoc:   values.person_numdoc,
      person_state:    values.user_state,
      ...(!isEdit && {person_created_at: formatDatetime()}),
      ...(isEdit && {person_updated_at: formatDatetime()}),
    }

    let success: boolean

    if (!isEdit) {
      success = await create({
        personData,
        userData: {
          email:      values.email,
          password:   values.password!,
          id_rol:     values.id_rol,
          user_state: values.user_state,
          ...(!isEdit && {user_created_at: formatDatetime()}),
        },
      })
    } else {
      const idPerson = resolvedUser?.idPerson
      const idUser   = resolvedUser?.id

      if (!idPerson || !idUser) {
        await swalError('Error', 'No se encontraron los datos del usuario a editar.')
        return
      }

      success = await update({
        idPerson,
        idUser,
        personData,
        userData: {
          email:      values.email,
          id_rol:     values.id_rol,
          user_state: values.user_state,
        },
      })
    }

    if (success) {
      await swalSuccess(
        isEdit ? 'Usuario actualizado' : 'Usuario creado',
        `${values.person_name} ${values.person_lastname}`
      )
      router.push('/users')
    } else {
      // Mapea nombres del API → nombres del form cuando difieren
      applyApiErrors(form, fieldErrors, {
        id_typedoc:   'id_tipodoc',  // API: id_typedoc  → form: id_tipodoc
        person_state: 'user_state',  // API: person_state → form: user_state (campo unificado)
      })
      // El AlertError en el JSX mostrará `error` automáticamente (estado reactivo)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* ── Cards en 2 columnas en desktop ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Datos Personales */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle>Datos Personales</SectionTitle>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                <FormField
                  control={form.control}
                  name="person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl><Input placeholder="Ej: Juan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="person_lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl><Input placeholder="Ej: Pérez" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="id_tipodoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <FormControl>
                        <TypeDocSelect
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="person_numdoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento</FormLabel>
                      <FormControl><Input placeholder="Ej: 12345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </CardContent>
          </Card>

          {/* Datos de Acceso */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle>Datos de Acceso</SectionTitle>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Mínimo 8 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="id_rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <RoleSelect
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        key={`user_state-${field.value}`}
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

              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Actions ── */}
        <Separator />
        {/* ── Error banner del API ── */}
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
            onClick={() => router.push('/users')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar Cambios' : 'Crear Usuario'
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
