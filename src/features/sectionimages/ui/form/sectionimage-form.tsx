'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImageIcon, Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageFormStore } from '../../stores/useSectionImageFormStore'
import { SECTION_IMAGE_FIX_OPTIONS, SECTION_IMAGE_FIX_DEFAULT } from '../../data/data'

const schema = z.object({
  id_section:         z.number({ error: 'Seleccione la sección.' }),
  id_image:           z.number({ error: 'Seleccione la imagen.' }),
  sectionimage_fix:   z.string().nullable(),
  sectionimage_state: z.number(),
})

type FormValues = z.infer<typeof schema>

export function SectionImageForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { currentItem, items, loadById }                            = useSectionImageListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionImageFormStore()
  const isEdit   = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  // Creación contextual: cuando se llega desde el tab "Imágenes" del detalle de una Section
  // (ej. `/section-images/create?id_section=3`), la sección ya está decidida — se precarga y
  // se bloquea el combobox en vez de obligar a buscarla de nuevo.
  const contextualIdSection = !isEdit ? Number(searchParams.get('id_section')) || null : null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_section: contextualIdSection ?? undefined,
      id_image: undefined,
      sectionimage_fix: SECTION_IMAGE_FIX_DEFAULT,
      sectionimage_state: 1,
    },
  })

  // Siempre trae el registro fresco del backend al editar — no depende de que `currentItem`/`items`
  // ya tengan este id en memoria (ej. entrar por URL directa, recarga de página, o pestaña nueva).
  useEffect(() => {
    if (isEdit && id) { void loadById(Number(id)) }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_section:         resolved.idSection,
        id_image:           resolved.idImage,
        sectionimage_fix:   resolved.objectFit ?? SECTION_IMAGE_FIX_DEFAULT,
        sectionimage_state: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  // Imagen actualmente elegida en el <ImageSelect> — se usa solo para la vista previa en vivo
  // de abajo, que respeta el `sectionimage_fix` elegido. `ImageSelect` ya resuelve el objeto
  // completo tanto al seleccionar como al llegar en modo edición, así no hay que pedirlo aparte.
  const [selectedImage, setSelectedImage] = useState<ImageApiItem | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const currentFix = form.watch('sectionimage_fix')

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear asignación?',
      text: 'Sección — Imagen',
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          id_section:              values.id_section,
          id_image:                values.id_image,
          sectionimage_fix:        values.sectionimage_fix,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_updated_at: formatDatetime(),
        })
      : await create({
          id_section:              values.id_section,
          id_image:                values.id_image,
          sectionimage_fix:        values.sectionimage_fix,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_created_at: formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', 'Asignación de imagen a sección')
      goBackOrFallback(router, '/section-images')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="id_section" render={({ field }) => (
              <FormItem>
                <FormLabel>Sección <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <SectionSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Seleccionar sección"
                    disabled={contextualIdSection != null}
                  />
                </FormControl>
                {contextualIdSection != null && (
                  <p className="text-xs text-muted-foreground">Ya viene definida porque estás creando esta imagen desde esa sección.</p>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="id_image" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Imagen <span className="text-destructive">*</span></FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />Nuevo
                  </button>
                </div>
                <FormControl>
                  <ImageSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    onSelectedChange={setSelectedImage}
                    placeholder="Seleccionar imagen"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sectionimage_fix" render={({ field }) => (
              <FormItem>
                <FormLabel>Ajuste de imagen (object-fit)</FormLabel>
                <Select key={`fix-${field.value}`} value={field.value ?? SECTION_IMAGE_FIX_DEFAULT} onValueChange={(v) => field.onChange(v)}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SECTION_IMAGE_FIX_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cómo debe encajar la imagen dentro de su contenedor cuando se muestra en el sitio.</p>
                <FormMessage />
              </FormItem>
            )} />

            {/* Vista previa en vivo — muestra la imagen elegida (recién seleccionada o ya
                subida) exactamente con el `object-fit` elegido arriba, para verificar el
                encaje antes de guardar en vez de tener que adivinarlo. */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Vista previa</span>
              <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                {selectedImage ? (
                  <img
                    src={getImageUrl(selectedImage.image_patch)}
                    alt={getImageDisplayName(selectedImage)}
                    className="h-full w-full"
                    style={{ objectFit: (currentFix as CSSProperties['objectFit']) ?? 'cover' }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageIcon className="size-6" />
                    <span className="text-xs">Elige una imagen para previsualizarla</span>
                  </div>
                )}
              </div>
            </div>

            <FormField control={form.control} name="sectionimage_state" render={({ field }) => (
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
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-images')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
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
          setSelectedImage(item)
        }}
      />
    </Form>
  )
}
