import { Shimmer } from './shimmer'

export function ContactOptionSkeleton() {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-xl border bg-background/20 p-4">
      <Shimmer className="size-11 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-4 w-44 max-w-full" />
        <Shimmer className="h-3 w-56 max-w-[85%]" />
      </div>

      <Shimmer className="h-4 w-4 shrink-0 rounded-full" />
    </div>
  );
}
