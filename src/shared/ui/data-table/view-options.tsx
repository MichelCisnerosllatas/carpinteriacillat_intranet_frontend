'use client'

import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'

/**
 * Etiqueta legible en español de cada columna, para el popup de "Columnas" (ver abajo) — no
 * se puede sacar del `header` de la columna porque ese es un render function (JSX), no un
 * string. Cada `columns.tsx` debe declarar `meta: { label: '...' }` en toda columna con
 * `enableHiding: true`; si falta, se cae al `id` técnico (en inglés) como antes, mejor que
 * romper. No hay augmentation de `ColumnMeta` en este proyecto — se lee igual que
 * `meta.className` en `*-table.tsx` (cast a `any`).
 */
const getColumnLabel = <TData,>(column: import('@tanstack/react-table').Column<TData, unknown>): string =>
  (column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ms-auto hidden h-8 lg:flex">
          <MixerHorizontalIcon className="size-4" /> Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Antes filtraba también por `typeof col.accessorFn !== 'undefined'`, lo que excluía
            columnas válidas definidas solo con `id` (ej. "Fechas"), que no tienen accessorFn
            propio pero sí `enableHiding: true` — por eso desaparecían del popup aunque SÍ se
            mostraran en la tabla. `getCanHide()` ya es la única condición correcta. */}
        {table.getAllColumns().filter(col => col.getCanHide()).map(col => (
          <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={v => col.toggleVisibility(!!v)}>
            {getColumnLabel(col)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
