// src/features/sales/ui/pos/shortcuts-hint.tsx

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">{children}</kbd>
)

/** Recordatorio discreto de los atajos de teclado de la pantalla. */
export function ShortcutsHint({ showProforma }: { showProforma: boolean }) {
  return (
    <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span>
        <Key>F2</Key> producto
      </span>
      <span>
        <Key>F3</Key> cliente
      </span>
      {showProforma && (
        <span>
          <Key>F4</Key> proforma
        </span>
      )}
      <span>
        <Key>Supr</Key> quitar línea
      </span>
      <span>
        <Key>Ctrl</Key>+<Key>Enter</Key> emitir
      </span>
    </p>
  )
}
