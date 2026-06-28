'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Pipette, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { TYPECOLOR_HEX_FORMATS } from '../../data/data'
import { useTypeColorListStore } from '../../stores/useTypeColorListStore'
import { useTypeColorFormStore } from '../../stores/useTypeColorFormStore'

const schema = z.object({
  typecolor_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  typecolor_code:        z.string().max(20, 'Máximo 20 caracteres.').or(z.literal('')).optional(),
  typecolor_hex:         z.string().max(50, 'Máximo 50 caracteres.').or(z.literal('')).optional(),
  typecolor_image:       z.string().url('Debe ser una URL válida.').or(z.literal('')).optional(),
  typecolor_sort_order:  z.coerce.number().int().min(0, 'Debe ser 0 o mayor.').optional(),
  typecolor_description: z.string().optional(),
  typecolor_state:       z.number(),
})

type FormValues = z.infer<typeof schema>

// ─── Color picker component ───────────────────────────────────────────────────

function CssColorInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const pickerRef = useRef<HTMLInputElement>(null)

  /* Best-effort: extract a 6-digit hex from the current value to seed the
     native picker (it only accepts #RRGGBB). Falls back to black. */
  const pickerSeed = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)
    ? value.slice(0, 7)
    : '#000000'

  const hasValue = value.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Large live-preview swatch */}
      <div
        className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all"
        style={hasValue ? { backgroundColor: value } : undefined}
      >
        {!hasValue ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted">
            <Pipette className="size-5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Vista previa del color</span>
          </div>
        ) : (
          /* Overlay showing the value on hover */
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
            <span className="rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
              {value}
            </span>
          </div>
        )}
      </div>

      {/* Input row: picker button + text field + clear */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              onClick={() => pickerRef.current?.click()}
              className="relative flex size-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border shadow-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={hasValue ? { backgroundColor: value } : undefined}
            >
              {!hasValue && <Pipette className="size-4 text-muted-foreground" />}
              <input
                ref={pickerRef}
                type="color"
                value={pickerSeed}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="sr-only"
                tabIndex={-1}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Selector rápido (hex)</TooltipContent>
        </Tooltip>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder='Ej: #5C4033 · rgb(92, 64, 51) · hsl(25, 56%, 40%)'
          className="font-mono text-sm"
        />

        {hasValue && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('')}
            className="flex size-9 flex-shrink-0 items-center justify-center rounded-md border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Limpiar color"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Accepted format chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Formatos:</span>
        {TYPECOLOR_HEX_FORMATS.map(({ label, example }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(example)}
                className="cursor-pointer rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition hover:bg-muted/80 hover:text-foreground disabled:pointer-events-none"
              >
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs">
              {example}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function TypeColorForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router  = useRouter()
  const { currentItem, items }                                      = useTypeColorListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useTypeColorFormStore()
  const isEdit   = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      typecolor_name:        '',
      typecolor_code:        '',
      typecolor_hex:         '',
      typecolor_image:       '',
      typecolor_sort_order:  0,
      typecolor_description: '',
      typecolor_state:       1,
    },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        typecolor_name:        resolved.name,
        typecolor_code:        resolved.code ?? '',
        typecolor_hex:         resolved.hex ?? '',
        typecolor_image:       resolved.image ?? '',
        typecolor_sort_order:  resolved.sortOrder,
        typecolor_description: resolved.description ?? '',
        typecolor_state:       resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title:       isEdit ? '¿Guardar cambios?' : '¿Crear tipo de color?',
      text:        values.typecolor_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText:  'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      typecolor_name:        values.typecolor_name,
      typecolor_code:        values.typecolor_code        || undefined,
      typecolor_hex:         values.typecolor_hex         || undefined,
      typecolor_image:       values.typecolor_image       || undefined,
      typecolor_sort_order:  values.typecolor_sort_order,
      typecolor_description: values.typecolor_description || undefined,
      typecolor_state:       values.typecolor_state,
    }

    const success = isEdit
      ? await update(resolved!.id, { ...payload, typecolor_updated_at: formatDatetime() })
      : await create({ ...payload, typecolor_created_at: formatDatetime() })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.typecolor_name)
      router.push('/typecolors')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  const hexValue = form.watch('typecolor_hex') ?? ''

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">

        {/* ── Información básica ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="typecolor_name" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Nogal oscuro" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="typecolor_code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código interno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: COL-001"
                      className="font-mono"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="typecolor_state" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    key={`state-${field.value}`}
                    value={String(field.value)}
                    disabled={isSubmitting}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
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

              <FormField control={form.control} name="typecolor_sort_order" render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden en catálogo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="typecolor_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción opcional del tipo de color"
                    className="resize-none"
                    rows={3}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* ── Apariencia ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Apariencia del color
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField control={form.control} name="typecolor_hex" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor CSS del color</FormLabel>
                <CssColorInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )} />

            <Separator />

            <FormField control={form.control} name="typecolor_image" render={({ field }) => (
              <FormItem>
                <FormLabel>URL de imagen / textura</FormLabel>
                <div className="flex items-center gap-3">
                  {/* Mini preview if there's a color */}
                  {hexValue && (
                    <div
                      className="size-9 flex-shrink-0 rounded-md border shadow-sm"
                      style={{ backgroundColor: hexValue }}
                    />
                  )}
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
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

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/typecolors')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar cambios' : 'Crear color'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
