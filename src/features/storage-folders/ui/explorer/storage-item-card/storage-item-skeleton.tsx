'use client'

// ── Skeleton ─────────────────────────────────────────────────────────────────

export function StorageItemSkeleton() {
  return (
    <div className="rounded-2xl border bg-card animate-pulse">
      <div className="h-28 rounded-t-2xl bg-muted/70" />
      <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
        <div className="h-3 bg-muted rounded-full w-3/4" />
        <div className="h-2 bg-muted rounded-full w-1/2" />
      </div>
    </div>
  )
}
