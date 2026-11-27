/**
 * navigation-history.ts
 *
 * Le permite a BackButton distinguir "hay una pantalla anterior dentro de esta pestaña"
 * de "esta es la primera carga" (enlace directo, pestaña nueva), para decidir si usar
 * router.back() o caer al listado del módulo (fallbackHref).
 *
 * Next.js App Router no expone un índice de historial utilizable: su window.history.state
 * solo trae banderas internas (__NA, __PRIVATE_NEXTJS_INTERNALS_TREE), sin profundidad.
 * Por eso guardamos nosotros mismos la longitud de window.history al cargar la primera
 * página de la pestaña. sessionStorage sobrevive recargas (F5) y se limpia al cerrar la
 * pestaña — exactamente el alcance que necesitamos.
 *
 * El registro se hace con un <script> inline en el <head> del layout raíz (ver
 * getHistoryBaselineScript), ANTES de que React hidrate. Si esperáramos a un useEffect
 * de un componente que sólo se monta bajo demanda (p. ej. BackButton, que sólo vive en
 * páginas de detalle/formulario), window.history.length ya podría reflejar la navegación
 * que queremos detectar, dando un falso negativo la primera vez que se usa.
 */

export const HISTORY_BASELINE_KEY = '__app_history_baseline'

export function getHistoryBaselineScript(): string {
  return `(function(){try{
    if(sessionStorage.getItem('${HISTORY_BASELINE_KEY}')===null){
      sessionStorage.setItem('${HISTORY_BASELINE_KEY}',String(window.history.length));
    }
  }catch(e){}})();`
}

/** true si, dentro de esta pestaña, se navegó al menos una vez desde la carga inicial. */
export function hasInAppHistory(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const baseline = window.sessionStorage.getItem(HISTORY_BASELINE_KEY)
    if (baseline === null) return false
    return window.history.length > Number(baseline)
  } catch {
    return false
  }
}

/**
 * Mismo criterio que `BackButton`, pero para redirecciones programáticas (ej. al terminar de
 * crear/editar/cancelar un formulario) en vez de un `<Link>` que el usuario clickea.
 *
 * Si se llegó navegando dentro de la app (venía de un tab del detalle de un padre, de una lista
 * filtrada, etc.), `router.back()` regresa de verdad a esa pantalla tal como estaba. Si no hay
 * historial dentro de la app (enlace directo, pestaña nueva), cae a `fallbackHref` — normalmente
 * el listado del módulo.
 */
export function goBackOrFallback(
  router: { back: () => void; push: (href: string) => void },
  fallbackHref: string
): void {
  if (hasInAppHistory()) {
    router.back()
  } else {
    router.push(fallbackHref)
  }
}
