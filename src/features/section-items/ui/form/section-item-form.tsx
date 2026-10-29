'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LayoutGrid, FileText, MapPin, Activity, MessageCircle } from 'lucide-react'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime, cn } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { SectionSelect } from '@/features/sections/ui/section-select'
import { IconPicker } from '@/shared/ui/icon-picker/icon-picker'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { SECTION_ITEM_TYPES, SECTION_ITEM_TYPE_FIELDS, SECTION_ITEM_VARIANT_OPTIONS, SECTION_ITEM_IDENTITY_TYPES, sectionItemVariantLabel, sectionItemTitleLabel, sectionItemLabelLabel, sectionItemValueLabel, sectionItemLinkLabel, WHATSAPP_POSITION_PREVIEW_CLASS, type SectionItemField } from '../../data/data'
import { getAllowedItemTypes, getFixedItemType } from '../../data/item-types-by-section'
import { useLiveSitePreview } from '@/shared/hooks/use-live-site-preview'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'
import { useSectionItemListStore } from '../../stores/useSectionItemListStore'
import { useSectionItemFormStore } from '../../stores/useSectionItemFormStore'
// Secciones especiales (ver features/sectionimages/grouped/README.md):
//   hero de Servicios → campos propios en ./showcase · carrusel de categorías → ./category
import { ShowcaseItemFields } from './showcase/showcase-item-fields'
import { useShowcaseItemMode, SHOWCASE_ITEM_TYPE } from './showcase/use-showcase-item-mode'
import { CategoryItemFields } from './category/category-item-fields'
import { CATEGORY_ITEM_TYPE, getCategoryIdFromKey } from '@/features/sectionimages/grouped'

/** Sentinel para "sin tipo" — Radix <Select> no admite value="" en <SelectItem>. */
const NO_TYPE = '__none__'

/** Etiqueta en español de un tipo de item (ej. 'word' → "Palabra de la cinta"). */
const typeLabelOf = (value: string | null | undefined) =>
  SECTION_ITEM_TYPES.find((t) => t.value === value)?.label ?? value ?? ''

