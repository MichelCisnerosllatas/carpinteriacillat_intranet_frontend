
type ShimmerProps = {
  className?: string
}

export function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-md bg-muted/60
        after:absolute after:inset-0
        after:-translate-x-full
        after:animate-[shimmer_1.7s_ease-in-out_infinite]
        after:bg-gradient-to-r
        after:from-transparent
        after:via-foreground/10
        after:to-transparent
        ${className}
      `}
    />
  )
}
