// src/features/web-works/ui/form/web-work-form.tsx
'use client'

// Formulario de Trabajo de la galería (crear / editar). Todo se guarda en UN solo POST/PUT:
// datos del trabajo + fotos de galería (`images`) + pares Antes/Después (`pairs`, solo restauración).
// Tarjetas:
//   a) Datos del trabajo        b) Mueble relacionado (opcional, rellena campos vacíos)
//   c) Portada y fotos          d) Pares Antes / Después (solo si el tipo es `restoration`)

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ClipboardList, Images, Loader2, Plus, Sofa, SplitSquareHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import { FormSkeleton } from '@/shared/ui/form-skeleton'
import { swalConfirm } from '@/shared/lib/swal'
import { toastError, toastInfo, toastSuccess } from '@/shared/lib/toast'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { goBackOrFallback } from '@/shared/lib/navigation-history'
import { AlertError } from '@/widgets/alerts_components'
import { useTypeWorkSelectStore } from '@/features/typeworks'
import { CategorySelect, CategoryQuickCreateDialog } from '@/features/categories'
import { TypeWoodSelect, TypeWoodQuickCreateDialog } from '@/features/typewoods'
import { FurnitureSelect, furnituresService } from '@/features/furnitures'
import { ImageSelect } from '@/features/images/ui/image-select'
import { getImageUrl, getImageDisplayName } from '@/features/images/lib/image-url'
import { webWorksService } from '../../services/web-works.service'
import { useWebWorkFormStore } from '../../stores/useWebWorkFormStore'
import { RESTORATION_KEY } from '../../data/data'
import type { WebWorkApiItem } from '../../model/webworkget.dto'
import type { WebWorkBaseBodyDto } from '../../model/webworkpost.dto'
import { WebWorksError } from '../web-works-error'
import { FormGroupTitle } from './form-group-title'
import { WebWorkPhotosField } from './web-work-photos-field'
import { WebWorkPairsField } from './web-work-pairs-field'
import {
  webWorkFormSchema, WEB_WORK_FORM_DEFAULTS,
  type WebWorkFormValues, type WebWorkPhotoFormValue,
} from './web-work-form.schema'

const FLUID_GRID = 'grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]'

type FurnitureDetail = Awaited<ReturnType<typeof furnituresService.getById>>['data']
type TypeOption = { id_typework: number; typework_key: string; typework_name: string }

const textOrNull = (v: string | undefined | null) => (v ?? '').trim() || null

/** API → valores del formulario (al editar). */
const toFormValues = (item: WebWorkApiItem): WebWorkFormValues => ({
  id_typework: item.id_typework,
  webwork_title: item.webwork_title ?? '',
  webwork_description: item.webwork_description ?? '',
  id_category: item.id_category,
  id_typewood: item.id_typewood,
  webwork_style: item.webwork_style ?? '',
  webwork_measures: item.webwork_measures ?? '',
  webwork_finish: item.webwork_finish ?? '',
  webwork_build_time: item.webwork_build_time ?? '',
  webwork_location: item.webwork_location ?? '',
  webwork_delivered_at: item.webwork_delivered_at ? item.webwork_delivered_at.slice(0, 10) : '',
  webwork_price_approx: item.webwork_price_approx != null ? String(item.webwork_price_approx) : '',
  webwork_state: item.webwork_state,
  id_furniture: item.id_furniture,
  id_image: item.id_image,
  images: (item.images ?? []).map((img) => ({
    id_web_work_image: img.id_web_work_image,
    id_image: img.id_image,
    url: img.url,
    name: img.name ?? `Imagen #${img.id_image}`,
    webworkimage_caption: img.webworkimage_caption ?? '',
    visible: img.webworkimage_state === 1,
  })),
  pairs: (item.pairs ?? []).map((p) => ({
    id_web_work_pair: p.id_web_work_pair,
    id_image_before: p.before?.id_image ?? null,
    before_url: p.before?.url ?? null,
    before_name: p.before?.name ?? '',
    id_image_after: p.after?.id_image ?? null,
    after_url: p.after?.url ?? null,
    after_name: p.after?.name ?? '',
    webworkpair_caption: p.webworkpair_caption ?? '',
    visible: p.webworkpair_state === 1,
  })),
})

