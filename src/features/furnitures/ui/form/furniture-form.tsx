'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Images, Loader2, Sofa } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { toastError } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { CategorySelect } from '@/features/categories/ui/category-select'
import { TypeColorSelect } from '@/features/typecolors/ui/typecolor-select'
import { TypeWoodSelect } from '@/features/typewoods/ui/typewood-select'
import { ImageSelect } from '@/features/images/ui/image-select'
import { FurnitureGalleryManager, type GalleryEntry, type PendingGalleryItem, type ReorderedGalleryItem } from '@/features/furnitures_images/ui/gallery/furniture-gallery-manager'
import { useFurnitureImageFormStore } from '@/features/furnitures_images/stores/useFurnitureImageFormStore'
import { useFurnitureListStore } from '../../stores/useFurnitureListStore'
import { useFurnitureFormStore } from '../../stores/useFurnitureFormStore'

const schema = z.object({
  furniture_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  furniture_description: z.string().max(2000, 'Máximo 2000 caracteres.').optional(),
  furniture_largo:       z.number().nullable().optional(),
  furniture_ancho:       z.number().nullable().optional(),
  furniture_state:       z.number(),
  id_category:           z.number({ error: 'Seleccione la categoría.' }),
  id_typecolor:          z.number({ error: 'Seleccione el tipo de color.' }),
  id_typewood:           z.number({ error: 'Seleccione el tipo de madera.' }),
  id_image:              z.number().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

export function FurnitureForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router   = useRouter()
  const { currentItem, items, meta, loadById, setCurrentItem }      = useFurnitureListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useFurnitureFormStore()
  const { bulkCreate, bulkReorder, bulkRemove, error: galleryError, fieldErrors: galleryFieldErrors, isSubmitting: isGallerySubmitting } = useFurnitureImageFormStore()
  const isBusy   = isSubmitting || isGallerySubmitting
  const isEdit   = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  // Refs: only needed at submit time, not for rendering
  const pendingGalleryItemsRef   = useRef<PendingGalleryItem[]>([])
  const removedGalleryIdsRef     = useRef<number[]>([])
  const reorderedGalleryItemsRef = useRef<ReorderedGalleryItem[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      furniture_name: '', furniture_description: '',
      furniture_largo: null, furniture_ancho: null,
      furniture_state: 1, id_category: undefined,
      id_typecolor: undefined, id_typewood: undefined, id_image: null,
    },
  })

  // Always fetch fresh data when opening edit form
  useEffect(() => {
    if (isEdit && id) {
      void loadById(Number(id))
    }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        furniture_name:        resolved.name,
        furniture_description: resolved.description ?? '',
        furniture_largo:       resolved.largo,
        furniture_ancho:       resolved.ancho,
        furniture_state:       resolved.stateValue,
        id_category:           resolved.idCategory,
        id_typecolor:          resolved.idTypecolor,
        id_typewood:           resolved.idTypewood,
        id_image:              resolved.idImage,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  // Map resolved gallery to GalleryEntry[]
  const initialGallery: GalleryEntry[] = (resolved?.galleryImages ?? []).map((g) => ({
    localKey:          `init-${g.id}`,
    furnitureImageId:  g.id,
    imageId:           g.imageId,
    imageUrl:          g.imageUrl,
    imageName:         g.imageName,
  }))

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear mueble?',
      text: values.furniture_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    if (isEdit) {
      const ok = await update(resolved!.id, {
        furniture_name:        values.furniture_name,
        furniture_description: values.furniture_description,
        furniture_largo:       values.furniture_largo,
        furniture_ancho:       values.furniture_ancho,
        furniture_state:       values.furniture_state,
        id_category:           values.id_category,
        id_typecolor:          values.id_typecolor,
        id_typewood:           values.id_typewood,
        id_image:              values.id_image,
        furniture_updated_at:  formatDatetime(),
      })
      if (ok) {
        const pending   = pendingGalleryItemsRef.current
        const removed   = removedGalleryIdsRef.current
        const reordered = reorderedGalleryItemsRef.current
        console.log('[FurnitureForm] gallery submit →', { pending, removed, reordered })

        if (pending.length > 0) {
          const ok2 = await bulkCreate(resolved!.id, pending)
          if (!ok2) { toastError('Error al agregar imágenes de galería'); return }
        }
        if (removed.length > 0) {
          const ok3 = await bulkRemove(removed)
          if (!ok3) { toastError('Error al eliminar imágenes de galería'); return }
        }
        if (reordered.length > 0) {
          const ok4 = await bulkReorder(reordered)
          if (!ok4) { toastError('Error al guardar el orden de la galería'); return }
        }
        await swalSuccess('Actualizado', values.furniture_name)
        router.push('/furnitures')
      } else {
        applyApiErrors(form, fieldErrors)
      }
    } else {
      const createdId = await create({
        furniture_name:        values.furniture_name,
        furniture_description: values.furniture_description,
        furniture_largo:       values.furniture_largo,
        furniture_ancho:       values.furniture_ancho,
        furniture_state:       values.furniture_state,
        furniture_order:       (meta?.total ?? 0) + 1,
        id_category:           values.id_category,
        id_typecolor:          values.id_typecolor,
        id_typewood:           values.id_typewood,
        id_image:              values.id_image,
        furniture_created_at:  formatDatetime(),
      })
      if (createdId !== null) {
        const pending = pendingGalleryItemsRef.current
        if (pending.length > 0) {
          const ok2 = await bulkCreate(createdId, pending)
          if (!ok2) { toastError('Error al agregar imágenes de galería'); return }
        }
        await swalSuccess('Creado', values.furniture_name)
        router.push('/furnitures')
      } else {
        applyApiErrors(form, fieldErrors)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* ── Row 1: Basic info + Specs side by side on desktop ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sofa className="size-4" />Información básica</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField control={form.control} name="furniture_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Mesa de comedor" maxLength={255} {...field} />
                  </FormControl>
                  <FormDescription>Máximo 255 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="furniture_largo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largo (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 120.50"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Opcional, en centímetros.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="furniture_ancho" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ancho (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 80.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Opcional, en centímetros.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="furniture_state" render={({ field }) => (
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

              <FormField control={form.control} name="furniture_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción opcional del mueble"
                      className="min-h-[100px] resize-y"
                      rows={4}
                      maxLength={2000}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional · Máximo 2000 caracteres
                    {field.value ? ` · ${field.value.length}/2000` : ''}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base">Especificaciones</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField control={form.control} name="id_category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <CategorySelect
                      value={field.value ?? null}
                      onValueChange={(v) => field.onChange(v)}
                      placeholder="Seleccionar categoría"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="id_typecolor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Color <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <TypeColorSelect
                      value={field.value ?? null}
                      onValueChange={(v) => field.onChange(v)}
                      placeholder="Seleccionar color"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="id_typewood" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Madera <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <TypeWoodSelect
                      value={field.value ?? null}
                      onValueChange={(v) => field.onChange(v)}
                      placeholder="Seleccionar madera"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Cover image ── */}
        <Card>
          <CardHeader><CardTitle className="text-base">Imagen de portada</CardTitle></CardHeader>
          <CardContent>
            <FormField control={form.control} name="id_image" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar imagen de portada (opcional)"
                    showAll
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Row 3: Gallery images ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Images className="size-4" />
              Galería de imágenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FurnitureGalleryManager
              key={resolved?.id ?? 'new'}
              initialGallery={initialGallery}
              onPendingItemsChange={(items) => { pendingGalleryItemsRef.current = items }}
              onRemovedIdsChange={(ids) => { removedGalleryIdsRef.current = ids }}
              onReorderedItemsChange={(items) => { reorderedGalleryItemsRef.current = items }}
              disabled={isBusy}
            />
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
        {galleryError && (
          <AlertError
            title="Error en galería de imágenes"
            message={galleryError}
            apiError={galleryFieldErrors ? { errors: galleryFieldErrors } : undefined}
          />
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/furnitures')}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isBusy} className="min-w-28">
            {isBusy
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar cambios' : 'Crear mueble'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
