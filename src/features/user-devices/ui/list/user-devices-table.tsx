'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import {
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTablePagination } from '@/shared/ui/data-table/pagination'
import { DataTableViewOptions } from '@/shared/ui/data-table/view-options'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useUserDeviceListStore } from '../../stores/useUserDeviceListStore'
import { userDevicesColumns } from './user-devices-columns'
import { UserDevicesError } from '../user-devices-error'

const PLATFORM_OPTIONS = [
  { value: 'all',     label: 'Todas las plataformas' },
  { value: 'ios',     label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web',     label: 'Web' },
  { value: 'desktop', label: 'Desktop' },
]

const DEVICE_TYPE_OPTIONS = [
  { value: 'all',     label: 'Todos los tipos' },
  { value: 'mobile',  label: 'Móvil' },
  { value: 'tablet',  label: 'Tablet' },
  { value: 'desktop', label: 'Escritorio' },
  { value: 'api',     label: 'API / Herramienta' },
  { value: 'unknown', label: 'Desconocido' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: '1',   label: 'Activa' },
  { value: '0',   label: 'Cerrada' },
]

export function UserDevicesTable() {
  const {
    devices, meta, filters, hasLoaded, isInitialLoading,
    isFetching, isError, message, load, reset,
  } = useUserDeviceListStore()

  const [rowSelection, setRowSelection]         = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [search, setSearch]                     = useState(filters.search ?? '')
  const [status, setStatus]                     = useState<string>('all')
  const [platform, setPlatform]                 = useState<string>('all')
  const [deviceType, setDeviceType]             = useState<string>('all')
  const [dateFrom, setDateFrom]                 = useState(filters.date_from ?? '')
  const [dateTo, setDateTo]                     = useState(filters.date_to ?? '')

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max((filters.page ?? 1) - 1, 0),
    pageSize: filters.per_page ?? 15,
  }), [filters.page, filters.per_page])

  const appliedFilters = useRef({ search, status, platform, deviceType, dateFrom, dateTo })

  useEffect(() => { void load() }, [])

  useEffect(() => {
    const prev = appliedFilters.current
    const changed =
      prev.search !== search ||
      prev.status !== status ||
      prev.platform !== platform ||
      prev.deviceType !== deviceType ||
      prev.dateFrom !== dateFrom ||
      prev.dateTo !== dateTo
    appliedFilters.current = { search, status, platform, deviceType, dateFrom, dateTo }
    if (!changed) return

    const timeout = window.setTimeout(() => {
      void load({
        search,
        is_active: status === 'all' ? undefined : (Number(status) as 0 | 1),
        platform: platform === 'all' ? undefined : platform,
        device_type: deviceType === 'all' ? undefined : deviceType,
        date_from: dateFrom,
        date_to: dateTo,
        page: 1,
      })
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [search, status, platform, deviceType, dateFrom, dateTo])

  const table = useReactTable({
    data: devices,
    columns: userDevicesColumns,
    pageCount: meta?.last_page ?? 1,
    manualPagination: true,
    state: { sorting, pagination, rowSelection, columnVisibility },
    enableRowSelection: false,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      void load({ page: next.pageIndex + 1, per_page: next.pageSize })
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const resetFilters = () => {
    setSearch(''); setStatus('all'); setPlatform('all')
    setDeviceType('all'); setDateFrom(''); setDateTo('')
    void load({
      search: '', is_active: undefined, platform: undefined,
      device_type: undefined, date_from: '', date_to: '', page: 1,
    })
  }

  if (!hasLoaded && !isInitialLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center bg-background">
        <LoaderCircle className="mb-3 size-9 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando dispositivos...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <UserDevicesError
        title="Error al cargar dispositivos"
        message={message ?? 'No se pudieron cargar los dispositivos.'}
        isLoading={isFetching}
        showRetryButton
        onRetry={async () => { reset(); await load() }}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      {isFetching && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
          <div className="mt-2 flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <LoaderCircle className="size-3.5 animate-spin" />
            Actualizando...
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-end gap-2">

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Buscar</span>
            <Input
              placeholder="Usuario, IP, browser..."
              value={search}
              disabled={isFetching}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full sm:w-[220px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Estado</span>
            <Select value={status} disabled={isFetching} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Plataforma</span>
            <Select value={platform} disabled={isFetching} onValueChange={setPlatform}>
              <SelectTrigger className="h-8 w-full sm:w-[175px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Tipo</span>
            <Select value={deviceType} disabled={isFetching} onValueChange={setDeviceType}>
              <SelectTrigger className="h-8 w-full sm:w-[175px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEVICE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Fecha desde</span>
            <Input
              type="date"
              value={dateFrom}
              disabled={isFetching}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-full sm:w-[145px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Fecha hasta</span>
            <Input
              type="date"
              value={dateTo}
              disabled={isFetching}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-full sm:w-[145px]"
            />
          </div>

          <div className="flex flex-col justify-end">
            <Button variant="ghost" size="sm" disabled={isFetching} onClick={resetFilters}>
              Limpiar
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="size-8"
                disabled={isFetching}
                onClick={() => void load({ page: 1 })}
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar lista</TooltipContent>
          </Tooltip>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="group/row">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    colSpan={h.colSpan}
                    className={cn(
                      'whitespace-nowrap bg-background group-hover/row:bg-muted',
                      (h.column.columnDef.meta as { className?: string })?.className
                    )}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group/row">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background align-middle group-hover/row:bg-muted',
                        (cell.column.columnDef.meta as { className?: string })?.className
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={userDevicesColumns.length} className="h-24 text-center text-muted-foreground">
                  No hay dispositivos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        className="mt-auto"
        summary={
          meta
            ? `Mostrando ${meta.from ?? 0} - ${meta.to ?? 0} de ${meta.total ?? 0} registros`
            : 'Sin registros'
        }
      />
    </div>
  )
}
