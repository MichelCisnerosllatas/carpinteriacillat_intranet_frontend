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
import { useSectionImageDeleteStore } from '../../stores/useSectionImageDeleteStore'
import { SECTION_IMAGE_FIX_OPTIONS, SECTION_IMAGE_FIX_DEFAULT } from '../../data/data'
import { useSectionTypeKey } from '../../lib/use-section-type-key'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
// Secciones especiales (ver features/sectionimages/grouped/README.md)
import {
  isServiceShowcaseSection, isCategoryCoverflowSection, isRestorationCompareSection, showServiceIfHidden,
  getCategoryIdFromKey, getFurnitureIdFromLink, buildFurnitureGalleryLink,
  getFurnitureIdFromRestorationKey, RESTORATION_PHOTO_VARIANTS, type RestorationPhotoVariant,
} from '../../grouped'
import { SectionImageItemSelect } from './section-item-select'
import { SectionImageTextFields } from './sectionimage-text-fields'
import { FormGroupTitle } from './form-group-title'
// Carrusel de categorías y Restauración: origen de la imagen (Banco de imágenes | Foto de un mueble)
import { ImageSourceTabs, type ImageSource } from './coverflow/image-source-tabs'
import { FurniturePhotoPicker, type PickedFurniture, type PickedFurniturePhoto } from './coverflow/furniture-photo-picker'
// Restauración: bloques Antes/Después (al crear y al editar, la misma tarjeta)
import { RestorationPairFields } from './restoration/restoration-pair-fields'
import { useRestorationPair } from './restoration/use-restoration-pair'
import { createRestorationPair } from './restoration/create-restoration-pair'
import { useRestorationEditInitial } from './restoration/use-restoration-edit-initial'
import { getRestorationDeletes, saveRestorationPair } from './restoration/save-restoration-pair'
// Restauración y carrusel: botón "+ Nuevo" junto al select del item
import { NewSectionItemDialog } from './new-section-item/new-section-item-dialog'
import type { NewSectionItemKind } from './new-section-item/use-new-section-item-options'

const schema = z.object({
  id_section:         z.number({ error: 'Seleccione la sección.' }),
  // Opcional en el esquema: en Restauración (crear) las fotos van en los bloques Antes/Después.
  // En los demás casos se exige al guardar (ver onSubmit).
  id_image:           z.number().nullish(),
  sectionimage_fix:   z.string().nullable(),
  sectionimage_state: z.number(),
  // Textos opcionales de la foto ('' = vacío; al guardar se mandan como null)
  sectionimage_title:       z.string().max(255, 'Máximo 255 caracteres.'),
  sectionimage_description: z.string(),
  sectionimage_label:       z.string().max(150, 'Máximo 150 caracteres.'),
  sectionimage_link:        z.string().max(255, 'Máximo 255 caracteres.'),
  sectionimage_link_label:  z.string().max(150, 'Máximo 150 caracteres.'),
  sectionimage_variant:     z.string().max(50, 'Máximo 50 caracteres.'),
  id_section_item:          z.number().nullable(),
})

/** Texto vacío → null (el backend espera null, no ''). */
const emptyToNull = (value?: string | null) => (!value || value.trim() === '' ? null : value.trim())

