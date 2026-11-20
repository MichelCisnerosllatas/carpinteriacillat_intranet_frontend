'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'children' | 'aria-label'> & {
  /** Texto del tooltip y del `aria-label`: como el botón no tiene texto visible, es la única
   * forma de que el usuario (y los lectores de pantalla) sepan qué hace. */
  label: string
  /** El ícono (ej. <Search />). */
  icon: ReactNode
  /** Lado donde aparece el tooltip. */
  tooltipSide?: ComponentProps<typeof TooltipContent>['side']
}

/**
 * Botón de solo ícono con tooltip y `aria-label`. Por defecto es `outline` y `size="icon"`,
 * pero acepta todas las props de <Button /> (variant, size, className, disabled, onClick...).
 *
 * Uso:
 *   <IconButton label="Buscar cliente" icon={<Search />} onClick={...} />
 */
export function IconButton({
  label,
  icon,
  tooltipSide,
  variant = 'outline',
  size = 'icon',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type={type} variant={variant} size={size} aria-label={label} {...props}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}
