'use client'

// Una fila del editor "Apariencia": pinta el control según el `type` del campo del catálogo
// (toggle, text, textarea, number, select, list) con su ayuda, ↺ "Restablecer" y ⌖ "Ubicar en la
// vista previa". Al pasar el mouse (o el foco del teclado) por la fila, resalta el elemento en la
// vista previa.

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { LocateFixed, RotateCcw, type LucideIcon } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import type { SectionDisplaySchemaField } from '../../model/sectionget.dto'
import { AppearanceListField } from './appearance-list-field'

// Espera antes de resaltar al pasar el mouse: evita una lluvia de resaltados al recorrer la lista.
const HOVER_HIGHLIGHT_MS = 400

/** Botón chico, solo ícono, con tooltip (⌖ ubicar / ↺ restablecer de cada fila). */
export function AppearanceIconButton({
  icon: Icon, label, onClick, disabled,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-9"
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

type Props = {
  field: SectionDisplaySchemaField
  /** Valor que muestra el control (lo que escribió el admin o lo guardado). */
  value: unknown
  /** ¿El valor final es el de fábrica? (oculta ↺). */
  isDefault: boolean
  /** Está debajo de un interruptor (`depends_on`): se indenta. */
  nested: boolean
  /** Su interruptor está apagado: se atenúa y no se puede editar. */
  disabled: boolean
  /** Nombre del interruptor del que depende (para explicar por qué está atenuado). */
  parentLabel: string | null
  /** El campo se editó y todavía no se guardó. */
  changed: boolean
  errors?: string[]
  onChange: (value: unknown) => void
  onReset: () => void
  /** `switchPage` = vino del botón ⌖ «Ubicar en la vista previa» (puede cambiar la página del preview). */
  onHighlight: (switchPage: boolean) => void
}

export function AppearanceField({
  field, value, isDefault, nested, disabled, parentLabel, changed, errors, onChange, onReset, onHighlight,
}: Props) {
  const id = useId()
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  const hasElement = !!field.element
  const rowEvents = hasElement
    ? {
        onMouseEnter: () => {
          clearTimeout(hoverTimerRef.current)
          hoverTimerRef.current = setTimeout(() => onHighlight(false), HOVER_HIGHLIGHT_MS)
        },
        onMouseLeave: () => clearTimeout(hoverTimerRef.current),
        onFocus: () => onHighlight(false),
      }
    : {}

  const locateButton = hasElement && (
    <AppearanceIconButton icon={LocateFixed} label="Ubicar en la vista previa" onClick={() => onHighlight(true)} />
  )
  const resetButton = field.type !== 'toggle' && !isDefault && (
    <AppearanceIconButton icon={RotateCcw} label="Restablecer (volver al original)" onClick={onReset} disabled={disabled} />
  )

  const title = (
    <Label htmlFor={id} className={cn('font-normal leading-snug', changed && 'font-medium')}>
      {field.label}
      {changed && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Cambio sin guardar" />}
    </Label>
  )
  const help = (field.help || (disabled && parentLabel)) && (
    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
      {field.help && <p>{field.help}</p>}
      {disabled && parentLabel && <p className="italic">Se usa solo si «{parentLabel}» está activado.</p>}
    </div>
  )
  const errorText = errors?.length ? <p className="text-xs text-destructive">{errors.join(' ')}</p> : null

  let body: ReactNode
  switch (field.type) {
    case 'toggle':
      body = (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">{title}{help}</div>
          <div className="flex shrink-0 items-center gap-1">
            {locateButton}
            <Switch id={id} checked={value === true} onCheckedChange={onChange} disabled={disabled} />
          </div>
        </div>
      )
      break

    case 'text':
    case 'textarea': {
      const text = typeof value === 'string' ? value : ''
      const common = {
        id,
        value: text,
        placeholder: field.default || 'Vacío',
        maxLength: field.max,
        disabled,
        'aria-invalid': !!errors?.length,
      }
      body = (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            {title}
            <div className="flex shrink-0 items-center gap-0.5">{resetButton}{locateButton}</div>
          </div>
          {field.type === 'textarea'
            ? <Textarea {...common} rows={2} onChange={(e) => onChange(e.target.value)} />
            : <Input {...common} onChange={(e) => onChange(e.target.value)} />}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {help}
              {!field.allow_empty && (
                <p className="text-xs text-muted-foreground/80">Si lo deja vacío, se usa el texto original.</p>
              )}
            </div>
            {field.max && (
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{text.length}/{field.max}</span>
            )}
          </div>
        </div>
      )
      break
    }

    case 'number': {
      const range = field.min !== undefined && field.max !== undefined ? `Entre ${field.min} y ${field.max}.` : null
      body = (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {title}{help}
            {range && <p className="text-xs text-muted-foreground/80">{range}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {resetButton}{locateButton}
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              className="w-20"
              min={field.min}
              max={field.max}
              placeholder={String(field.default)}
              value={typeof value === 'number' || typeof value === 'string' ? value : ''}
              disabled={disabled}
              aria-invalid={!!errors?.length}
              onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              // Al salir del campo se acomoda al rango permitido (ej. 9 → 6)
              onBlur={(e) => {
                const n = Number(e.target.value)
                if (e.target.value === '' || !Number.isFinite(n)) return
                const clamped = Math.min(field.max ?? n, Math.max(field.min ?? n, Math.round(n)))
                if (clamped !== n) onChange(clamped)
              }}
            />
          </div>
        </div>
      )
      break
    }

    case 'select':
      body = (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">{title}{help}</div>
          <div className="flex shrink-0 items-center gap-0.5">
            {resetButton}{locateButton}
            <Select value={typeof value === 'string' ? value : field.default} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger id={id} className="w-full min-w-44 sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
      break

    case 'list':
      body = (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {title}
            <div className="flex shrink-0 items-center gap-0.5">{resetButton}{locateButton}</div>
          </div>
          {help}
          <AppearanceListField field={field} value={value} disabled={disabled} onChange={onChange} />
        </div>
      )
      break
  }

  return (
    <div
      {...rowEvents}
      className={cn(
        'rounded-lg px-3 py-3 transition-colors hover:bg-muted/40 focus-within:bg-muted/40',
        nested && 'ml-4 border-l-2 border-muted pl-4 sm:ml-6',
        disabled && 'opacity-60',
      )}
    >
      {body}
      {errorText}
    </div>
  )
}
