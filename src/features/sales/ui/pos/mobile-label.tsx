'use client'

/** Etiqueta que solo se ve en modo tarjeta (en modo tabla la da la cabecera). */
export const MobileLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-muted-foreground text-[11px] @xl:hidden">{children}</span>
)
