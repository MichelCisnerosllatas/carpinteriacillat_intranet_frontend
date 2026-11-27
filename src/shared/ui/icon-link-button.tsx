'use client'

import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type IconLinkButtonProps = {
  /** Ruta a la que navega (ej. "/reports?tab=ventas"). */
  href: string
  /** Texto del tooltip y del `aria-label` (el botón no tiene texto visible). */
  label: string
  /** El ícono (ej. <ArrowUpRight />). */
  icon: ReactNode
  variant?: ComponentProps<typeof Button>['variant']
  size?: ComponentProps<typeof Button>['size']
  className?: string
  tooltipSide?: ComponentProps<typeof TooltipContent>['side']
}

/**
 * Igual que <IconButton /> pero NAVEGA (es un <a> real): así funciona el clic con la rueda,
 * "abrir en otra pestaña" y el lector de pantalla lo anuncia como enlace.
 *
 * Uso:
 *   <IconLinkButton href='/sales/15' label='Ver venta' icon={<Eye />} />
 */
export function IconLinkButton({
  href,
  label,
  icon,
  variant = 'ghost',
  size = 'icon',
  className,
  tooltipSide,
}: IconLinkButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant={variant} size={size} className={className}>
          <Link href={href} aria-label={label}>
            {icon}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}
