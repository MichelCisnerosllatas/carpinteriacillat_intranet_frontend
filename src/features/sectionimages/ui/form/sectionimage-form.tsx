'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ImageIcon, Loader2, MapPin, Plus, Type } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { swalConfirm, swalError, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { ImageSelect } from '@/features/images/ui/image-select'
import { ImageQuickUploadDialog } from '@/features/images/ui/image-quick-upload-dialog'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import type { ImageApiItem } from '@/features/images/model/imageget.dto'
import { imagesService } from '@/features/images/services/images.service'
import type { SectionItemApiItem } from '@/features/section-items/model/sectionitemget.dto'
import { useLiveSitePreview } from '@/shared/hooks/use-live-site-preview'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'
import { useSectionImageListStore } from '../../stores/useSectionImageListStore'
import { useSectionImageFormStore } from '../../stores/useSectionImageFormStore'
import { SECTION_IMAGE_FIX_OPTIONS, SECTION_IMAGE_FIX_DEFAULT } from '../../data/data'
import { useSectionTypeKey } from '../../lib/use-section-type-key'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
// Secciones especiales (ver features/sectionimages/grouped/README.md)
import {
  isServiceShowcaseSection, isCategoryCoverflowSection, showServiceIfHidden,
  getCategoryIdFromKey, getWorkIdFromLink, buildWorkGalleryLink,
} from '../../grouped'
import { SectionImageItemSelect } from './section-item-select'
import { SectionImageTextFields } from './sectionimage-text-fields'
import { FormGroupTitle } from './form-group-title'
// Carrusel de categorías: origen de la imagen (Banco de imágenes | Foto de un trabajo de la Galería)
import { ImageSourceTabs, type ImageSource } from './coverflow/image-source-tabs'
import { WorkPhotoPicker, type PickedWork, type PickedWorkPhoto } from './coverflow/work-photo-picker'
// Carrusel: botón "+ Nuevo" junto al select de la categoría
import { NewSectionItemDialog } from './new-section-item/new-section-item-dialog'

const schema = z.object({
  id_section:         z.number({ error: 'Seleccione la sección.' }),
  // Opcional en el esquema: se exige al guardar (ver onSubmit).
  id_image:           z.number().nullish(),
  sectionimage_fix:   z.string().nullable(),
  sectionimage_state: z.number(),
  // Textos opcionales de la foto ('' = vacío; al guardar se mandan como null)
  sectionimage_title:       z.string().max(255, 'Máximo 255 caracteres.'),
  sectionimage_description: z.string(),
  sectionimage_label:       z.string().max(150, 'Máximo 150 caracteres.'),
  sectionimage_link:        z.string().max(255, 'Máximo 255 caracteres.'),
  sectionimage_link_label:  z.string().max(150, 'Máximo 150 caracteres.'),
  // Texto libre (opcional) que algunas secciones generales usan para mostrar la foto de otra forma
  sectionimage_variant:     z.string().max(50, 'Máximo 50 caracteres.'),
  id_section_item:          z.number().nullable(),
})

/** Texto vacío → null (el backend espera null, no ''). */
const emptyToNull = (value?: string | null) => (!value || value.trim() === '' ? null : value.trim())

/**
 * Grilla fluida del formulario: 1 columna en celular y más columnas a medida que hay espacio
 * (cada tarjeta mide al menos 340px), sin un número fijo de columnas.
 */
const FLUID_GRID = 'grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]'

