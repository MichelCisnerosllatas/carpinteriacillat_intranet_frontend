'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Info, Loader2 } from 'lucide-react'

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

import {
  Camera,
  IdCard,
  KeyRound,
  UserRoundCheck,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'

import { ENTITY_STATES } from '@/shared/config/entity-states'
import { swalConfirm, swalError, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { useUserListStore } from '@/features/users/stores/useUserListStore'
import { useUserFormStore } from '@/features/users/stores/useUserFormStore'
import { TypeDocSelect } from '@/features/typedocs/ui/typedoc-select'
import { RoleSelect } from '@/features/roles/ui/role-select'
import { PersonPhotoPicker } from './person-photo-picker'
import { AlertError } from '@/widgets/alerts_components'
import { formatDatetime } from '@/shared/lib/utils'

// ─── Schema ──────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  person_name:      z.string().min(1, 'El nombre es requerido.'),
  person_lastname:  z.string().min(1, 'El apellido es requerido.'),
  person_photo_url: z.string().nullable(),
  id_tipodoc:       z.number().min(1, 'Selecciona un tipo de documento.'),
  person_numdoc:    z.string().min(1, 'El número de documento es requerido.'),
  email:            z.string().email('Correo electrónico inválido.'),
  id_rol:           z.number().min(1, 'Selecciona un rol.'),
  user_state:       z.number(),
})

const createSchema = baseSchema.extend({
  password:              z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  password_confirmation: z.string().min(1, 'Confirma la contraseña.'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden.',
  path:    ['password_confirmation'],
})

const editSchema = baseSchema.extend({
  // Cadena vacía = no cambiar la contraseña actual (se filtra antes de enviar al API).
  password:              z.string().refine((v) => v.length === 0 || v.length >= 8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  }),
  password_confirmation: z.string(),
}).refine((data) => data.password.length === 0 || data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden.',
  path:    ['password_confirmation'],
})

type FormValues = z.infer<typeof createSchema>

