'use client'

/**
 * <ModalSelect /> — versión "modal" del patrón de select global del proyecto.
 *
 * A diferencia de los `*-select.tsx` (Select/Combobox inline), este componente
 * abre un Dialog con: título + búsqueda (header, fijo), una tabla con scroll
 * vertical propio (body) y un botón "Seleccionar" por fila. Al elegir una fila
 * (clic, botón, o Enter con el teclado) se llama a `onSelect` con el objeto
 * completo y el modal se cierra solo.
 *
 * Es 100% genérico (vive en shared/ui, no puede depender de ninguna feature):
 * los datos, la carga y el error los controla quien lo use, típicamente un
 * store `useXModalSelectStore` + un método de servicio (`getForModalSelect`).
 *
 * Uso básico:
 *
 *   const [open, setOpen] = useState(false)
 *   const { options, isLoading, isError, load } = useRoleModalSelectStore()
 *   useEffect(() => { if (open) load() }, [open])
 *
 *   <ModalSelect
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Seleccionar rol"
 *     data={options}
 *     isLoading={isLoading}
 *     isError={isError}
 *     onRetry={load}
 *     getId={(r) => r.id_role}
 *     columns={[
 *       { header: 'Nombre', cell: (r) => r.role_name },
 *       { header: 'Estado', cell: (r) => (r.role_state === 1 ? 'Activo' : 'Inactivo') },
 *     ]}
 *     searchPlaceholder="Buscar rol..."
 *     onSelect={(role) => { setSelectedRole(role); }}
 *   />
 *
 * Navegación por teclado: flecha abajo/arriba mueve el resaltado entre las
 * filas visibles (ya filtradas por el buscador), Enter selecciona la fila
 * resaltada. Funciona tanto con el foco en el input de búsqueda como en la lista.
 */

import { useMemo } from 'react'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { ModalSelectHeader } from './modal-select-header'
import { ModalSelectBody } from './modal-select-body'
import { ModalSelectFooter } from './modal-select-footer'
import { useModalSelectKeyboard } from './use-modal-select-keyboard'
import type { ModalSelectProps } from './modal-select.types'

function defaultFilterFn<T>(item: T, columns: ModalSelectProps<T>['columns'], search: string) {
  const term = search.trim().toLowerCase()
  if (!term) return true
  return columns.some((col) => {
    const value = col.cell(item)
    return typeof value === 'string' || typeof value === 'number'
      ? String(value).toLowerCase().includes(term)
      : false
  })
}

export function ModalSelect<T>({
  open,
  onOpenChange,
  title,
  description,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  getId,
  columns,
  searchPlaceholder,
  filterFn,
  onSelect,
  emptyMessage = 'Sin resultados.',
  selectLabel = 'Seleccionar',
  footer,
}: ModalSelectProps<T>) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const matcher = filterFn ?? ((item: T, term: string) => defaultFilterFn(item, columns, term))
    return data.filter((item) => matcher(item, search))
  }, [data, search, filterFn, columns])

  const handleSelect = (item: T) => {
    onSelect(item)
    onOpenChange(false)
  }

  const { highlightedIndex, setHighlightedIndex, onKeyDown } = useModalSelectKeyboard(
    filtered.length,
    (index) => {
      const item = filtered[index]
      if (item) handleSelect(item)
    }
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setSearch('')
      }}
    >
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl">
        <ModalSelectHeader
          title={title}
          description={description}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={searchPlaceholder}
          onSearchKeyDown={onKeyDown}
        />

        <div onKeyDown={onKeyDown} tabIndex={-1} className="min-h-0 flex-1">
          <ModalSelectBody
            items={filtered}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={onRetry}
            getId={getId}
            columns={columns}
            emptyMessage={emptyMessage}
            selectLabel={selectLabel}
            highlightedIndex={highlightedIndex}
            onHighlight={setHighlightedIndex}
            onSelect={handleSelect}
          />
        </div>

        <ModalSelectFooter>{footer}</ModalSelectFooter>
      </DialogContent>
    </Dialog>
  )
}