interface WebWorkFormProps {
  mode: 'create' | 'edit'
  id?: string
  /** Solo al crear: mueble a preseleccionar (viene de `?id_furniture=` desde la ficha del mueble). */
  initialFurnitureId?: number | null
  /** Solo al crear: clave del tipo a preseleccionar (viene de `?typework_key=`, ej. pestaña Trabajos de «Restauración»). */
  initialTypeKey?: string | null
}

export function WebWorkForm({ mode, id, initialFurnitureId, initialTypeKey }: WebWorkFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const { isSubmitting, error, fieldErrors, create, update, reset } = useWebWorkFormStore()
  const { options: activeTypes, load: loadTypes } = useTypeWorkSelectStore()

  const [isLoading, setIsLoading]           = useState(isEdit)
  const [loadError, setLoadError]           = useState<string | null>(null)
  const [reloadKey, setReloadKey]           = useState(0)
  /** Tipo del trabajo cargado (por si está inactivo y no viene en el select de activos). */
  const [loadedType, setLoadedType]         = useState<TypeOption | null>(null)
  const [styles, setStyles]                 = useState<string[]>([])
  const [furniture, setFurniture]           = useState<FurnitureDetail | null>(null)
  const [loadingFurniture, setLoadingFurniture] = useState(false)
  const [coverPreview, setCoverPreview]     = useState<string | null>(null)
  const [showCategoryCreate, setShowCategoryCreate] = useState(false)
  const [showWoodCreate, setShowWoodCreate]         = useState(false)
  const prefilledFurniture = useRef(false)

  const form = useForm<WebWorkFormValues>({
    resolver: zodResolver(webWorkFormSchema),
    defaultValues: WEB_WORK_FORM_DEFAULTS,
  })

  const photos = useFieldArray({ control: form.control, name: 'images', keyName: 'key' })
  const pairs  = useFieldArray({ control: form.control, name: 'pairs', keyName: 'key' })

  const typeOptions = useMemo<TypeOption[]>(() => {
    const list: TypeOption[] = activeTypes.map((t) => ({ id_typework: t.id_typework, typework_key: t.typework_key, typework_name: t.typework_name }))
    if (loadedType && !list.some((t) => t.id_typework === loadedType.id_typework)) list.push(loadedType)
    return list
  }, [activeTypes, loadedType])

  const watchedType = form.watch('id_typework')
  const watchedCover = form.watch('id_image')
  const watchedFurniture = form.watch('id_furniture')
  const selectedType = typeOptions.find((t) => t.id_typework === watchedType) ?? null
  const isRestoration = selectedType?.typework_key === RESTORATION_KEY

  // Tipos activos + sugerencias de estilo (una sola vez)
  useEffect(() => {
    void loadTypes()
    webWorksService.getStyles()
      .then((res) => { if (res.success && Array.isArray(res.data)) setStyles(res.data) })
      .catch(() => {})
  }, [])

  useEffect(() => () => reset(), [])

  // Editar: el trabajo completo (con images y pairs) se pide por id
  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false
    webWorksService.getById(Number(id))
      .then((res) => {
        if (cancelled) return
        if (!res.success || !res.data) { setLoadError(res.message || 'No se encontró el trabajo.'); return }
        if (res.data.type) setLoadedType(res.data.type)
        form.reset(toFormValues(res.data))
      })
      .catch((e: any) => { if (!cancelled) setLoadError(e?.response?.data?.message ?? 'No se pudo cargar el trabajo.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [isEdit, id, reloadKey])

  // Crear: el tipo de `?typework_key=` si vino (y está activo); si no, el primer tipo activo
  // (normalmente Fabricación)
  useEffect(() => {
    if (!isEdit && form.getValues('id_typework') == null && activeTypes.length > 0) {
      const fromUrl = initialTypeKey ? activeTypes.find((t) => t.typework_key === initialTypeKey) : undefined
      form.setValue('id_typework', (fromUrl ?? activeTypes[0]).id_typework)
    }
  }, [isEdit, activeTypes, initialTypeKey])

  // Crear desde la ficha del mueble (?id_furniture=): se preselecciona y rellena
  useEffect(() => {
    if (isEdit || !initialFurnitureId || prefilledFurniture.current) return
    prefilledFurniture.current = true
    void handleFurnitureChange(initialFurnitureId)
  }, [isEdit, initialFurnitureId])

  // ── Mueble relacionado ──────────────────────────────────────────────────────

  const fetchFurniture = async (furnitureId: number): Promise<FurnitureDetail | null> => {
    setLoadingFurniture(true)
    try {
      const res = await furnituresService.getById(furnitureId)
      if (res.success && res.data) { setFurniture(res.data); return res.data }
      toastError('Error', 'No se pudo cargar el mueble.')
      return null
    } catch {
      toastError('Error', 'No se pudo cargar el mueble.')
      return null
    } finally {
      setLoadingFurniture(false)
    }
  }

  /** Rellena SOLO los campos vacíos con los datos del mueble (no pisa lo ya escrito). */
  const fillFromFurniture = (f: FurnitureDetail) => {
    const filled: string[] = []
    const v = form.getValues()
    if (!v.webwork_title.trim()) { form.setValue('webwork_title', f.furniture_title || f.furniture_name, { shouldDirty: true }); filled.push('título') }
    if (v.id_category == null && f.id_category) { form.setValue('id_category', f.id_category, { shouldDirty: true }); filled.push('categoría') }
    if (v.id_typewood == null && f.id_typewood) { form.setValue('id_typewood', f.id_typewood, { shouldDirty: true }); filled.push('madera') }
    if (!v.webwork_description.trim() && f.furniture_description) { form.setValue('webwork_description', f.furniture_description, { shouldDirty: true }); filled.push('descripción') }
    if (filled.length > 0) toastInfo('Datos del mueble', `Se completó: ${filled.join(', ')}.`)
  }

  async function handleFurnitureChange(furnitureId: number | null) {
    form.setValue('id_furniture', furnitureId, { shouldDirty: true })
    setFurniture(null)
    if (furnitureId == null) return
    const f = await fetchFurniture(furnitureId)
    if (f) fillFromFurniture(f)
  }

  /** "Usar sus fotos": agrega la portada y la galería del mueble a la lista de fotos (sin duplicar). */
  const handleUseFurniturePhotos = async () => {
    const furnitureId = form.getValues('id_furniture')
    if (furnitureId == null) return
    const f = furniture?.id_furniture === furnitureId ? furniture : await fetchFurniture(furnitureId)
    if (!f) return

    const candidates: WebWorkPhotoFormValue[] = []
    const pushImage = (img: { id_image: number; image_name: string | null; image_patch: string | null } | null | undefined) => {
      if (!img || !img.image_patch) return
      candidates.push({
        id_web_work_image: null,
        id_image: img.id_image,
        url: getImageUrl(img.image_patch),
        name: getImageDisplayName({ image_name: img.image_name, image_patch: img.image_patch }),
        webworkimage_caption: '',
        visible: true,
      })
    }
    pushImage(f.images)
    for (const g of f.gallery_images ?? []) pushImage(g.image)

    const existing = new Set(form.getValues('images').map((i) => i.id_image))
    const toAdd = candidates.filter((c) => {
      if (existing.has(c.id_image)) return false
      existing.add(c.id_image)
      return true
    })
    if (toAdd.length === 0) { toastInfo('Sin fotos nuevas', 'El mueble no tiene fotos o ya están todas en la lista.'); return }
    photos.append(toAdd)
    toastSuccess('Fotos agregadas', `${toAdd.length} foto(s) del mueble agregadas a la galería.`)
  }

  // ── Tipo ────────────────────────────────────────────────────────────────────

  const handleTypeChange = async (value: number) => {
    const next = typeOptions.find((t) => t.id_typework === value)
    const nextIsRestoration = next?.typework_key === RESTORATION_KEY
    const pairCount = form.getValues('pairs').length
    if (!nextIsRestoration && pairCount > 0) {
      const ok = await swalConfirm({
        title: '¿Cambiar el tipo de trabajo?',
        text: `«${next?.typework_name ?? 'Este tipo'}» no lleva pares Antes/Después: se eliminarán los ${pairCount} par(es) al guardar.`,
        confirmText: 'Sí, cambiar',
        cancelText: 'Cancelar',
        danger: true,
      })
      if (!ok) return
      pairs.replace([])
    }
    form.setValue('id_typework', value, { shouldDirty: true, shouldValidate: true })
  }

  // ── Guardar ─────────────────────────────────────────────────────────────────

  const onSubmit = async (values: WebWorkFormValues) => {
    if (values.id_typework == null) return
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear trabajo?',
      text: values.webwork_title, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const restoration = typeOptions.find((t) => t.id_typework === values.id_typework)?.typework_key === RESTORATION_KEY

    const body: WebWorkBaseBodyDto = {
      id_typework: values.id_typework,
      id_furniture: values.id_furniture,
      id_category: values.id_category,
      id_typewood: values.id_typewood,
      id_image: values.id_image,
      webwork_title: values.webwork_title.trim(),
      webwork_description: textOrNull(values.webwork_description),
      webwork_style: textOrNull(values.webwork_style),
      webwork_measures: textOrNull(values.webwork_measures),
      webwork_finish: textOrNull(values.webwork_finish),
      webwork_build_time: textOrNull(values.webwork_build_time),
      webwork_location: textOrNull(values.webwork_location),
      webwork_delivered_at: values.webwork_delivered_at || null,
      webwork_price_approx: values.webwork_price_approx.trim() === '' ? null : Number(values.webwork_price_approx),
      webwork_state: values.webwork_state,
      // Siempre se manda: la API sincroniza (crea / actualiza / borra) según este arreglo
      images: values.images.map((img) => ({
        ...(img.id_web_work_image ? { id_web_work_image: img.id_web_work_image } : {}),
        id_image: img.id_image,
        webworkimage_caption: textOrNull(img.webworkimage_caption),
        webworkimage_state: img.visible ? 1 : 0,
      })),
      // Solo restauración. Si no lo es, no se manda `pairs` y el backend borra los que hubiera.
      ...(restoration ? {
        pairs: values.pairs.map((p) => ({
          ...(p.id_web_work_pair ? { id_web_work_pair: p.id_web_work_pair } : {}),
          id_image_before: p.id_image_before as number,
          id_image_after: p.id_image_after as number,
          webworkpair_caption: textOrNull(p.webworkpair_caption),
          webworkpair_state: p.visible ? 1 : 0,
        })),
      } : {}),
    }

    const success = isEdit
      ? await update(Number(id), { ...body, webwork_updated_at: formatDatetime() })
      : await create({ ...body, webwork_created_at: formatDatetime() })

    if (success) {
      toastSuccess(isEdit ? 'Trabajo actualizado' : 'Trabajo creado', values.webwork_title)
      goBackOrFallback(router, '/web-works')
    } else {
      applyApiErrors(form, useWebWorkFormStore.getState().fieldErrors)
    }
  }

  if (isLoading) return <FormSkeleton cards={3} />
  if (loadError) return <WebWorksError title="Error al cargar el trabajo" message={loadError} onRetry={() => { setIsLoading(true); setLoadError(null); setReloadKey((k) => k + 1) }} />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className={FLUID_GRID}>
          {/* ── a) Datos del trabajo ── */}
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <FormGroupTitle icon={ClipboardList} title="Datos del trabajo" description="Lo que se muestra en la Galería de la web." />

              <FormField control={form.control} name="id_typework" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de trabajo <span className="text-destructive">*</span></FormLabel>
                  <Select key={`type-${field.value ?? 'none'}-${typeOptions.length}`} value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => void handleTypeChange(Number(v))}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {typeOptions.map((t) => (
                        <SelectItem key={t.id_typework} value={String(t.id_typework)}>{t.typework_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isRestoration && <FormDescription>Las restauraciones llevan pares de fotos Antes/Después (ver abajo).</FormDescription>}
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="webwork_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Ej: Cómoda Luis XV" maxLength={255} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="webwork_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea placeholder="Cuenta brevemente el trabajo..." className="resize-none" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="id_category" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Categoría</FormLabel>
                      <NewOptionButton onClick={() => setShowCategoryCreate(true)} disabled={isSubmitting} />
                    </div>
                    <FormControl><CategorySelect value={field.value} onValueChange={field.onChange} clearable /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="id_typewood" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Madera</FormLabel>
                      <NewOptionButton onClick={() => setShowWoodCreate(true)} disabled={isSubmitting} />
                    </div>
                    <FormControl><TypeWoodSelect value={field.value} onValueChange={field.onChange} clearable /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_style" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo</FormLabel>
                    <FormControl><Input placeholder="Ej: Clásico" list="webwork-style-suggestions" maxLength={100} {...field} /></FormControl>
                    <datalist id="webwork-style-suggestions">
                      {styles.map((s) => <option key={s} value={s} />)}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_measures" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medidas</FormLabel>
                    <FormControl><Input placeholder="Ej: 120 × 50 × 85 cm" maxLength={100} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_finish" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acabado</FormLabel>
                    <FormControl><Input placeholder="Ej: Laca mate" maxLength={150} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_build_time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de fabricación</FormLabel>
                    <FormControl><Input placeholder="Ej: 3 semanas" maxLength={100} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl><Input placeholder="Ej: Iquitos" maxLength={150} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_delivered_at" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de entrega</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="webwork_price_approx" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio aprox. (S/)</FormLabel>
                    <FormControl><Input type="number" inputMode="decimal" min={0} step="0.01" placeholder="Opcional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="webwork_state" render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="flex flex-col gap-0.5">
                    <FormLabel>Visible en la web</FormLabel>
                    <FormDescription>Oculto = se guarda pero no aparece en el sitio.</FormDescription>
                  </div>
                  <FormControl>
                    <VisibilityToggle checked={field.value === 1} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {/* ── b) Mueble relacionado ── */}
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                <FormGroupTitle icon={Sofa} title="Mueble relacionado (opcional)" description="Si el trabajo corresponde a un mueble del catálogo. Al elegirlo se completan los campos vacíos." />
                <FormField control={form.control} name="id_furniture" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mueble</FormLabel>
                    <FormControl>
                      <FurnitureSelect value={field.value} onValueChange={(v) => void handleFurnitureChange(v)} placeholder="Sin mueble relacionado" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {watchedFurniture != null && (
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => void handleUseFurniturePhotos()} disabled={loadingFurniture}>
                    {loadingFurniture ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Images className="mr-1 size-4" />}
                    Usar sus fotos
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── c.1) Portada ── */}
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                <FormGroupTitle icon={Images} title="Portada" description="Opcional: sin portada, la web usa la primera foto de la galería." />
                <FormField control={form.control} name="id_image" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onSelectedChange={(item) => setCoverPreview(item ? getImageUrl(item.image_patch) : null)}
                        placeholder="Seleccionar portada del banco"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {watchedCover != null && coverPreview && (
                  <div className="aspect-[4/3] w-full max-w-sm overflow-hidden rounded-md border bg-muted">
                    <img src={coverPreview} alt="Portada" className="h-full w-full object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── c.2) Fotos de galería ── */}
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormGroupTitle icon={Images} title="Fotos de galería" description="Se muestran en el detalle del trabajo, en este orden." />
            <WebWorkPhotosField
              photos={photos}
              coverId={watchedCover}
              onUseAsCover={({ id_image }) => form.setValue('id_image', id_image, { shouldDirty: true })}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* ── d) Pares Antes / Después (solo restauración) ── */}
        {isRestoration && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <FormGroupTitle icon={SplitSquareHorizontal} title="Pares Antes / Después" description="Cada par necesita una foto «Antes» y una «Después». Se muestran en el comparador «Restauración» y en el detalle." />
              <WebWorkPairsField pairs={pairs} disabled={isSubmitting} />
            </CardContent>
          </Card>
        )}

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => goBackOrFallback(router, '/web-works')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>

      {/* Fuera del <form>: el submit del modal no debe disparar el del trabajo. */}
      <CategoryQuickCreateDialog
        open={showCategoryCreate}
        onOpenChange={setShowCategoryCreate}
        onCreated={(item) => form.setValue('id_category', item.id_category, { shouldValidate: true, shouldDirty: true })}
      />
      <TypeWoodQuickCreateDialog
        open={showWoodCreate}
        onOpenChange={setShowWoodCreate}
        onCreated={(item) => form.setValue('id_typewood', item.id_typewood, { shouldValidate: true, shouldDirty: true })}
      />
    </Form>
  )
}

/** Atajo "+ Nuevo" junto a la etiqueta de un select: abre el modal de creación rápida (mismo que Secciones). */
function NewOptionButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      <Plus className="size-3.5" />Nuevo
    </button>
  )
}
