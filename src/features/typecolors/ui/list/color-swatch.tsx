export function ColorSwatch({ hex }: { hex: string | null }) {
  if (!hex) {
    return (
      <div
        className="size-10 flex-shrink-0 rounded-lg border border-dashed bg-muted"
        title="Sin color definido"
      />
    )
  }
  return (
    <div
      className="size-10 flex-shrink-0 rounded-lg border shadow-sm"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  )
}
