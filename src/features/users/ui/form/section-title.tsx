'use client'

// ── Small helper ─────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-primary" />
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  )
}
