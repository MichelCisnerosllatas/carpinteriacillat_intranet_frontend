'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { cn, formatDatetime } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { CategorySelect } from '@/features/categories/ui/category-select'
import { TypeColorSelect } from '@/features/typecolors/ui/typecolor-select'
import { TypeWoodSelect } from '@/features/typewoods/ui/typewood-select'
import { FurnitureGalleryManager, type GalleryEntry, type PendingGalleryItem, type ReorderedGalleryItem } from '@/features/furnitures_images/ui/gallery/furniture-gallery-manager'
import { useFurnitureImageFormStore } from '@/features/furnitures_images/stores/useFurnitureImageFormStore'
import { useFurnitureListStore } from '../../stores/useFurnitureListStore'
import { useFurnitureFormStore } from '../../stores/useFurnitureFormStore'
import { furnitureFormSchema, type FurnitureFormValues } from '../../data/furniture-form.schema'
import { FurnitureWebWorksCard } from '../furniture-web-works-card'

const schema = furnitureFormSchema
type FormValues = FurnitureFormValues

export function FurnitureForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router   = useRouter()
  const { currentItem, items, meta, isError: isLoadError, loadById, setCurrentItem } = useFurnitureListStore()
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
      furniture_name: '', furniture_title: '', furniture_description: '',
      furniture_largo: null, furniture_ancho: null,
      furniture_state: 1, id_category: undefined,
      id_typecolor: undefined, id_typewood: undefined, id_image: null,
    },
  })

  // Portada = la Foto 1 de la galería (la informa FurnitureGalleryManager); al guardar se manda como id_image
  const [coverImageId, setCoverImageId] = useState<number | null>(null)
  // Al editar, hasta que llega el mueble se muestra un skeleton en vez del formulario vacío.
  const isLoadingItem = isEdit && !isLoadError && currentItem?.id !== Number(id)

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
        furniture_title:       resolved.title ?? '',
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
  const savedGallery: GalleryEntry[] = (resolved?.galleryImages ?? []).map((g) => ({
    localKey:          `init-${g.id}`,
    furnitureImageId:  g.id,
    imageId:           g.imageId,
    imageUrl:          g.imageUrl,
    imageName:         g.imageName,
  }))
  // La portada guardada (id_image) va siempre como Foto 1, así lo que se ve coincide con el sitio:
  // si ya está en la galería se sube al primer lugar; si no (muebles de antes, cuando la portada
  // se elegía aparte), se agrega como foto nueva para que no se pierda al guardar.
  const coverIdx = savedGallery.findIndex((g) => g.imageId === resolved?.idImage)
  const initialGallery: GalleryEntry[] =
    resolved?.idImage == null ? savedGallery
    : coverIdx >= 0 ? [savedGallery[coverIdx], ...savedGallery.filter((_, i) => i !== coverIdx)]
    : [{
        localKey: 'init-cover', imageId: resolved.idImage, imageUrl: resolved.imageUrl,
        imageName: resolved.imageName,
      }, ...savedGallery]

  const onSubmit = async (values: FormValues) => {
    // El backend exige portada: sin fotos en la galería no hay Foto 1 que usar
    if (coverImageId == null) {
      toastError('Falta la portada', 'Agrega al menos una foto a la galería: la Foto 1 es la portada.')
      return
    }

    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear mueble?',
      text: values.furniture_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    // Título público vacío → null (la web usará el nombre del mueble)
    const furnitureTitle = values.furniture_title?.trim() || null

    if (isEdit) {
      const ok = await update(resolved!.id, {
        furniture_name:        values.furniture_name,
        furniture_title:       furnitureTitle,
        furniture_description: values.furniture_description,
        furniture_largo:       values.furniture_largo,
        furniture_ancho:       values.furniture_ancho,
        furniture_state:       values.furniture_state,
        id_category:           values.id_category,
        id_typecolor:          values.id_typecolor,
        id_typewood:           values.id_typewood,
        id_image:              coverImageId,
        furniture_updated_at:  formatDatetime(),
      })
      if (ok) {
        const pending    = pendingGalleryItemsRef.current
        const removed    = removedGalleryIdsRef.current
        const reordered  = reorderedGalleryItemsRef.current

        // Orden obligatorio: eliminar → reordenar → crear. El backend exige furnitureimage_order único
        // por mueble; si se crea primero, la foto nueva choca con el orden de una fila que aún no se
        // borró o que todavía no se movió a su posición final.
        if (removed.length > 0) {
          const ok3 = await bulkRemove(removed)
          if (!ok3) { toastError('Error al eliminar imágenes de galería'); return }
        }
        if (reordered.length > 0) {
          const ok4 = await bulkReorder(reordered)
          if (!ok4) { toastError('Error al guardar el orden de la galería'); return }
        }
        if (pending.length > 0) {
          const ok2 = await bulkCreate(resolved!.id, pending)
          if (!ok2) { toastError('Error al agregar imágenes de galería'); return }
        }
        await swalSuccess('Actualizado', values.furniture_name)
        router.push('/furnitures')
      } else {
        applyApiErrors(form, fieldErrors)
      }
    } else {
      const createdId = await create({
        furniture_name:        values.furniture_name,
        furniture_title:       furnitureTitle,
        furniture_description: values.furniture_description,
        furniture_largo:       values.furniture_largo,
        furniture_ancho:       values.furniture_ancho,
        furniture_state:       values.furniture_state,
        furniture_order:       (meta?.total ?? 0) + 1,
        id_category:           values.id_category,
        id_typecolor:          values.id_typecolor,
        id_typewood:           values.id_typewood,
        id_image:              coverImageId,
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

  if (isLoadingItem) return <FurnitureFormSkeleton />

  return (
    <Form {...form}>
      {/* Los refs de la galería solo se leen dentro de onSubmit (al enviar), no durante el render */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* ── Row 1: Basic info (izq.) + Specs / Galería web apilados (der.) en desktop ──
            Solo hay 2 columnas al editar (con la tarjeta "En la galería web"): al crear, la columna
            derecha quedaría con "Especificaciones" sola y un hueco debajo; en ese caso los dos
            cards van a todo el ancho, uno debajo del otro.
            `items-start`: cada columna mide solo lo que ocupa su contenido. */}
        <div className={cn('grid grid-cols-1 items-start gap-4', isEdit && resolved && 'lg:grid-cols-2')}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sofa className="size-4" />Información básica</CardTitle></CardHeader>
            <CardContent className="@container flex flex-col gap-4">
              {/* A todo el ancho, Nombre y Título público van lado a lado */}
              <div className="grid grid-cols-1 items-start gap-4 @3xl:grid-cols-2">
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

              <FormField control={form.control} name="furniture_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título público</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cocina en L con isla central" maxLength={255} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Opcional. Es el nombre que se ve en el sitio web; si lo dejas vacío se usa el nombre.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              </div>

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

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base">Especificaciones</CardTitle></CardHeader>
              {/* Las columnas dependen del ancho del card (container query), no de la ventana:
                  en desktop el card ocupa media pantalla y 3 selects no entran. */}
              <CardContent className="@container">
              <div className="grid grid-cols-1 items-start gap-4 @2xl:grid-cols-3">
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
              </div>
              </CardContent>
            </Card>

            {/* ── Trabajos de la galería web que usan este mueble (solo al editar) ── */}
            {isEdit && resolved && <FurnitureWebWorksCard furnitureId={resolved.id} webWorks={resolved.webWorks} />}
          </div>
        </div>

        {/* ── Row 2: Galería de imágenes — la Foto 1 es la portada (ya no hay selector aparte) ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Images className="size-4" />
              Galería de imágenes <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              La <span className="font-medium text-foreground">Foto 1 es la portada</span>: arrastra otra foto al primer lugar para cambiarla.
            </p>
            <FurnitureGalleryManager
              key={resolved?.id ?? 'new'}
              initialGallery={initialGallery}
              onPendingItemsChange={(items) => { pendingGalleryItemsRef.current = items }}
              onRemovedIdsChange={(ids) => { removedGalleryIdsRef.current = ids }}
              onReorderedItemsChange={(items) => { reorderedGalleryItemsRef.current = items }}
              onCoverChange={setCoverImageId}
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

// Placeholder mientras se carga el mueble a editar (mismo esquema que el formulario)
function FurnitureFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full" />)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
