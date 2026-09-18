import { cn } from "@/shared/lib/utils";
import { LoaderCircle } from "lucide-react";

interface CircleProgressIndicatorPageProps {
  message?: string;
  showMessage?: boolean;
  className?: string;
}

export function CircleProgressIndicatorPage({
  message = "Cargando...",
  showMessage = false,
  className,
}: CircleProgressIndicatorPageProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full min-h-0 flex-1",
        "flex-col items-center justify-center",
        "overflow-hidden",
        className
      )}
    >
      <LoaderCircle
        className="
          mb-3
          size-[clamp(2rem,5vw,4rem)]
          shrink-0
          animate-spin
          text-yellow-500
        "
      />

      {showMessage && (
        <p className="px-4 text-center text-sm text-muted-foreground sm:text-base">
          {message}
        </p>
      )}
    </div>
  );
}


// como usarlo
{/* <CircleProgressIndicatorPage
  message="Cargando proformas..."
  className="min-h-[calc(100vh-120px)]"
/> */}