/** Texto de una variante ('before' → "Antes"). */
const variantLabel = (variant: string) => RESTORATION_PHOTO_VARIANTS.find((v) => v.value === variant)?.label ?? variant

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

  // Carrusel de categorías y Restauración: de dónde sale la imagen, el mueble elegido y la tarjeta (item)
  // elegida (carrusel: su clave 'category-<id>' dice la categoría; Restauración: 'furniture-<id>' dice el mueble).
  const [imageSource, setImageSource] = useState<ImageSource>('bank')
  const [furnitureId, setFurnitureId] = useState<number | null>(null)
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
      // Carrusel: si la foto viene de un mueble (enlace '/gallery/<id>'), se abre en "Foto de un mueble"
      const idFurniture = getFurnitureIdFromLink(resolved.link)
      setFurnitureId(idFurniture)
      setImageSource(idFurniture != null ? 'furniture' : 'bank')
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
  // ¿Es «Restauración»? Igual que el carrusel, pero con los bloques Antes/Después
  const isRestoration = isRestorationCompareSection(typeKey)
  // Hero, carrusel o Restauración: se ocultan los textos que la web no usa
  const isGrouped = isServiceShowcase || isCoverflow || isRestoration
  // Restauración (al CREAR y al EDITAR): dos bloques (Antes y Después) en vez de una sola foto
  const isPairMode = isRestoration
  // Restauración al EDITAR: se editan las fotos Antes/Después del trabajo de la foto abierta
  const isPairEdit = isRestoration && isEdit
  // El origen "Foto de un mueble" solo existe en el carrusel y en Restauración; en las demás siempre es el banco
  const canUseFurniturePhoto = isCoverflow || isRestoration
  const effectiveSource: ImageSource = canUseFurniturePhoto ? imageSource : 'bank'
  // Botón "+ Nuevo" junto al select del item (solo Restauración y carrusel)
  const newItemKind: NewSectionItemKind | null = isRestoration ? 'restoration' : isCoverflow ? 'category' : null

  // Carrusel: categoría de la tarjeta elegida, por id (clave 'category-<id>') o, si no trae id, por nombre
  // (en Restauración no se filtra por categoría: se preselecciona el mueble del trabajo, ver abajo)
  const cardCategoryId = isCoverflow ? getCategoryIdFromKey(selectedSectionItem?.sectionitem_key) : null
  const cardCategoryName = isCoverflow ? selectedSectionItem?.sectionitem_title ?? null : null

  // Restauración: mueble relacionado del trabajo elegido (clave 'furniture-<id>').
  // null con "Ninguno" o si el trabajo no tiene mueble (su clave es null).
  const workFurnitureId = isRestoration ? getFurnitureIdFromRestorationKey(selectedSectionItem?.sectionitem_key) : null

  // Restauración: mueble compartido + bloques Antes / Después.
  // Crear: preselecciona el mueble del trabajo. Editar: todo llega con pair.loadInitial (abajo).
  const pair = useRestorationPair(workFurnitureId, isEdit ? 'edit' : 'create')

  // Restauración (editar): foto abierta (solo si ya es la de este id) → fotos de su trabajo → valores iniciales
  const editedPhoto = isPairEdit && resolved && resolved.id === Number(id) ? resolved : null
  const restorationInitial = useRestorationEditInitial(editedPhoto)
  useEffect(() => {
    if (restorationInitial) pair.loadInitial(restorationInitial)
  }, [restorationInitial])

  // ¿Ya se sabe CÓMO se ve el formulario? Mientras no, se muestra un esqueleto (ver el return).
  //  - Siempre: el tipo de la sección (decide labels y campos: Trabajo, Categoría, Servicio…).
  //  - Al editar: que ya llegó la foto y el formulario ya tiene SU sección (form.reset corre
  //    después del primer render; sin esta condición se vería un instante el formulario general).
  //  - Restauración al editar: además, que ya se cargaron las fotos del trabajo en los bloques.
  const isFormReady =
    typeLoaded &&
    (!isEdit || (!!resolved && watchedIdSection === resolved.idSection)) &&
    (!isPairEdit || pair.isInitialLoaded)

  // Restauración (editar): ¿en qué bloque está la foto abierta? (para la vista previa)
  const editedVariant: RestorationPhotoVariant | null = !isPairEdit || !resolved
    ? null
    : pair.originalIds.before === resolved.id ? 'before' : pair.originalIds.after === resolved.id ? 'after' : null

  // Restauración: una foto de los bloques se copia a los campos ocultos del formulario solo para
  // la vista previa en vivo del sitio (al guardar se usan los bloques). Al editar, la del bloque
  // de la foto abierta (si sigue con foto); si no, la 1ª.
  const previewEntry = pair.filledSlots.find((s) => s.variant === editedVariant) ?? pair.filledSlots[0] ?? null
  useEffect(() => {
    if (!isPairMode) return
    form.setValue('id_image', previewEntry?.slot.idImage ?? null)
    form.setValue('sectionimage_variant', previewEntry?.variant ?? '')
    form.setValue('sectionimage_title', previewEntry?.slot.caption ?? '')
    form.setValue('sectionimage_link', previewEntry?.slot.link ?? '')
    // Al editar, cada bloque tiene su propio "Visible"
    if (isPairEdit && previewEntry) form.setValue('sectionimage_state', pair.slotStates[previewEntry.variant])
  }, [isPairMode, pair.before, pair.after, pair.slotStates])

  // "Foto de un mueble": no hay ImageSelect que resuelva la imagen, así que se pide aquí para la vista previa
  const watchedIdImage = form.watch('id_image')
  useEffect(() => {
    if (isPairMode || effectiveSource !== 'furniture' || !watchedIdImage) return
    let cancelled = false
    imagesService.getById(watchedIdImage)
      .then((res) => { if (!cancelled && res.success && res.data) setSelectedImage(res.data) })
      .catch(() => { /* sin vista previa */ })
    return () => { cancelled = true }
  }, [isPairMode, effectiveSource, watchedIdImage])

  // "name"/"url"/"alt" no los tiene el formulario directo (el sitio público los resuelve desde
  // la imagen relacionada) — se reusa la imagen ya resuelta (ImageSelect o bloque Antes/Después).
  const toPreviewPayload = (values: FormValues): PreviewPayload => {
    // Restauración: la foto de los bloques que se usa para la vista previa (ver previewEntry)
    const pairFirst = isPairMode ? previewEntry?.slot ?? null : null
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
        ...(pairFirst?.imageUrl
          ? { name: pairFirst.imageName, url: pairFirst.imageUrl, alt: pairFirst.imageName }
          : selectedImage && !isPairMode
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

  /** Cambia el origen de la imagen. Al volver al banco, la foto ya no es "de un mueble": se quita su enlace. */
  const handleSourceChange = (source: ImageSource) => {
    setImageSource(source)
    if (source === 'bank' && getFurnitureIdFromLink(form.getValues('sectionimage_link')) != null) {
      form.setValue('sectionimage_link', '', { shouldDirty: true })
      setFurnitureId(null)
    }
  }

  /** Se eligió una foto de un mueble: imagen + enlace al mueble + pie de foto (si estaba vacío). */
  const handlePickFurniturePhoto = (photo: PickedFurniturePhoto, furniture: PickedFurniture) => {
    form.setValue('id_image', photo.imageId, { shouldValidate: true, shouldDirty: true })
    form.clearErrors('id_image')
    form.setValue('sectionimage_link', buildFurnitureGalleryLink(furniture.id), { shouldDirty: true })
    if (!form.getValues('sectionimage_title').trim()) {
      form.setValue('sectionimage_title', furniture.title, { shouldDirty: true })
    }
  }

  /** "+ Nuevo": se creó la tarjeta (trabajo / categoría) → se recargan los items y queda elegida. */
  const handleItemCreated = (idSectionItem: number) => {
    setItemsReloadKey((k) => k + 1)
    form.setValue('id_section_item', idSectionItem, { shouldDirty: true })
  }

  useLiveSitePreview(form, toPreviewPayload, isEdit ? !!resolved : true)

  /** Restauración (crear): guarda los bloques Antes / Después (1 o 2 filas). */
  const submitRestorationPair = async (values: FormValues) => {
    const slots = pair.filledSlots
    if (slots.length === 0) {
      pair.setError('Elige al menos una foto: «Antes» o «Después».')
      return
    }

    const names = slots.map((s) => `«${variantLabel(s.variant)}»`).join(' y ')
    const confirmed = await swalConfirm({
      title: slots.length === 2 ? '¿Crear las dos fotos?' : '¿Crear la foto?',
      text: `Restauración — ${names}`,
      confirmText: 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const result = await createRestorationPair(slots, {
      id_section:              values.id_section,
      id_section_item:         values.id_section_item,
      sectionimage_fix:        values.sectionimage_fix,
      sectionimage_state:      values.sectionimage_state,
      sectionimage_created_at: formatDatetime(),
    }, create)

    if (result.ok) {
      await swalSuccess('Creado', slots.length === 2 ? 'Fotos «Antes» y «Después»' : `Foto ${names}`)
      goBackOrFallback(router, '/section-images')
      return
    }

    // Falló alguna: las que sí se guardaron se quitan de los bloques (al reintentar no se repiten)
    for (const variant of result.savedVariants) pair.clearSlot(variant)
    if (result.savedVariants.length > 0) {
      const saved = result.savedVariants.map((v) => `«${variantLabel(v)}»`).join(' y ')
      await swalError(
        'Se guardó solo una foto',
        `La foto ${saved} ya se guardó, pero la otra no. Revisa el error y vuelve a pulsar «Crear»: solo se enviará la que falta.`,
      )
    }
    applyApiErrors(form, useSectionImageFormStore.getState().fieldErrors)
  }

  /**
   * Restauración (editar): guarda los dos bloques comparando con lo que tenían al abrir
   * (PUT / POST / DELETE por bloque, ver save-restoration-pair.ts).
   */
  const submitRestorationPairEdit = async (values: FormValues) => {
    // Al menos una foto (igual que al crear)
    if (pair.filledSlots.length === 0) {
      pair.setError('Elige al menos una foto: «Antes» o «Después».')
      return
    }

    const slots = { before: pair.before, after: pair.after }
    const deletes = getRestorationDeletes({ ids: pair.originalIds, slots })

    // Bloques que tenían foto y quedaron vacíos: se pregunta por cada uno ANTES de guardar.
    // Si cancela cualquiera, no se guarda nada. Si no hay que eliminar, la pregunta de siempre.
    if (deletes.length > 0) {
      for (const variant of deletes) {
        const confirmed = await swalConfirm({
          title: `¿Eliminar la foto «${variantLabel(variant)}»?`,
          text: 'Quedó vacía en el formulario.',
          confirmText: 'Sí, eliminar y guardar',
          cancelText: 'Cancelar',
          danger: true,
        })
        if (!confirmed) return
      }
    } else {
      const confirmed = await swalConfirm({
        title: '¿Guardar cambios?',
        text: 'Restauración — fotos «Antes» y «Después»',
        confirmText: 'Sí, guardar',
        cancelText: 'Cancelar',
      })
      if (!confirmed) return
    }

    const result = await saveRestorationPair(
      { ids: pair.originalIds, slots, states: pair.slotStates },
      {
        id_section:       values.id_section,
        id_section_item:  values.id_section_item,
        sectionimage_fix: values.sectionimage_fix,
      },
      formatDatetime(),
      {
        create,
        update,
        remove: (idSectionImage) => useSectionImageDeleteStore.getState().deleteItem(idSectionImage),
      },
    )

    if (result.ok) {
      await swalSuccess('Actualizado', 'Fotos «Antes» y «Después» del trabajo')
      goBackOrFallback(router, '/section-images')
      return
    }

    // Las fotos que ya se eliminaron se "olvidan": al volver a guardar no se intenta de nuevo
    for (const variant of result.deletedVariants) pair.forgetOriginalId(variant)

    // Mensaje claro de qué falló (los cambios anteriores a ese paso ya quedaron guardados)
    const failed = result.failed
    const action = failed?.step === 'delete' ? 'eliminar' : failed?.step === 'create' ? 'crear' : 'actualizar'
    const which = failed ? `«${variantLabel(failed.variant)}»` : ''
    const detail = failed?.step === 'delete'
      ? useSectionImageDeleteStore.getState().error
      : useSectionImageFormStore.getState().error
    await swalError(
      `No se pudo ${action} la foto ${which}`,
      `${detail ?? 'Error inesperado.'} Revisa y vuelve a pulsar «Guardar»: solo se enviará lo que falta.`,
    )
    applyApiErrors(form, useSectionImageFormStore.getState().fieldErrors)
  }

  const onSubmit = async (values: FormValues) => {
    // Restauración: dos bloques (Antes / Después), al crear y al editar
    if (isPairEdit) {
      await submitRestorationPairEdit(values)
      return
    }
    if (isPairMode) {
      await submitRestorationPair(values)
      return
    }

    // Una sola foto: la imagen es obligatoria
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
                      // Restauración al editar: fija, igual que el trabajo
                      disabled={contextualIdSection != null || isPairEdit}
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
                  {/* En el hero de Servicios cada item es un servicio; en el carrusel, una categoría; en Restauración, un trabajo */}
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      {isServiceShowcase ? 'Servicio' : isCoverflow ? 'Categoría' : isRestoration ? 'Trabajo' : 'Item de la sección (opcional)'}
                    </FormLabel>
                    {/* Restauración / carrusel: crear la tarjeta sin salir del formulario (no al editar Restauración: el trabajo está fijo) */}
                    {newItemKind && watchedIdSection && !isPairEdit && (
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
                      // Hero/carrusel/Restauración: también se listan los items ocultos (un servicio nuevo nace oculto)
                      includeHidden={isGrouped}
                      onSelectedItemChange={setSelectedSectionItem}
                      reloadKey={itemsReloadKey}
                      // Restauración al editar: el trabajo queda fijo (las dos fotos son de ese trabajo)
                      disabled={isPairEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    {isPairEdit
                      ? 'Para cambiar de trabajo, elimina y vuelve a crear.'
                      : isServiceShowcase
                      ? '¿A qué servicio del hero pertenece esta foto?'
                      : isCoverflow
                        ? '¿A qué tarjeta (categoría) del carrusel pertenece esta foto?'
                        : isRestoration
                          ? '¿A qué trabajo de «Restauración» pertenecen las fotos?'
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

              {/* Restauración al editar: cada bloque (Antes / Después) tiene su propio "Mostrar en el sitio web" */}
              {!isPairEdit && (
                <FormField control={form.control} name="sectionimage_state" render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                    <FormControl>
                      <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </CardContent>
          </Card>

          {isPairMode ? (
            // ── Restauración (crear y editar): tarjeta "Fotos del trabajo" (UN mueble + bloques "Antes" y "Después") ──
            <RestorationPairFields pair={pair} />
          ) : (
            // ── Una sola foto (todas las demás secciones) ──
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                <FormGroupTitle icon={ImageIcon} title="Foto" description="Qué imagen se muestra." />

                {/* Carrusel: origen de la imagen (Banco de imágenes | Foto de un mueble) */}
                {canUseFurniturePhoto && <ImageSourceTabs value={imageSource} onChange={handleSourceChange} />}

                {effectiveSource === 'furniture' ? (
                  // "Foto de un mueble" (carrusel): muebles de la categoría de la tarjeta.
                  // (Restauración no pasa por aquí: usa los bloques Antes/Después.)
                  <FormField control={form.control} name="id_image" render={() => (
                    <FormItem>
                      <FurniturePhotoPicker
                        categoryId={cardCategoryId}
                        categoryName={cardCategoryName}
                        furnitureId={furnitureId}
                        onFurnitureChange={setFurnitureId}
                        selectedImageId={watchedIdImage ?? null}
                        onPick={handlePickFurniturePhoto}
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
          )}

          {/* ── Textos (no se muestra en el hero de Servicios, el carrusel ni Restauración: allí la web no los usa) ── */}
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

      {/* "+ Nuevo" del select del item: crea el trabajo (Restauración) o la categoría (carrusel) */}
      {newItemKind && (
        <NewSectionItemDialog
          open={showNewItem}
          onOpenChange={setShowNewItem}
          kind={newItemKind}
          idSection={watchedIdSection}
          onCreated={handleItemCreated}
        />
      )}
    </Form>
  )
}
