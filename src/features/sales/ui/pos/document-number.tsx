// src/features/sales/ui/pos/document-number.tsx

interface DocumentNumberProps {
  series: string | null
  number: string | null
}

/** "B001-00000124". Sin N° conocido muestra "N° al emitir"; sin serie, un guion. */
export function DocumentNumber({ series, number }: DocumentNumberProps) {
  if (!series) return <span className="text-muted-foreground">—</span>
  return (
    <span className="truncate font-mono tabular-nums">
      <span className="font-semibold">{series}</span>
      {number ? (
        <>-{number}</>
      ) : (
        <span className="text-muted-foreground font-sans text-xs"> · N° al emitir</span>
      )}
    </span>
  )
}
