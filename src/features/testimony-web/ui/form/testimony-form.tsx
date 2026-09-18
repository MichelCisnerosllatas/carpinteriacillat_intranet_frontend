'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { StarRatingInput } from '@/shared/ui/star-rating-input'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { useTestimonyListStore } from '../../stores/useTestimonyListStore'
import { useTestimonyFormStore } from '../../stores/useTestimonyFormStore'
import { useTestimonySectionStore } from '../../stores/useTestimonySectionStore'
import { TESTIMONY_RATING_MAX, TESTIMONY_RATING_MIN } from '../../data/data'

const schema = z.object({
  testimony_name:         z.string().min(1, 'El nombre es requerido.').max(255),
  testimony_role:         z.string().max(255).optional(),
  testimony_city:         z.string().max(255).optional(),
  testimony_email:        z.string().email('El correo no es válido.').max(255).optional().or(z.literal('')),
  testimony_rating:       z.number().min(TESTIMONY_RATING_MIN, 'Mínimo 0.').max(TESTIMONY_RATING_MAX, 'Máximo 5.').nullable().optional(),
  testimony_message:      z.string().min(1, 'El mensaje es requerido.'),
  id_image:               z.number().nullable().optional(),
  testimony_is_delivered: z.boolean(),
  testimony_is_verified:  z.boolean(),
  testimony_state:        z.number(),
})

type FormValues = z.infer<typeof schema>

export function TestimonyForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const isEdit  = mode === 'edit'

  const { currentItem, items, loadById, setCurrentItem }            = useTestimonyListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useTestimonyFormStore()
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  // En la práctica existe una única sección de testimonios en todo el sitio — al crear se
  // resuelve sola (sin selector); al editar se usa la del registro (`resolved.idSection`), nunca
  // se permite mover un testimonio de sección desde este form.
  const { idSection: sectionIdSection, isError: isSectionError, error: sectionError, get: getSection } = useTestimonySectionStore()
  useEffect(() => { if (!isEdit) void getSection() }, [isEdit])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      testimony_name: '',
      testimony_role: '',
      testimony_city: '',
      testimony_email: '',
      testimony_rating: null,
      testimony_message: '',
      id_image: null,
      testimony_is_delivered: true,
      testimony_is_verified: true,
      testimony_state: 1,
    },
  })

  // Siempre trae el registro fresco del backend al editar — no depende de que la tabla ya esté cargada en memoria.
  useEffect(() => {
    if (isEdit && id) { void loadById(Number(id)) }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        testimony_name:         resolved.name,
        testimony_role:         resolved.role ?? '',
        testimony_city:         resolved.city ?? '',
        testimony_email:        resolved.email ?? '',
        testimony_rating:       resolved.rating,
        testimony_message:      resolved.message,
        id_image:               resolved.idImage,
        testimony_is_delivered: resolved.isDelivered,
        testimony_is_verified:  resolved.isVerified,
        testimony_state:        resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const [showImageUpload, setShowImageUpload] = useState(false)

  const onSubmit = async (values: FormValues) => {
    const idSection = isEdit ? resolved!.idSection : sectionIdSection
    if (idSection === null) return

    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear testimonio?',
      text: values.testimony_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          id_section:               idSection,
          id_image:                 values.id_image,
          testimony_name:           values.testimony_name,
          testimony_role:           values.testimony_role,
          testimony_city:           values.testimony_city,
          testimony_email:          values.testimony_email,
          testimony_rating:         values.testimony_rating,
          testimony_message:        values.testimony_message,
          testimony_is_delivered:   values.testimony_is_delivered,
          testimony_is_verified:    values.testimony_is_verified,
          testimony_state:          values.testimony_state,
          testimony_updated_at:     formatDatetime(),
        })
      : await create({
          id_section:               idSection,
          id_image:                 values.id_image,
          testimony_name:           values.testimony_name,
          testimony_role:           values.testimony_role,
          testimony_city:           values.testimony_city,
          testimony_email:          values.testimony_email,
          testimony_rating:         values.testimony_rating,
          testimony_message:        values.testimony_message,
          testimony_is_delivered:   values.testimony_is_delivered,
          testimony_is_verified:    values.testimony_is_verified,
          testimony_state:          values.testimony_state,
          testimony_created_at:     formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.testimony_name)
      goBackOrFallback(router, '/testimony')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        {!isEdit && isSectionError && (
          <AlertError title="No se pudo resolver la sección de testimonios" message={sectionError ?? undefined} />
        )}

        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="testimony_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: María Gómez" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="testimony_role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol / Cargo</FormLabel>
                  <FormControl><Input placeholder="Ej: Cliente" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="testimony_city" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl><Input placeholder="Ej: Lima" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="testimony_email" render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl><Input type="email" placeholder="Ej: cliente@correo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="testimony_rating" render={({ field }) => (
              <FormItem>
                <FormLabel>Valoración</FormLabel>
                <FormControl>
                  <StarRatingInput value={field.value ?? null} onChange={field.onChange} />
                </FormControl>
                <FormDescription>Opcional, de {TESTIMONY_RATING_MIN} a {TESTIMONY_RATING_MAX} estrellas — click en la mitad de un ícono para medias estrellas.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="testimony_message" render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje <span className="text-destructive">*</span></FormLabel>
                <FormControl><Textarea rows={5} placeholder="Testimonio del cliente..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_image" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Foto</FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />Nueva
                  </button>
                </div>
                <FormControl>
                  <ImageSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar foto (opcional)"
                    showAll
                  />
                </FormControl>
                <FormDescription>Opcional — se muestra junto al testimonio en el sitio web.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="testimony_is_delivered" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <FormLabel className="font-normal">Proyecto entregado</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="testimony_is_verified" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <FormLabel className="font-normal">Cliente verificado</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="testimony_state" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select key={`state-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ENTITY_STATES.map((s) => (
                      <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/testimony')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || (!isEdit && sectionIdSection === null)} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>

      <ImageQuickUploadDialog
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onUploaded={(item) => {
          form.setValue('id_image', item.id_image, { shouldValidate: true, shouldDirty: true })
        }}
      />
    </Form>
  )
}
