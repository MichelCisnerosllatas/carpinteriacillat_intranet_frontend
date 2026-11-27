'use client'

// Un grupo del editor "Apariencia" (ej. "Tarjeta de cada trabajo") dentro del acordeón: título,
// descripción, contador "N de M visibles", "Restablecer grupo" y sus campos en el orden del catálogo.

import { RotateCcw } from 'lucide-react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SectionDisplaySchemaField } from '../../model/sectionget.dto'
import { AppearanceField } from './appearance-field'
import { countVisible, groupPage, isDefaultValue, type AppearanceGroupView } from './appearance-values'

type Props = {
  view: AppearanceGroupView
  /** Valores finales de TODAS las claves (para contadores y dependencias). */
  values: Record<string, unknown>
  /** Valor que muestra cada control (lo escrito o lo guardado). */
  rawValue: (field: SectionDisplaySchemaField) => unknown
  /** Campos de todo el catálogo por clave (para el nombre del interruptor del que dependen). */
  fieldsByKey: Map<string, SectionDisplaySchemaField>
  changedKeys: Set<string>
  fieldErrors: Record<string, string[]> | null
  /** Con búsqueda se mezclan páginas: se indica en cuál está el grupo. */
  showPageBadge: boolean
  onChange: (key: string, value: unknown) => void
  onReset: (key: string) => void
  onResetGroup: () => void
  onHighlight: (field: SectionDisplaySchemaField, switchPage: boolean) => void
}

export function AppearanceGroup({
  view, values, rawValue, fieldsByKey, changedKeys, fieldErrors, showPageBadge,
  onChange, onReset, onResetGroup, onHighlight,
}: Props) {
  const { group, fields } = view
  const { on, total } = countVisible(fields, values)
  const changedCount = fields.filter((f) => changedKeys.has(f.key)).length
  const allDefault = fields.every((f) => isDefaultValue(f, values[f.key]))

  return (
    <AccordionItem value={group.key} className="rounded-xl border bg-card px-3 shadow-sm last:border-b sm:px-4">
      <AccordionTrigger className="gap-3 py-3 text-left hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{group.label}</span>
            {showPageBadge && (
              <Badge variant="outline" className="text-[11px] font-normal">
                {groupPage(group) === 'detail' ? 'Detalle' : 'Listado'}
              </Badge>
            )}
            {changedCount > 0 && (
              <Badge className="text-[11px] font-normal">
                {changedCount} {changedCount === 1 ? 'cambio' : 'cambios'}
              </Badge>
            )}
          </div>
          {group.description && <span className="text-xs font-normal text-muted-foreground">{group.description}</span>}
        </div>
        {total > 0 && (
          <Badge
            variant="secondary"
            className={cn('shrink-0 text-[11px] font-normal tabular-nums', on < total && 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400')}
          >
            {on} de {total} visibles
          </Badge>
        )}
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-1 pb-3">
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" disabled={allDefault} onClick={onResetGroup}>
            <RotateCcw className="mr-1.5 size-3.5" />Restablecer grupo
          </Button>
        </div>
        {fields.map((field) => {
          const parent = field.depends_on ? fieldsByKey.get(field.depends_on) ?? null : null
          return (
            <AppearanceField
              key={field.key}
              field={field}
              value={rawValue(field)}
              isDefault={isDefaultValue(field, values[field.key])}
              nested={!!parent}
              disabled={!!parent && values[parent.key] === false}
              parentLabel={parent?.label ?? null}
              changed={changedKeys.has(field.key)}
              errors={fieldErrors?.[`display_settings.${field.key}`]}
              onChange={(value) => onChange(field.key, value)}
              onReset={() => onReset(field.key)}
              onHighlight={(switchPage) => onHighlight(field, switchPage)}
            />
          )
        })}
      </AccordionContent>
    </AccordionItem>
  )
}
