'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { signInWithGoogle, signInWithGoogleAndGetIdToken } from '@/features/auth/services/google-auth.service'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { GoogleAccessPendingAlert } from './GoogleAccessPendingAlert'

interface GoogleLoginButtonProps {
  redirectTo?: string
}

/**
 * "Continuar con Google" — obtiene el ID token de Firebase (no de Google directo, ver
 * `google-auth.service.ts`) y lo manda a `POST /v1/intranet/auth/google`. El backend NO crea
 * usuarios nuevos por este medio: si el correo no está registrado (o la cuenta está inactiva),
 * el login falla y, en vez de un toast genérico, se muestra `GoogleAccessPendingAlert` con lo
 * que Google sí devolvió (foto/nombre/correo) — deja claro que el proveedor respondió bien y
 * que el problema es de autorización, no del login en sí.
 */
export function GoogleLoginButton({ redirectTo }: GoogleLoginButtonProps) {
  const { loginWithGoogle, googleRejection, error, clearGoogleRejection } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    clearGoogleRejection()
    setIsLoading(true)
    try {
      const userGoogle = await signInWithGoogle();
      const idTokenGoogle = await userGoogle.getIdToken();

      console.info("GOOGLE USER", userGoogle);
      console.info("GOOGLE IDTOKEN", idTokenGoogle);

      const ok = await loginWithGoogle(
        idTokenGoogle, 
        userGoogle.displayName ?? "", 
        userGoogle.email ?? "", 
        userGoogle.photoURL ?? ""
      )

      

      // const idToken = await signInWithGoogleAndGetIdToken()
      // const ok = await loginWithGoogle(idToken)

      if (!ok) {
        // Si Google devolvió datos (foto/nombre/correo), la alerta de abajo ya los muestra —
        // el toast acá sería redundante. Solo se usa el toast para errores sin esos datos
        // (ej. token inválido, sin conexión).
        if (!useAuthStore.getState().googleRejection) {
          toastError('No se pudo iniciar sesión', useAuthStore.getState().error || 'Intenta nuevamente')
        }
        return
      }

      const user = useAuthStore.getState().loginDataDTO
      toastSuccess('Bienvenido a la intranet', `Has iniciado sesión exitosamente ${user?.person?.person_name ?? ''}`)
      window.location.replace(redirectTo ?? '/dashboard')
    } catch (error: any) {
      // El usuario cerró el popup de Google, o Firebase no está configurado — no es un error de credenciales.
      if (error?.code !== 'auth/popup-closed-by-user') {
        toastError('No se pudo iniciar sesión con Google', error?.message ?? 'Intenta nuevamente')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full font-semibold"
        disabled={isLoading}
        onClick={handleLogin}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.87c2.27-2.09 3.57-5.17 3.57-8.82z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.95-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.96H1.24v3.11C3.22 21.3 7.28 24 12 24z" />
            <path fill="#FBBC05" d="M5.25 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.24C.45 8.24 0 10.06 0 12s.45 3.76 1.24 5.38l4.01-3.11z" />
            <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0 7.28 0 3.22 2.7 1.24 6.62l4.01 3.11c.95-2.84 3.61-4.96 6.75-4.96z" />
          </svg>
        )}
        {isLoading ? 'Ingresando...' : 'Continuar con Google'}
      </Button>

      {googleRejection && <GoogleAccessPendingAlert data={googleRejection} message={error ?? 'Tu cuenta está en proceso de validación.'} />}
    </div>
  )
}
