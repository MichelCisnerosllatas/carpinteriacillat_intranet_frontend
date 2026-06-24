import { LoaderCircle } from 'lucide-react'

export default function UserDevicesLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoaderCircle className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
