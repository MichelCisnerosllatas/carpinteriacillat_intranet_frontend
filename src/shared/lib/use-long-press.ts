'use client'

import { useCallback, useRef } from 'react'

interface LongPressOptions {
  onLongPress: () => void
  onTap?:      () => void
  delay?:         number // ms para considerar "mantener presionado" — default 450
  moveTolerance?: number // px de movimiento antes de cancelar (evita disparar durante un scroll) — default 10
}

/**
 * Distingue "mantener presionado" (long-press) de un tap/click normal, en touch y mouse
 * por igual. Pensado para grids táctiles donde no existe :hover: mantener presionado
 * activa un modo (ej. selección), un tap normal dispara `onTap`.
 *
 * Si el puntero se mueve más de `moveTolerance` px antes de que venza `delay` (el usuario
 * está haciendo scroll, no presionando), se cancela todo — no dispara ni long-press ni tap.
 */
export function useLongPress({ onLongPress, onTap, delay = 450, moveTolerance = 10 }: LongPressOptions) {
  const timer     = useRef<number | null>(null)
  const startPos  = useRef<{ x: number; y: number } | null>(null)
  const firedLong = useRef(false)

  const clearTimer = useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = null
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    firedLong.current = false
    startPos.current  = { x: e.clientX, y: e.clientY }
    clearTimer()
    timer.current = window.setTimeout(() => {
      firedLong.current = true
      onLongPress()
    }, delay)
  }, [clearTimer, delay, onLongPress])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!startPos.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (Math.hypot(dx, dy) > moveTolerance) clearTimer()
  }, [clearTimer, moveTolerance])

  // El click llega después del pointerup — si el long-press ya actuó, se ignora
  // para no también abrir el lightbox / navegar al soltar el dedo.
  const onClick = useCallback((e: React.MouseEvent) => {
    if (firedLong.current) {
      e.preventDefault()
      e.stopPropagation()
      firedLong.current = false
      return
    }
    onTap?.()
  }, [onTap])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp:     clearTimer,
    onPointerLeave:  clearTimer,
    onPointerCancel: clearTimer,
    onContextMenu:   (e: React.MouseEvent) => e.preventDefault(), // evita el menú contextual nativo del navegador en el long-press táctil
    onClick,
  }
}
