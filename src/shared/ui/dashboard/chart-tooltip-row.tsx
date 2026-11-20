'use client'

import type { ReactNode } from 'react'

type TooltipItem = {
  color?: string
  payload?: { fill?: string }
}

// Crea el `formatter` de <ChartTooltipContent>: pinta una fila "■ Serie ...... S/ 1,200.00".
// Se usa en todos los gráficos para que el tooltip muestre los valores ya formateados
// (moneda, %, cantidad) en lugar del número crudo.
// `format` recibe también la clave de la serie, por si un gráfico mezcla unidades (soles y cantidad).
export function tooltipFormatter(
  format: (value: number, key: string) => string,
  labels: Record<string, ReactNode> = {}
) {
  return function TooltipRow(value: unknown, name: unknown, item: TooltipItem): ReactNode {
    const key = String(name ?? '')
    const color = item?.color ?? item?.payload?.fill
    return (
      <div className='flex w-full min-w-[9rem] items-center gap-2'>
        <span className='h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--row-color)' style={{ ['--row-color' as string]: color }} />
        <span className='text-muted-foreground'>{labels[key] ?? key}</span>
        <span className='text-foreground ml-auto font-mono font-medium tabular-nums'>{format(Number(value), key)}</span>
      </div>
    )
  }
}
