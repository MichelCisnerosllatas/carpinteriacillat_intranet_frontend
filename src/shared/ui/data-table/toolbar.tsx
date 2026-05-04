'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type FilterConfig = {
  columnId: string
  title: string
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
}

type Props<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: FilterConfig[]
}

export function DataTableToolbar<TData>({ table, searchPlaceholder = 'Filter...', searchKey, filters = [] }: Props<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={table.getState().globalFilter ?? ''}
            onChange={e => table.setGlobalFilter(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        <div className="flex gap-x-2">
          {filters.map(f => {
            const col = table.getColumn(f.columnId)
            if (!col) return null
            return <DataTableFacetedFilter key={f.columnId} column={col} title={f.title} options={f.options} />
          })}
        </div>
        {isFiltered && (
          <Button variant="ghost" onClick={() => { table.resetColumnFilters(); table.setGlobalFilter('') }} className="h-8 px-2 lg:px-3">
            Reset <Cross2Icon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
