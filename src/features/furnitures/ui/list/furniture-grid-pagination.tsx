'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'

interface FurnitureGridPaginationProps {
  meta: MetaPaginationType
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function FurnitureGridPagination({ meta, onPageChange, onPageSizeChange }: FurnitureGridPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total ?? 0} registros
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(meta.per_page)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 12, 24, 48].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} / pág.</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={meta.current_page <= 1}
                onClick={() => onPageChange(meta.current_page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Página anterior</TooltipContent>
          </Tooltip>
          <span className="min-w-[60px] text-center text-sm">
            {meta.current_page} / {meta.last_page}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPageChange(meta.current_page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Página siguiente</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
