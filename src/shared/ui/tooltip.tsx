'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/shared/lib/utils'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  )
}

// En touch no existe ":hover", así que Radix nunca abre el tooltip por sí solo (su máquina de
// estados interna ignora a propósito los eventos de puntero "touch"). Este contexto le da a
// TooltipTrigger acceso al estado de apertura del Root más cercano para poder abrirlo/cerrarlo
// con un tap — ver TooltipTrigger más abajo.
const TooltipOpenContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function Tooltip({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [openState, setOpenState] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : openState

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <TooltipProvider>
      <TooltipOpenContext.Provider value={{ open, setOpen }}>
        <TooltipPrimitive.Root data-slot='tooltip' open={open} onOpenChange={setOpen} {...props} />
      </TooltipOpenContext.Provider>
    </TooltipProvider>
  )
}

function TooltipTrigger({
  onClick,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const ctx = React.useContext(TooltipOpenContext)
  const nodeRef = React.useRef<React.ElementRef<typeof TooltipPrimitive.Trigger>>(null)

  // Con el tooltip abierto por un tap, un tap en cualquier otro lugar de la página lo cierra —
  // el equivalente táctil de "mover el puntero fuera". Sin esto se quedaría abierto para
  // siempre, porque en touch no hay pointerleave/blur que lo cierre solo.
  React.useEffect(() => {
    if (!ctx?.open) return
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (nodeRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-slot="tooltip-content"]')) return
      ctx.setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ctx, ctx?.open])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    // No preventDefault/stopPropagation: la acción propia del elemento (botón, enlace, trigger
    // de un menú, etc.) sigue funcionando con normalidad, esto solo se suma a lo que ya hace.
    if (ctx && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      ctx.setOpen(!ctx.open)
    }
  }

  return (
    <TooltipPrimitive.Trigger
      ref={nodeRef}
      data-slot='tooltip-trigger'
      onClick={handleClick}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-primary fill-primary' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
