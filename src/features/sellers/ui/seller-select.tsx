'use client'

import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { useSellerSelectStore } from '../stores/useSellerSelectStore'

// Valor interno del <Select> para "Todos" (Radix no admite value vacío).
const ALL_VALUE = 'all'

interface SellerSelectProps {
  /** Id del vendedor elegido. null = "Todos" (si showAll) o nada elegido. */
  value: number | null
  onValueChange: (value: number | null) => void
  /** Agrega la opción "Todos" (para filtros). Elegirla devuelve null. */
  showAll?: boolean
  /** Texto de la opción "Todos". */
  allLabel?: string
  placeholder?: string
  disabled?: boolean
  /** Clases del trigger (ancho/alto). Por defecto ocupa todo el ancho. */
  className?: string
}

/**
 * Selector de vendedor reutilizable: filtros del listado de ventas/proformas, el POS, las metas
 * por vendedor y el dashboard. Los datos vienen de GET /sellers, que exige `sales.view_all`:
 * quien lo use debe mostrarlo solo con ese permiso (useCan / <Can>).
 */
export function SellerSelect({
  value,
  onValueChange,
  showAll = false,
  allLabel = 'Todos los vendedores',
  placeholder = 'Elegir vendedor...',
  disabled,
  className,
}: SellerSelectProps) {
  const { options, isLoading, isError, load, setForceReload } = useSellerSelectStore()

  useEffect(() => {
    void load()
  }, [])

  const selectValue = value != null ? String(value) : showAll ? ALL_VALUE : ''

  return (
    <Select
      value={selectValue}
      disabled={disabled || isLoading}
      onValueChange={(v) => onValueChange(v === ALL_VALUE ? null : Number(v))}
      onOpenChange={(open) => {
        // Si la carga falló, al abrir de nuevo se reintenta.
        if (open && isError) {
          setForceReload(true)
          void load()
        }
      }}
    >
      <SelectTrigger className={cn('w-full', className)} aria-label="Vendedor">
        <SelectValue placeholder={isLoading ? 'Cargando...' : isError ? 'Error al cargar' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>}
        {options.map((s) => (
          <SelectItem key={s.id} value={String(s.id)}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
