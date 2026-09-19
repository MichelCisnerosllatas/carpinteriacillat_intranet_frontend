import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { getInitials } from '@/shared/lib/get-initials'
import type { GoogleAuthRejectionDataDTO } from '@/features/auth/model/logindto/login.dto'

interface GoogleAccessPendingAlertProps {
  data: GoogleAuthRejectionDataDTO
  message: string
}

/**
 * Login con Google rechazado (correo no registrado / cuenta inactiva) — sigue siendo un error
 * (`variant="destructive"`), pero muestra la foto/nombre/correo que Google SÍ devolvió, para que
 * quede claro que el proveedor respondió bien y el problema es solo de autorización en el
 * sistema, no un fallo del login en sí. Separado de `GoogleLoginButton` a propósito, para que se
 * pueda reusar donde haga falta mostrar el mismo rechazo.
 */
export function GoogleAccessPendingAlert({ data, message }: GoogleAccessPendingAlertProps) {
  const name = data.name?.trim() || data.email

  return (
    <Alert
  variant="destructive"
  className="block [&>svg]:hidden"
>
  <div className="flex w-full items-start gap-3">
    <Avatar
      className="
        size-10
        shrink-0
        border
        border-destructive/30
      "
    >
      <AvatarImage
        src={data.photo_url ?? undefined}
        alt={name}
      />

      <AvatarFallback className="text-xs font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1 space-y-1">
      <AlertTitle
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <ShieldAlert className="size-4 shrink-0" />

        Acceso pendiente de autorización
      </AlertTitle>

      <AlertDescription>
        <p
          className="
            break-words
            font-medium
            text-foreground/90
          "
        >
          {data.name || 'Sin nombre'} · {data.email}
        </p>

        <p className="mt-1">
          {message}
        </p>
      </AlertDescription>
    </div>
  </div>
</Alert>
    // <Alert variant="destructive" className="items-center gap-3 [&>svg]:hidden">
    //   <div className="flex w-full items-start gap-3">
    //     <Avatar className="size-10 shrink-0 border border-destructive/30">
    //       <AvatarImage src={data.photo_url ?? undefined} alt={name} />
    //       <AvatarFallback className="text-xs font-semibold">{getInitials(name)}</AvatarFallback>
    //     </Avatar>

    //     <div className="flex-1 space-y-1">
    //       <AlertTitle className="flex items-center gap-1.5">
    //         <ShieldAlert className="size-4 shrink-0" />
    //         Acceso pendiente de autorización
    //       </AlertTitle>
    //       <AlertDescription>
    //         <p className="font-medium text-foreground/90">{data.name || 'Sin nombre'} · {data.email}</p>
    //         <p className="mt-1">{message}</p>
    //       </AlertDescription>
    //     </div>
    //   </div>
    // </Alert>
  )
}
