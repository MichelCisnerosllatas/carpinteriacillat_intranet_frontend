'use client'

/** Etiqueta chica sobre cada campo en la vista de tarjetas (mobile) — la tabla usa los headers de
 * columna para esto, pero una tarjeta apilada necesita el rótulo pegado a cada campo. */
export function CardFieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-xs font-medium">{children}</span>
}