type FormValues = z.infer<typeof schema>
/** Valores del formulario (los usa también sectionimage-text-fields.tsx). */
export type SectionImageFormValues = FormValues

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
  // Si además viene `?id_section_item=` (botón "Agregar foto a este item"), se precarga el item.
  // Solo vale junto con la sección: un item siempre pertenece a una sección.
  const contextualIdSectionItem = contextualIdSection != null ? Number(searchParams.get('id_section_item')) || null : null

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_section: contextualIdSection ?? undefined,
      id_image: undefined,
      sectionimage_fix: SECTION_IMAGE_FIX_DEFAULT,
      sectionimage_state: 1,
      sectionimage_title: '',
      sectionimage_description: '',
      sectionimage_label: '',
      sectionimage_link: '',
      sectionimage_link_label: '',
      sectionimage_variant: '',
      id_section_item: contextualIdSectionItem,
    },
  })

  // Carrusel de categorías: de dónde sale la imagen, el trabajo elegido y la tarjeta (item) elegida
  // (su clave 'category-<id>' dice la categoría).
  const [imageSource, setImageSource] = useState<ImageSource>('bank')
  const [workId, setWorkId] = useState<number | null>(null)
  const [selectedSectionItem, setSelectedSectionItem] = useState<SectionItemApiItem | null>(null)

  // Botón "+ Nuevo" del select del item: diálogo abierto y "recargar items" al crear uno
  const [showNewItem, setShowNewItem] = useState(false)
  const [itemsReloadKey, setItemsReloadKey] = useState(0)

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
        sectionimage_title:       resolved.title ?? '',
        sectionimage_description: resolved.description ?? '',
        sectionimage_label:       resolved.label ?? '',
        sectionimage_link:        resolved.link ?? '',
        sectionimage_link_label:  resolved.linkLabel ?? '',
        sectionimage_variant:     resolved.variant ?? '',
        id_section_item:          resolved.idSectionItem,
      })
      // Carrusel: si la foto viene de un trabajo (enlace '/gallery/<id_web_work>'), se abre en "Foto de un trabajo"
      const idWebWork = getWorkIdFromLink(resolved.link)
      setWorkId(idWebWork)
      setImageSource(idWebWork != null ? 'work' : 'bank')
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  // Imagen actualmente elegida en el <ImageSelect> — se usa para la vista previa en vivo del
  // sitio (nombre/url/alt). `ImageSelect` ya resuelve el objeto completo tanto al seleccionar
  // como al llegar en modo edición, así no hay que pedirlo aparte.
  const [selectedImage, setSelectedImage] = useState<ImageApiItem | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)

  const watchedIdSection = form.watch('id_section')
  // ¿La sección elegida es el hero de Servicios? Ahí se ocultan los textos que la web no usa
  // (solo cambia lo que se ve; al guardar se envían todos los campos igual que antes).
  const { typeKey, hasLoaded: typeLoaded } = useSectionTypeKey(watchedIdSection)

  const isServiceShowcase = isServiceShowcaseSection(typeKey)
  // ¿Es el carrusel «Muebles a medida»? Igual que el hero (solo Pie de foto) + origen de la imagen
  const isCoverflow = isCategoryCoverflowSection(typeKey)
  // Hero o carrusel: se ocultan los textos que la web no usa
  const isGrouped = isServiceShowcase || isCoverflow
  // El origen "Foto de un trabajo" solo existe en el carrusel; en las demás siempre es el banco
  const effectiveSource: ImageSource = isCoverflow ? imageSource : 'bank'

  // Carrusel: categoría de la tarjeta elegida, por id (clave 'category-<id>') o, si no trae id, por nombre
  const cardCategoryId = isCoverflow ? getCategoryIdFromKey(selectedSectionItem?.sectionitem_key) : null
  const cardCategoryName = isCoverflow ? selectedSectionItem?.sectionitem_title ?? null : null

  // ¿Ya se sabe CÓMO se ve el formulario? Mientras no, se muestra un esqueleto (ver el return).
  //  - Siempre: el tipo de la sección (decide labels y campos: Categoría, Servicio…).
  //  - Al editar: que ya llegó la foto y el formulario ya tiene SU sección (form.reset corre
  //    después del primer render; sin esta condición se vería un instante el formulario general).
  const isFormReady =
    typeLoaded &&
    (!isEdit || (!!resolved && watchedIdSection === resolved.idSection))

  // "Foto de un trabajo": no hay ImageSelect que resuelva la imagen, así que se pide aquí para la vista previa
  const watchedIdImage = form.watch('id_image')
  useEffect(() => {
    if (effectiveSource !== 'work' || !watchedIdImage) return
    let cancelled = false
    imagesService.getById(watchedIdImage)
      .then((res) => { if (!cancelled && res.success && res.data) setSelectedImage(res.data) })
      .catch(() => { /* sin vista previa */ })
    return () => { cancelled = true }
  }, [effectiveSource, watchedIdImage])

  // "name"/"url"/"alt" no los tiene el formulario directo (el sitio público los resuelve desde
  // la imagen relacionada) — se reusa la imagen ya resuelta (ImageSelect o "Foto de un trabajo").
  const toPreviewPayload = (values: FormValues): PreviewPayload => {
    return {
      entity: 'section_image',
      id: isEdit ? resolved!.id : null,
      id_section: values.id_section,
      fields: {
        id_image: values.id_image,
        // Si todavía no se resolvió la imagen (ej. justo al montar, antes de que ImageSelect
        // dispare onSelectedChange), no se manda nada de esto — así el sitio web conserva lo que
        // ya tenía cargado en vez de pisarlo con "undefined" (ver preview.resolve.ts: hace un
        // merge superficial, así que una clave presente con valor undefined SÍ pisaría el dato).
        ...(selectedImage
          ? { name: getImageDisplayName(selectedImage), url: getImageUrl(selectedImage.image_patch), alt: selectedImage.image_alt }
          : {}),
        fix: values.sectionimage_fix,
        state: values.sectionimage_state === 1,
        // Nombres públicos (los que usa el sitio web), no los de la base de datos
        title: emptyToNull(values.sectionimage_title),
        description: emptyToNull(values.sectionimage_description),
        label: emptyToNull(values.sectionimage_label),
        link: emptyToNull(values.sectionimage_link),
        link_label: emptyToNull(values.sectionimage_link_label),
        variant: emptyToNull(values.sectionimage_variant),
        id_section_item: values.id_section_item,
      },
    }
  }

  // Campos de texto + item, iguales para crear y para editar
  const toTextFields = (values: FormValues) => ({
    sectionimage_title:       emptyToNull(values.sectionimage_title),
    sectionimage_description: emptyToNull(values.sectionimage_description),
    sectionimage_label:       emptyToNull(values.sectionimage_label),
    sectionimage_link:        emptyToNull(values.sectionimage_link),
    sectionimage_link_label:  emptyToNull(values.sectionimage_link_label),
    sectionimage_variant:     emptyToNull(values.sectionimage_variant),
    id_section_item:          values.id_section_item,
  })

  /** Cambia el origen de la imagen. Al volver al banco, la foto ya no es "de un trabajo": se quita su enlace. */
  const handleSourceChange = (source: ImageSource) => {
    setImageSource(source)
    if (source === 'bank' && getWorkIdFromLink(form.getValues('sectionimage_link')) != null) {
      form.setValue('sectionimage_link', '', { shouldDirty: true })
      setWorkId(null)
    }
  }

  /** Se eligió una foto de un trabajo: imagen + enlace al trabajo + pie de foto = título (si estaba vacío). */
  const handlePickWorkPhoto = (photo: PickedWorkPhoto, work: PickedWork) => {
    form.setValue('id_image', photo.imageId, { shouldValidate: true, shouldDirty: true })
    form.clearErrors('id_image')
    form.setValue('sectionimage_link', buildWorkGalleryLink(work.id), { shouldDirty: true })
    if (!form.getValues('sectionimage_title').trim()) {
      form.setValue('sectionimage_title', work.title, { shouldDirty: true })
    }
  }

  /** "+ Nuevo": se creó la tarjeta (categoría) → se recargan los items y queda elegida. */
  const handleItemCreated = (idSectionItem: number) => {
    setItemsReloadKey((k) => k + 1)
    form.setValue('id_section_item', idSectionItem, { shouldDirty: true })
  }

  useLiveSitePreview(form, toPreviewPayload, isEdit ? !!resolved : true)

  const onSubmit = async (values: FormValues) => {
    // La imagen es obligatoria
    const idImage = values.id_image
    if (idImage == null) {
      form.setError('id_image', { message: 'Seleccione la imagen.' })
      return
    }

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
          id_image:                idImage,
          sectionimage_fix:        values.sectionimage_fix,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_updated_at: formatDatetime(),
          ...toTextFields(values),
        })
      : await create({
          id_section:              values.id_section,
          id_image:                idImage,
          sectionimage_fix:        values.sectionimage_fix,
          sectionimage_state:      values.sectionimage_state,
          sectionimage_created_at: formatDatetime(),
          ...toTextFields(values),
        })

    if (success) {
      // Hero de Servicios: si la foto quedó visible y su servicio estaba oculto, se muestra el servicio
      if (isServiceShowcase && values.sectionimage_state === 1 && values.id_section_item != null) {
        await showServiceIfHidden(values.id_section_item)
      }
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', 'Asignación de imagen a sección')
      goBackOrFallback(router, '/section-images')
    } else {
      applyApiErrors(form, useSectionImageFormStore.getState().fieldErrors)
    }
  }

  // Todavía cargando lo que decide cómo se ve: esqueleto en vez del formulario "general".
  // (Va después de todos los hooks: un return antes de un hook rompe las reglas de React.)
  if (!isFormReady) return <FormSkeleton cards={isEdit ? 2 : 3} />

  return (
    <Form {...form}>
      {/* Ocupa todo el ancho: las tarjetas se reparten en columnas fluidas (ver FLUID_GRID) */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className={FLUID_GRID}>
          {/* ── Ubicación: sección, item, ajuste y visibilidad ── */}
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <FormGroupTitle icon={MapPin} title="Ubicación" description="Dónde se muestra y si se ve en el sitio." />

              <FormField control={form.control} name="id_section" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sección <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <SectionSelect
                      value={field.value ?? null}
                      onValueChange={(v) => {
                        field.onChange(v)
                        // El item elegido pertenece a la sección anterior: se limpia
                        form.setValue('id_section_item', null)
                      }}
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

              <FormField control={form.control} name="id_section_item" render={({ field }) => (
                <FormItem>
                  {/* En el hero de Servicios cada item es un servicio; en el carrusel, una categoría */}
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      {isServiceShowcase ? 'Servicio' : isCoverflow ? 'Categoría' : 'Item de la sección (opcional)'}
                    </FormLabel>
                    {/* Carrusel: crear la tarjeta sin salir del formulario */}
                    {isCoverflow && watchedIdSection && (
                      <button
                        type="button"
                        onClick={() => setShowNewItem(true)}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Plus className="size-3.5" />Nuevo
                      </button>
                    )}
                  </div>
                  <FormControl>
                    <SectionImageItemSelect
                      idSection={watchedIdSection}
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                      // Hero/carrusel: también se listan los items ocultos (un servicio nuevo nace oculto)
                      includeHidden={isGrouped}
                      onSelectedItemChange={setSelectedSectionItem}
                      reloadKey={itemsReloadKey}
                    />
                  </FormControl>
                  <FormDescription>
                    {isServiceShowcase
                      ? '¿A qué servicio del hero pertenece esta foto?'
                      : isCoverflow
                        ? '¿A qué tarjeta (categoría) del carrusel pertenece esta foto?'
                        : 'Úsalo cuando la foto pertenece a un item concreto (ej. cada servicio del hero).'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="sectionimage_fix" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ajuste de imagen (object-fit)</FormLabel>
                  <Select key={`fix-${field.value}`} value={field.value ?? SECTION_IMAGE_FIX_DEFAULT} onValueChange={(v) => field.onChange(v)}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
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

              <FormField control={form.control} name="sectionimage_state" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                  <FormControl>
                    <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Foto ── */}
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <FormGroupTitle icon={ImageIcon} title="Foto" description="Qué imagen se muestra." />

              {/* Carrusel: origen de la imagen (Banco de imágenes | Foto de un trabajo) */}
              {isCoverflow && <ImageSourceTabs value={imageSource} onChange={handleSourceChange} />}

              {effectiveSource === 'work' ? (
                // "Foto de un trabajo" (carrusel): trabajos de la Galería de la categoría de la tarjeta
                <FormField control={form.control} name="id_image" render={() => (
                  <FormItem>
                    <WorkPhotoPicker
                      categoryId={cardCategoryId}
                      categoryName={cardCategoryName}
                      workId={workId}
                      onWorkChange={setWorkId}
                      selectedImageId={watchedIdImage ?? null}
                      onPick={handlePickWorkPhoto}
                    />
                    <FormMessage />
                  </FormItem>
                )} />
              ) : (
                // "Banco de imágenes" (y todas las demás secciones): el selector de siempre
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
              )}

              {/* Hero de Servicios / carrusel: el único texto que usa la web (pie de foto) va aquí mismo */}
              {isGrouped && <SectionImageTextFields control={form.control} captionOnly />}
            </CardContent>
          </Card>

          {/* ── Textos (no se muestra en el hero de Servicios ni en el carrusel: allí la web no los usa) ── */}
          {!isGrouped && (
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                <FormGroupTitle icon={Type} title="Textos" description="Opcionales: acompañan a la foto en el sitio web." />
                <SectionImageTextFields control={form.control} captionOnly={false} />
              </CardContent>
            </Card>
          )}
        </div>

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

      {/* "+ Nuevo" del select del item: crea la categoría (carrusel) */}
      {isCoverflow && (
        <NewSectionItemDialog
          open={showNewItem}
          onOpenChange={setShowNewItem}
          idSection={watchedIdSection}
          onCreated={handleItemCreated}
        />
      )}
    </Form>
  )
}