// `leaflet` toca `window`/`document` apenas se importa — solo puede cargar en el cliente, nunca
// durante el render en el servidor de Next. `ssr: false` es obligatorio acá, no una optimización.
const LocationPicker = dynamic(
  () => import('@/shared/ui/location-picker/location-picker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="flex h-64 w-full items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">Cargando mapa...</div> }
)

const schema = z.object({
  id_section:              z.number({ error: 'Seleccione la sección.' }),
  sectionitem_type:        z.string().optional(),
  sectionitem_key:         z.string().max(100, 'Máximo 100 caracteres.').optional().or(z.literal('')),
  sectionitem_title:       z.string().optional().or(z.literal('')),
  sectionitem_subtitle:    z.string().optional().or(z.literal('')),
  sectionitem_description: z.string().optional().or(z.literal('')),
  sectionitem_label:       z.string().max(150, 'Máximo 150 caracteres.').optional().or(z.literal('')),
  sectionitem_value:       z.string().max(255, 'Máximo 255 caracteres.').optional().or(z.literal('')),
  sectionitem_suffix:      z.string().max(30, 'Máximo 30 caracteres.').optional().or(z.literal('')),
  sectionitem_icon:        z.string().max(150, 'Máximo 150 caracteres.').optional().or(z.literal('')),
  sectionitem_link:        z.string().max(500, 'Máximo 500 caracteres.').optional().or(z.literal('')),
  sectionitem_variant:     z.string().max(50, 'Máximo 50 caracteres.').optional().or(z.literal('')),
  sectionitem_rating:      z.union([z.number().min(0).max(9.9, 'Máximo 9.9.'), z.nan()]).optional(),
  sectionitem_latitude:    z.union([z.number().min(-90).max(90), z.nan()]).optional(),
  sectionitem_longitude:   z.union([z.number().min(-180).max(180), z.nan()]).optional(),
  sectionitem_state:       z.number(),
})

type FormValues = z.infer<typeof schema>
/** Valores del formulario (los usan también showcase/showcase-item-fields.tsx y category/category-item-fields.tsx). */
export type SectionItemFormValues = FormValues

export function SectionItemForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEdit        = mode === 'edit'

  // Creación contextual: si viene ?id_section=N en la URL (ej. desde el detalle de una Section),
  // se precarga y se bloquea el <SectionSelect> para no permitir cambiarla por error.
  const contextualIdSection = !isEdit ? Number(searchParams.get('id_section')) || undefined : undefined
  // En edición, la sección SIEMPRE queda bloqueada (ya viene del registro) — mover un item de
  // una sección a otra no es una acción que este form deba permitir de forma casual.
  const sectionSelectDisabled = isEdit || contextualIdSection !== undefined

  const { currentItem, items, loadById, setCurrentItem }            = useSectionItemListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useSectionItemFormStore()
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  // "Tipo" y "Clave interna" quedan OCULTOS (no solo deshabilitados) cuando el item ya tiene uno
  // de estos tipos de identidad — el sitio web los busca por `item_type`/`key` exacto, cambiarlos
  // rompería esa conexión sin ningún aviso (ver SECTION_ITEM_IDENTITY_TYPES). No aplica al crear:
  // estos items siempre vienen pre-sembrados, nunca se crean desde el intranet.
  const isIdentityLocked = isEdit && !!resolved?.type && SECTION_ITEM_IDENTITY_TYPES.has(resolved.type)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_section: contextualIdSection,
      sectionitem_type: NO_TYPE,
      sectionitem_key: '', sectionitem_title: '', sectionitem_subtitle: '', sectionitem_description: '',
      sectionitem_label: '', sectionitem_value: '', sectionitem_suffix: '', sectionitem_icon: '', sectionitem_link: '',
      sectionitem_variant: '', sectionitem_rating: undefined, sectionitem_latitude: undefined, sectionitem_longitude: undefined,
      sectionitem_state: 1,
    },
  })

  useEffect(() => {
    if (isEdit && id) void loadById(Number(id))
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_section:              resolved.idSection,
        sectionitem_type:        resolved.type ?? NO_TYPE,
        sectionitem_key:         resolved.key ?? '',
        sectionitem_title:       resolved.title ?? '',
        sectionitem_subtitle:    resolved.subtitle ?? '',
        sectionitem_description: resolved.description ?? '',
        sectionitem_label:       resolved.label ?? '',
        sectionitem_value:       resolved.value ?? '',
        sectionitem_suffix:      resolved.suffix ?? '',
        sectionitem_icon:        resolved.icon ?? '',
        sectionitem_link:        resolved.link ?? '',
        sectionitem_variant:     resolved.variant ?? '',
        sectionitem_rating:      resolved.rating ?? undefined,
        sectionitem_latitude:    resolved.latitude ?? undefined,
        sectionitem_longitude:   resolved.longitude ?? undefined,
        sectionitem_state:       resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  // ¿La sección elegida es especial? Ahí el formulario solo muestra lo que la web usa:
  //   isShowcase          → hero de Servicios (modo "Servicio")
  //   isCategoryCoverflow → carrusel «Muebles a medida» (modo "Categoría")
  const watchedIdSection = form.watch('id_section')
  const {
    isShowcase, isCategoryCoverflow, isChecking: isCheckingSection, typeKey: sectionTypeKey,
  } = useShowcaseItemMode(watchedIdSection)
  // Modos especiales: el formulario va a todo el ancho
  const isSpecialMode = isShowcase || isCategoryCoverflow

  // Tipos de item que acepta la sección en la web (ver data/item-types-by-section.ts):
  //   fixedType    → la sección usa UN solo tipo: se fija y no se muestra el select.
  //   allowedTypes → la sección acepta varios: el select solo ofrece esos.
  //   ambos null   → sección no listada: select libre, como siempre.
  const allowedTypes = getAllowedItemTypes(sectionTypeKey)
  const fixedType = getFixedItemType(sectionTypeKey)

  // Hero de Servicios: un servicio nuevo nace OCULTO (se muestra cuando tenga fotos visibles).
  // Para las demás secciones se deja el valor de siempre (visible).
  useEffect(() => {
    if (!isEdit) form.setValue('sectionitem_state', isShowcase ? 0 : 1)
  }, [isEdit, isShowcase])

  // Ajusta el "Tipo" cuando se conoce (o cambia) la sección elegida.
  // Va DESPUÉS del useEffect que hace form.reset() en edición, para no ser pisado por él.
  useEffect(() => {
    if (isSpecialMode || isCheckingSection) return // hero y carrusel tienen su propio modo; o aún cargando
    if (isEdit && !resolved) return             // en edición, esperar a que lleguen los datos

    const current = form.getValues('sectionitem_type')

    if (fixedType) {
      // Tipo fijo: se fuerza al crear y TAMBIÉN al editar si venía vacío o distinto,
      // porque la web solo encuentra los items de esta sección con ese tipo exacto.
      if (current !== fixedType) form.setValue('sectionitem_type', fixedType, { shouldDirty: isEdit })
      return
    }

    if (isEdit) return // varios permitidos o sección libre: en edición se respeta lo guardado

    if (allowedTypes) {
      // Varios permitidos: preseleccionar el primero si el actual no es uno de ellos.
      if (!current || !allowedTypes.includes(current)) form.setValue('sectionitem_type', allowedTypes[0])
    } else {
      // Sección no listada: se limpia el tipo que pudo dejar la sección anterior.
      form.setValue('sectionitem_type', NO_TYPE)
    }
  }, [isSpecialMode, isCheckingSection, sectionTypeKey, isEdit, resolved?.id])

  /** Tipo a guardar: hero 'showcase'; carrusel 'category'; en el resto, el elegido en el select. */
  const getItemType = (values: FormValues) => {
    if (isShowcase) return SHOWCASE_ITEM_TYPE
    if (isCategoryCoverflow) return CATEGORY_ITEM_TYPE
    return values.sectionitem_type && values.sectionitem_type !== NO_TYPE ? values.sectionitem_type : undefined
  }

  // Qué campos mostrar según el tipo elegido — evita un formulario de 12 campos cuando el tipo
  // solo usa 4 (ver SECTION_ITEM_TYPE_FIELDS). Sin tipo (o uno no contemplado en el mapa) cae al
  // fallback seguro: mostrar todo, para no ocultar algo que sí haga falta en un caso no previsto.
  const watchedType = form.watch('sectionitem_type')
  const fieldsForType = watchedType && watchedType !== NO_TYPE ? SECTION_ITEM_TYPE_FIELDS[watchedType] : undefined
  const visibleFields = fieldsForType ? new Set(fieldsForType) : null
  const showField = (f: SectionItemField) => visibleFields === null || visibleFields.has(f)
  // El mapa es pesado y solo lo usa el local de Contacto: solo se muestra si el tipo
  // elegido lleva latitud/longitud (hoy solo 'branch'), nunca por el fallback "mostrar todo".
  const showLocation = visibleFields?.has('location') ?? false
  const variantOptions = watchedType ? SECTION_ITEM_VARIANT_OPTIONS[watchedType] : undefined
  const watchedVariant = form.watch('sectionitem_variant')
  const watchedLatitude = form.watch('sectionitem_latitude')
  const watchedLongitude = form.watch('sectionitem_longitude')

  const toPreviewPayload = (values: FormValues): PreviewPayload => ({
    entity: 'section_item',
    id: isEdit ? resolved!.id : null,
    id_section: values.id_section,
    fields: {
      item_type: getItemType(values) ?? null,
      key: values.sectionitem_key || null,
      title: values.sectionitem_title || null,
      subtitle: values.sectionitem_subtitle || null,
      description: values.sectionitem_description || null,
      label: values.sectionitem_label || null,
      value: values.sectionitem_value || null,
      suffix: values.sectionitem_suffix || null,
      icon: values.sectionitem_icon || null,
      link: values.sectionitem_link || null,
      variant: values.sectionitem_variant || null,
      rating: values.sectionitem_rating !== undefined && !Number.isNaN(values.sectionitem_rating) ? values.sectionitem_rating : null,
      latitude: values.sectionitem_latitude !== undefined && !Number.isNaN(values.sectionitem_latitude) ? values.sectionitem_latitude : null,
      longitude: values.sectionitem_longitude !== undefined && !Number.isNaN(values.sectionitem_longitude) ? values.sectionitem_longitude : null,
      state: values.sectionitem_state === 1,
    },
  })
  useLiveSitePreview(form, toPreviewPayload, isEdit ? !!resolved : true)

  const onSubmit = async (values: FormValues) => {
    // Hero de Servicios: el nombre del servicio es obligatorio
    if (isShowcase && !values.sectionitem_title?.trim()) {
      form.setError('sectionitem_title', { message: 'Escribe el nombre del servicio.' })
      return
    }
    // Carrusel de categorías: hay que elegir la categoría (su clave lleva el id)
    if (isCategoryCoverflow && getCategoryIdFromKey(values.sectionitem_key) == null) {
      form.setError('sectionitem_key', { message: 'Elige una categoría.' })
      return
    }

    const label = values.sectionitem_title || values.sectionitem_label || 'este item'
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear item?',
      text: label,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const basePayload = {
      id_section:              values.id_section,
      sectionitem_type:        getItemType(values),
      sectionitem_key:         values.sectionitem_key || undefined,
      sectionitem_title:       values.sectionitem_title || undefined,
      sectionitem_subtitle:    values.sectionitem_subtitle || undefined,
      sectionitem_description: values.sectionitem_description || undefined,
      sectionitem_label:       values.sectionitem_label || undefined,
      sectionitem_value:       values.sectionitem_value || undefined,
      sectionitem_suffix:      values.sectionitem_suffix || undefined,
      sectionitem_icon:        values.sectionitem_icon || undefined,
      sectionitem_link:        values.sectionitem_link || undefined,
      sectionitem_variant:     values.sectionitem_variant || undefined,
      sectionitem_rating:      values.sectionitem_rating !== undefined && !Number.isNaN(values.sectionitem_rating) ? values.sectionitem_rating : undefined,
      sectionitem_latitude:    values.sectionitem_latitude !== undefined && !Number.isNaN(values.sectionitem_latitude) ? values.sectionitem_latitude : undefined,
      sectionitem_longitude:   values.sectionitem_longitude !== undefined && !Number.isNaN(values.sectionitem_longitude) ? values.sectionitem_longitude : undefined,
    }

    const success = isEdit
      ? await update(resolved!.id, {
          ...basePayload,
          sectionitem_state:      values.sectionitem_state,
          sectionitem_updated_at: formatDatetime(),
        })
      : await create({
          ...basePayload,
          sectionitem_state:      values.sectionitem_state,
          sectionitem_created_at: formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', label)
      goBackOrFallback(router, '/section-items')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  // Campo "Sección": igual en el formulario general y en los modos especiales
  const sectionField = (
    <FormField control={form.control} name="id_section" render={({ field }) => (
      <FormItem>
        <FormLabel>Sección <span className="text-destructive">*</span></FormLabel>
        <FormControl>
          <SectionSelect
            value={field.value ?? null}
            onValueChange={(v) => field.onChange(v)}
            placeholder="Seleccionar sección"
            disabled={sectionSelectDisabled}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )

  // ¿Ya se sabe CÓMO se ve el formulario? Mientras no, se muestra un esqueleto:
  //  - Siempre: el tipo de la sección (decide el modo: Servicio, Categoría, Trabajo o general).
  //  - Al editar: que ya llegó el item y el formulario ya tiene SU sección (form.reset corre
  //    después del primer render; sin esta condición se vería un instante el formulario general).
  // (Va después de todos los hooks: un return antes de un hook rompe las reglas de React.)
  const isFormReady = !isCheckingSection && (!isEdit || (!!resolved && watchedIdSection === resolved.idSection))
  if (!isFormReady) return <FormSkeleton cards={2} fluid={isSpecialMode || isEdit} />

  return (
    <Form {...form}>
      {/* Hero de Servicios, carrusel de categorías y Restauración: a todo el ancho. Resto: ancho de siempre */}
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', !isSpecialMode && 'max-w-3xl')}>
        {isShowcase ? (
          // Sección especial: hero de Servicios (ver ./showcase)
          <ShowcaseItemFields
            form={form}
            sectionField={sectionField}
            isEdit={isEdit}
            idSection={watchedIdSection}
            idSectionItem={isEdit ? resolved?.id : null}
          />
        ) : isCategoryCoverflow ? (
          // Sección especial: carrusel «Muebles a medida» (ver ./category)
          <CategoryItemFields
            form={form}
            sectionField={sectionField}
            isEdit={isEdit}
            idSection={watchedIdSection}
            idSectionItem={isEdit ? resolved?.id : null}
          />
        ) : (
          // Resto de secciones: formulario general
          <>
            {/* Aviso — este ítem no es "solo un dato de contacto": maneja el botón flotante de
                WhatsApp visible en TODAS las páginas del sitio (ver Footer.tsx del frontend web). */}
            {watchedType === 'whatsapp' && (
              <Alert className="border-green-600/30 bg-green-50 dark:bg-green-950">
                <MessageCircle className="text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">Este ítem es el botón flotante de WhatsApp</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  No es solo un dato de contacto: controla el botón redondo de WhatsApp que aparece flotando en <strong>todas las páginas</strong> del sitio web, no solo en Contacto. &quot;Valor&quot; es el número, &quot;Estado&quot; lo muestra u oculta, y &quot;Posición&quot; decide en qué esquina de la pantalla aparece.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="size-4" />Datos generales</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {sectionField}

                  {/* Campo "Tipo" — 4 casos, en este orden:
                      1. Item de identidad en edición → solo lectura (ver isIdentityLocked).
                      2. La sección usa un solo tipo   → solo lectura (fixedType).
                      3. La sección acepta varios      → select limitado a esos (allowedTypes).
                      4. Sección no listada            → select libre, como siempre. */}
                  {isIdentityLocked ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">Tipo</span>
                      <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {typeLabelOf(resolved?.type)}
                      </code>
                      <p className="text-xs text-muted-foreground">El sitio web ubica este item por su tipo exacto — no es editable.</p>
                    </div>
                  ) : fixedType ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium">Tipo: {typeLabelOf(fixedType)}</span>
                      <p className="text-xs text-muted-foreground">Esta sección solo usa este tipo de item — no es editable.</p>
                    </div>
                  ) : (
                    <FormField control={form.control} name="sectionitem_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select key={`type-${field.value}`} value={field.value || NO_TYPE} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Elegir tipo" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {allowedTypes ? (
                              // Sección con varios tipos permitidos: solo esos
                              allowedTypes.map((value) => (
                                <SelectItem key={value} value={value}>{typeLabelOf(value)}</SelectItem>
                              ))
                            ) : (
                              // Sección no listada: todos los tipos sugeridos + "Sin tipo"
                              <>
                                <SelectItem value={NO_TYPE}>Sin tipo</SelectItem>
                                {SECTION_ITEM_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  {isIdentityLocked ? (
                    resolved?.key && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Clave interna</span>
                        <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{resolved.key}</code>
                        <p className="text-xs text-muted-foreground">El sitio web también ubica este item por esta clave — no es editable.</p>
                      </div>
                    )
                  ) : showField('key') && (
                    <FormField control={form.control} name="sectionitem_key" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clave interna</FormLabel>
                        <FormControl><Input placeholder="Ej: experience" maxLength={100} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4" />Estado</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <FormField control={form.control} name="sectionitem_state" render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                      <FormControl>
                        <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <p className="text-xs text-muted-foreground">
                    El orden del item (<code className="rounded bg-muted px-1 py-0.5">sectionitem_order</code>) no se edita aquí — se gestiona desde &quot;Reordenar&quot;.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="size-4" />Contenido</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(showField('title') || showField('subtitle')) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {showField('title') && (
                      <FormField control={form.control} name="sectionitem_title" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sectionItemTitleLabel(watchedType)}</FormLabel>
                          <FormControl><Input placeholder="Ej: Años de experiencia" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {showField('subtitle') && (
                      <FormField control={form.control} name="sectionitem_subtitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl><Input placeholder="Subtítulo opcional" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                {showField('description') && (
                  <FormField control={form.control} name="sectionitem_description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl><Textarea placeholder="Descripción del item" className="resize-none" rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {(showField('label') || showField('value') || showField('suffix')) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {showField('label') && (
                      <FormField control={form.control} name="sectionitem_label" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sectionItemLabelLabel(watchedType)}</FormLabel>
                          <FormControl><Input placeholder="Ej: Experiencia" maxLength={150} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {(showField('value') || showField('suffix')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {showField('value') && (
                          <FormField control={form.control} name="sectionitem_value" render={({ field }) => (
                            <FormItem>
                              <FormLabel>{sectionItemValueLabel(watchedType)}</FormLabel>
                              <FormControl><Input placeholder="Ej: 15" maxLength={255} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                        {showField('suffix') && (
                          <FormField control={form.control} name="sectionitem_suffix" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sufijo</FormLabel>
                              <FormControl><Input placeholder="Ej: +" maxLength={30} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(showField('icon') || showField('variant')) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {showField('icon') && (
                      <FormField control={form.control} name="sectionitem_icon" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icono</FormLabel>
                          <FormControl>
                            <IconPicker value={field.value || null} onValueChange={(v) => field.onChange(v ?? '')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {showField('variant') && (
                      <FormField control={form.control} name="sectionitem_variant" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{sectionItemVariantLabel(watchedType)}</FormLabel>
                          {variantOptions ? (
                            <Select value={field.value || variantOptions[0]?.value} onValueChange={field.onChange}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {variantOptions.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl><Input placeholder="Ej: red" maxLength={50} {...field} /></FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                {/* Vista previa de ubicación — solo para "whatsapp" (el botón flotante que se ve en
                    todas las páginas del sitio), para no tener que adivinar el resultado ni
                    publicar para verlo. Mismas 5 posiciones que `WHATSAPP_POSITION_CLASS` en
                    Footer.tsx del frontend web. */}
                {watchedType === 'whatsapp' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Vista previa de ubicación</span>
                    <div className="relative w-full max-w-[220px] aspect-[9/16] rounded-lg border bg-muted/40 overflow-hidden">
                      <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-muted-foreground/15" />
                      <div className="absolute inset-x-3 top-7 h-2 w-2/3 rounded-full bg-muted-foreground/15" />
                      <div
                        className={cn(
                          'absolute flex size-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md',
                          WHATSAPP_POSITION_PREVIEW_CLASS[watchedVariant || 'bottom-right']
                        )}
                      >
                        <FaIcon value="fa-brands fa-whatsapp" className="size-4" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Así se ubicará el botón flotante en todas las páginas del sitio.</p>
                  </div>
                )}

                {showField('link') && (
                  <FormField control={form.control} name="sectionitem_link" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sectionItemLinkLabel(watchedType)}</FormLabel>
                      <FormControl><Input placeholder="https://..." maxLength={500} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {showField('rating') && (
                  <FormField control={form.control} name="sectionitem_rating" render={({ field }) => (
                    <FormItem className="max-w-[180px]">
                      <FormLabel>Valoración</FormLabel>
                      <FormControl>
                        <Input
                          type="number" step="0.1" min={0} max={9.9} placeholder="4.8"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </CardContent>
            </Card>

            {showLocation && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="size-4" />Ubicación</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <LocationPicker
                      latitude={typeof watchedLatitude === 'number' && !Number.isNaN(watchedLatitude) ? watchedLatitude : null}
                      longitude={typeof watchedLongitude === 'number' && !Number.isNaN(watchedLongitude) ? watchedLongitude : null}
                      onChange={(lat, lng) => {
                        form.setValue('sectionitem_latitude', lat, { shouldDirty: true, shouldValidate: true })
                        form.setValue('sectionitem_longitude', lng, { shouldDirty: true, shouldValidate: true })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Hacé click en el mapa para ubicar el punto, o arrastrá el pin — los campos de abajo se actualizan solos. También podés escribirlos a mano.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="sectionitem_latitude" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud</FormLabel>
                        <FormControl>
                          <Input
                            type="number" step="any" placeholder="-3.7891234"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sectionitem_longitude" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud</FormLabel>
                        <FormControl>
                          <Input
                            type="number" step="any" placeholder="-73.2456789"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/section-items')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