interface UserFormProps {
  mode: 'create' | 'edit'
  id?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserForm({ mode, id }: UserFormProps) {
  const router  = useRouter()
  const { currentUser, users, fetchById }   = useUserListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useUserFormStore()

  const isEdit = mode === 'edit'

  const resolvedUser =
    currentUser ??
    (id ? users.find((u) => u.id === Number(id)) ?? null : null)

  // Si se entra directo (o se refresca) la ruta de edición, el store puede no tener nada
  // cargado todavía (ni `currentUser` ni la lista) — sin esto el formulario se quedaba con los
  // campos vacíos/en 0 en vez de mostrar los datos reales del usuario.
  const [userNotFound, setUserNotFound] = useState(false)

  useEffect(() => {
    if (!isEdit || resolvedUser || !id) return

    fetchById(Number(id)).then((found) => {
      if (!found) setUserNotFound(true)
    })
  }, [isEdit, resolvedUser, id, fetchById])

  // Cuentas aprobadas desde Accesos Google entran con contraseña aleatoria e inutilizable — no
  // se les muestra el input de contraseña acá. Vuelven a mostrarlo en cuanto la persona define
  // una propia vía "¿Olvidaste tu contraseña?" (el backend actualiza `registration_provider`).
  const isGoogleAccount   = isEdit && resolvedUser?.authProvider === 'google'
  const showPasswordFields = !isGoogleAccount

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
    defaultValues: {
      person_name:           '',
      person_lastname:       '',
      person_photo_url:      null,
      id_tipodoc:            0,
      person_numdoc:         '',
      email:                 '',
      password:              '',
      password_confirmation: '',
      id_rol:                0,
      user_state:            1,
    },
  })

  useEffect(() => {
    if (isEdit && resolvedUser) {
      form.reset({
        person_name:           resolvedUser.firstName,
        person_lastname:       resolvedUser.lastName,
        person_photo_url:      resolvedUser.photoUrl ?? null,
        id_tipodoc:            resolvedUser.idTypeDoc ?? 0,
        person_numdoc:         resolvedUser.documentNumber === '-' ? '' : resolvedUser.documentNumber,
        email:                 resolvedUser.email,
        password:              '',
        password_confirmation: '',
        id_rol:                resolvedUser.idRole ?? 0,
        user_state:            resolvedUser.status === 'active' ? 1 : 0,
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
      person_name:      values.person_name,
      person_lastname:  values.person_lastname,
      person_photo_url: values.person_photo_url,
      id_typedoc:       values.id_tipodoc,
      person_numdoc:    values.person_numdoc,
      person_state:     values.user_state,
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
          // En blanco = no tocar la contraseña actual.
          ...(values.password ? { password: values.password } : {}),
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

  if (isEdit && !resolvedUser) {
    if (userNotFound) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">No se encontró el usuario solicitado.</p>
          <Button variant="outline" onClick={() => router.push('/users')}>
            Volver al listado
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando datos del usuario...
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* =========================================================
            ZONA SUPERIOR
            FOTO + DATOS PERSONALES
        ========================================================= */}
        <div
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[260px_minmax(0,1fr)]
          "
        >
          {/* =======================================================
              CARD: FOTO DE PERFIL
          ======================================================= */}
          <Card
            className="
              overflow-hidden
              border-border/70
              bg-card
              shadow-sm
            "
          >
            <CardContent className="p-0">

              {/* HEADER */}
              <div
                className="
                  border-b
                  border-border/60
                  bg-gradient-to-br
                  from-primary/10
                  via-primary/5
                  to-transparent
                  px-5
                  py-4
                "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                      text-primary
                    "
                  >
                    <Camera className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                        truncate
                        text-sm
                        font-semibold
                      "
                    >
                      Foto de perfil
                    </h3>

                    <p
                      className="
                        truncate
                        text-xs
                        text-muted-foreground
                      "
                    >
                      Imagen del usuario
                    </p>
                  </div>
                </div>
              </div>

              {/* FOTO */}
              <div
                className="
                  flex
                  flex-col
                  items-center
                  px-5
                  py-6
                  text-center
                "
              >
                <FormField
                  control={form.control}
                  name="person_photo_url"
                  render={({ field }) => {
                    const previewName =
                      `${form.watch('person_name')} ${form.watch('person_lastname')}`.trim() ||
                      'Usuario'

                    return (
                      <FormItem
                        className="
                          flex
                          flex-col
                          items-center
                          gap-3
                        "
                      >
                        <FormControl>
                          <PersonPhotoPicker
                            value={field.value}
                            onChange={field.onChange}
                            name={previewName}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />                
              </div>
            </CardContent>
          </Card>


          {/* =======================================================
              CARD: DATOS PERSONALES
          ======================================================= */}
          <Card
            className="
              overflow-hidden
              border-border/70
              bg-card
              shadow-sm
            "
          >
            <CardContent className="p-0">

              {/* HEADER */}
              <div
                className="
                  border-b
                  border-border/60
                  px-5
                  py-4
                  sm:px-6
                "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      size-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                      text-primary
                    "
                  >
                    <UserRound className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="
                        text-sm
                        font-semibold
                        sm:text-base
                      "
                    >
                      Datos personales
                    </h2>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-muted-foreground
                      "
                    >
                      Información e identificación del usuario
                    </p>
                  </div>
                </div>
              </div>


              {/* CAMPOS */}
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-5
                  gap-y-5
                  p-5
                  sm:grid-cols-2
                  sm:p-6
                "
              >
                {/* NOMBRE */}
                <FormField
                  control={form.control}
                  name="person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre
                        <span className="ml-1 text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Ej: Juan"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* APELLIDO */}
                <FormField
                  control={form.control}
                  name="person_lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Apellido
                        <span className="ml-1 text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Ej: Pérez"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* TIPO DE DOCUMENTO */}
                <FormField
                  control={form.control}
                  name="id_tipodoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <IdCard
                          className="
                            size-3.5
                            text-muted-foreground
                          "
                        />

                        Tipo de Documento

                        <span className="text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <TypeDocSelect
                          value={field.value}
                          onValueChange={(v) =>
                            field.onChange(v ?? 0)
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* NÚMERO DE DOCUMENTO */}
                <FormField
                  control={form.control}
                  name="person_numdoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <IdCard
                          className="
                            size-3.5
                            text-muted-foreground
                          "
                        />

                        Número de Documento

                        <span className="text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Ej: 12345678"
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
        </div>


        {/* =========================================================
            CARD: ACCESO Y SEGURIDAD
        ========================================================= */}
        <Card
          className="
            overflow-hidden
            border-border/70
            bg-card
            shadow-sm
          "
        >
          <CardContent className="p-0">

            {/* HEADER */}
            <div
              className="
                border-b
                border-border/60
                px-5
                py-4
                sm:px-6
              "
            >
              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    size-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <ShieldCheck className="size-4" />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      text-sm
                      font-semibold
                      sm:text-base
                    "
                  >
                    Acceso y seguridad
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Credenciales, permisos y estado de la cuenta
                  </p>
                </div>
              </div>
            </div>


            <div className="p-5 sm:p-6">

              {/* ===================================================
                  INFORMACIÓN PRINCIPAL DE LA CUENTA
              =================================================== */}
              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-5
                  gap-y-5
                  sm:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {/* EMAIL */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className="
                          flex
                          items-center
                          gap-1.5
                        "
                      >
                        <Mail
                          className="
                            size-3.5
                            text-muted-foreground
                          "
                        />

                        Correo Electrónico

                        <span className="text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* ROL */}
                <FormField
                  control={form.control}
                  name="id_rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Rol
                        <span className="ml-1 text-destructive">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <RoleSelect
                          value={String(field.value)}
                          onValueChange={(v) =>
                            field.onChange(Number(v))
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* ESTADO */}
                <FormField
                  control={form.control}
                  name="user_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Estado
                      </FormLabel>

                      <Select
                        key={`user_state-${field.value}`}
                        value={String(field.value)}
                        onValueChange={(v) =>
                          field.onChange(Number(v))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {ENTITY_STATES.map((s) => (
                            <SelectItem
                              key={s.value}
                              value={String(s.value)}
                            >
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {/* ===================================================
                  CONTRASEÑA
              =================================================== */}
              {showPasswordFields && (
                <>
                  <Separator className="my-6" />

                  {/* SUB HEADER */}
                  <div
                    className="
                      mb-4
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        size-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-muted
                        text-muted-foreground
                      "
                    >
                      <KeyRound className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-sm
                          font-medium
                          text-foreground
                        "
                      >
                        Contraseña
                      </p>

                      <p
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Configura las credenciales de acceso
                      </p>
                    </div>
                  </div>


                  {/* PASSWORD FIELDS */}
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-5
                      sm:grid-cols-2
                    "
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isEdit
                              ? 'Nueva Contraseña'
                              : 'Contraseña'}

                            {!isEdit && (
                              <span className="ml-1 text-destructive">
                                *
                              </span>
                            )}
                          </FormLabel>

                          <FormControl>
                            <PasswordInput
                              placeholder={
                                isEdit
                                  ? 'Dejar en blanco para no cambiarla'
                                  : 'Mínimo 8 caracteres'
                              }
                              {...field}
                            />
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
                          <FormLabel>
                            Confirmar Contraseña

                            {!isEdit && (
                              <span className="ml-1 text-destructive">
                                *
                              </span>
                            )}
                          </FormLabel>

                          <FormControl>
                            <PasswordInput
                              placeholder="Repite la contraseña"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}


              {/* ===================================================
                  CUENTA GOOGLE
              =================================================== */}
              {isGoogleAccount && (
                <>
                  <Separator className="my-6" />

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      rounded-xl
                      border
                      border-border/70
                      bg-muted/30
                      p-4
                      sm:flex-row
                      sm:items-start
                    "
                  >
                    {/* CUENTA VINCULADA A GOOGLE */}
                    <div
                      className="
                        relative
                        flex
                        size-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-border
                        bg-background
                        text-muted-foreground
                      "
                    >
                      <UserRoundCheck className="size-5" />

                      {/* Badge Google */}
                      <div
                        className="
                          absolute
                          -right-1
                          -bottom-1
                          flex
                          size-5
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          border-background
                          bg-white
                        "
                      >
                        <i
                          className="
                            fa-brands
                            fa-google
                            text-[10px]
                            text-gray-700
                          "
                        />
                      </div>
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-foreground
                        "
                      >
                        Cuenta vinculada con Google
                      </p>

                      <p
                        className="
                          mt-1
                          max-w-3xl
                          text-xs
                          leading-relaxed
                          text-muted-foreground
                        "
                      >
                        Esta cuenta inicia sesión con Google y no tiene
                        contraseña propia. Para habilitar el acceso mediante
                        contraseña, la persona debe utilizar{' '}

                        <span
                          className="
                            font-medium
                            text-foreground/80
                          "
                        >
                          &quot;¿Olvidaste tu contraseña?&quot;
                        </span>{' '}

                        desde la pantalla de inicio de sesión.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>


        {/* =========================================================
            ERROR DEL API
        ========================================================= */}
        {error && (
          <AlertError
            title={
              isEdit
                ? 'Error al actualizar'
                : 'Error al crear'
            }
            message={error}
            apiError={
              fieldErrors
                ? { errors: fieldErrors }
                : undefined
            }
          />
        )}


        {/* =========================================================
            BOTONES
        ========================================================= */}
        <div
          className="
            flex
            flex-col-reverse
            gap-2

            border-t
            border-border/60

            pt-4
            pb-6

            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:gap-3
          "
        >
          {/* CANCELAR */}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/users')}
            disabled={isSubmitting}
            className="
              w-full
              sm:w-auto
            "
          >
            <X className="mr-2 size-4" />

            Cancelar
          </Button>


          {/* GUARDAR */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full
              min-w-36
              sm:w-auto
            "
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="
                    mr-2
                    size-4
                    animate-spin
                  "
                />

                {isEdit
                  ? 'Guardando...'
                  : 'Creando...'}
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />

                {isEdit
                  ? 'Guardar Cambios'
                  : 'Crear Usuario'}
              </>
            )}
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
