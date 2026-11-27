import { Shimmer } from './shimmer'

export function SkeletonHeader({ width = "w-32" }: { width?: string }) {
  return (
    <div className="flex min-h-[78px] items-center gap-2 border-b px-6">
      <Shimmer className={`h-5 ${width}`} />
      <Shimmer className="size-4 rounded-full" />
    </div>
  );
}
