'use client'

// SOLO para la sección hero de Servicios (service_showcase).
// Campos del formulario de item cuando la sección es el hero: solo lo que la web usa
// (nombre, descripción, texto y enlace del botón, y si se muestra). Ver sectionimages/grouped/README.md.

import { useEffect, type ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Activity, LayoutGrid, Loader2, MousePointerClick } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import type { SectionItemFormValues } from '../section-item-form'
import { ShowcaseLinkPicker } from './showcase-link-picker'
import { GALLERY_LINK } from './showcase-link'
import { useServiceVisiblePhotos } from './use-service-visible-photos'

interface ShowcaseItemFieldsProps {
  form: UseFormReturn<SectionItemFormValues>
  /** Campo "Sección" ya armado por el formulario padre (igual que en el formulario general). */
  sectionField: ReactNode
  isEdit: boolean
  /** Sección y servicio (item) que se edita — para saber si el servicio tiene fotos visibles. */
  idSection: number | null | undefined
  idSectionItem: number | null | undefined
}

/**
 * Formulario práctico para un servicio del hero de Servicios.
 * Celular: 1 columna. Tablet (md): 2 columnas (Datos | Botón + Estado). Desktop (lg): 3 columnas.
 */
export function ShowcaseItemFields({ form, sectionField, isEdit, idSection, idSectionItem }: ShowcaseItemFieldsProps) {
  // Regla del hero: un servicio sin fotos visibles no se puede mostrar
  const { hasVisiblePhotos, isLoading: isCheckingPhotos } = useServiceVisiblePhotos(isEdit ? idSection : null, isEdit ? idSectionItem : null)
  const noVisiblePhotos = isEdit && hasVisiblePhotos === false

  // Crear: por defecto el botón lleva a la galería.
  // Si se cambia a otra sección (sale del modo hero) sin tocar el enlace, se limpia para no dejarlo en el formulario general.
  useEffect(() => {
    if (isEdit) return
    if (!form.getValues('sectionitem_link')) form.setValue('sectionitem_link', GALLERY_LINK)
    return () => {
      if (form.getValues('sectionitem_link') === GALLERY_LINK) form.setValue('sectionitem_link', '')
    }
  }, [isEdit])

  // Sin enlace = la web no muestra el botón (el texto no se usa)
  const hasButton = !!form.watch('sectionitem_link')?.trim()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* ── Datos del servicio (en md ocupa 2 filas: a su derecha van Botón y Estado) ── */}
      <Card className="md:row-span-2 lg:row-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="size-4" />Datos del servicio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Tipo fijo: siempre "showcase", no se puede cambiar */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tipo</span>
            <code className="w-fit rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Servicio del hero</code>
          </div>

          {sectionField}

          <FormField control={form.control} name="sectionitem_title" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del servicio <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="Ej: Muebles a medida" maxLength={150} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sectionitem_description" render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl><Textarea placeholder="Describe el servicio" className="resize-none" rows={5} {...field} /></FormControl>
              <FormDescription>Opcional. Texto que aparece al abrir el panel del servicio.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>

      {/* ── Botón ── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MousePointerClick className="size-4" />Botón</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Enlace guiado: el picker solo escribe el valor de sectionitem_link */}
          <FormField control={form.control} name="sectionitem_link" render={({ field }) => (
            <FormItem>
              <ShowcaseLinkPicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sectionitem_label" render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del botón</FormLabel>
              <FormControl><Input placeholder="Ver trabajos" maxLength={150} {...field} disabled={!hasButton} /></FormControl>
              <FormDescription>
                {hasButton ? 'Si lo dejas vacío se usa «Ver trabajos».' : 'No se mostrará botón.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>

      {/* ── Estado (en md queda debajo de Botón) ── */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4" />Estado</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          <FormField control={form.control} name="sectionitem_state" render={({ field }) => {
            const isOn = field.value === 1
            // Crear: nace oculto (no se puede encender). Editar: solo se enciende si tiene fotos visibles.
            const isLocked = !isOn && (!isEdit || noVisiblePhotos || isCheckingPhotos)
            return (
              <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <FormLabel className="font-normal">Mostrar en el sitio web</FormLabel>
                <div className="flex items-center gap-2">
                  {isCheckingPhotos && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                  <FormControl>
                    <VisibilityToggle checked={isOn} disabled={isLocked} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )
          }} />

          {!isEdit && (
            <p className="text-xs text-muted-foreground">Se mostrará en la web cuando le agregues fotos (pestaña Imágenes).</p>
          )}
          {noVisiblePhotos && (
            <p className="text-xs text-amber-600 dark:text-amber-400">Agrega o muestra al menos una foto de este servicio para poder mostrarlo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
