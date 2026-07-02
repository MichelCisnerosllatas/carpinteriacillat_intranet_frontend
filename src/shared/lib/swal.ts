/**
 * SweetAlert2 helper — shared/lib/swal.ts
 *
 * CLIENT-ONLY. No importar en Server Components ni en stores.
 * Agregar 'use client' en cualquier componente que use estas funciones.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FUNCIONES DE CONFIRMACIÓN
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ① swalConfirm — pregunta pura, retorna true/false
 *   Úsala cuando TÚ corres la acción después (p.ej. formularios antes de enviar).
 *   Módulos: navigation-form, typecolor-form, typedoc-form, typesection-form,
 *            typewood-form, section-form, sectionimage-form, category-form,
 *            role-form, user-form, furniture-form.
 *
 *   const ok = await swalConfirm({
 *     title: '¿Guardar cambios?',
 *     text: 'Nombre del item',           // opcional
 *     icon: 'question',                  // opcional — default: 'question' / 'warning' si danger
 *     confirmText: 'Sí, guardar',        // opcional — default: 'Confirmar'
 *     cancelText: 'Cancelar',            // opcional — default: 'Cancelar'
 *     danger: false,                     // opcional — botón rojo + ícono warning
 *   })
 *   if (!ok) return
 *   await submitForm()
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ② swalConfirmAction — confirm + loader + control explícito del modal
 *   El botón muestra un spinner mientras action() corre.
 *   El modal NO se cierra solo — el módulo llama close() o showError().
 *   Módulos: *-row-actions (handleToggleState), user-devices-row-actions (handleRevoke),
 *            user-devices-accordion-table (handleRevokeAll), furnitures-table.
 *
 *   await swalConfirmAction({
 *     title: '¿Activar este rol?',
 *     text: 'Administrador',             // opcional
 *     icon: 'question',                  // opcional
 *     confirmText: 'Sí, activar',        // opcional
 *     cancelText: 'Cancelar',            // opcional
 *     danger: false,                     // opcional
 *
 *     // Opcional: cambia title/text del modal al iniciar (estado de carga)
 *     loading: { title: 'Activando...', text: 'Por favor espera.' },
 *
 *     // action recibe helpers para controlar el modal:
 *     //   close()           → cierra el modal (éxito)
 *     //   showError(msg)    → muestra error rojo en el modal, lo deja abierto
 *     //   update({...})     → cambia title/text/icon en cualquier momento
 *     action: async ({ close, showError, update }) => {
 *       const ok = await toggleState(id, 1)
 *       if (ok) {
 *         toastSuccess('Rol activado')
 *         close()                        // ← cierra el modal
 *       } else {
 *         update({ title: 'Error', icon: 'error' })
 *         showError('No se pudo activar.')  // ← modal queda abierto con el error
 *       }
 *     },
 *   })
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ③ swalDeleteConfirm — atajo danger para eliminar
 *   Sin action → pregunta pura (retorna boolean).
 *   Con action → usa swalConfirmAction internamente (loader automático).
 *   Módulos: *-row-actions (handleDelete), *-table (handleBulkDelete).
 *
 *   // Modo simple (retorna boolean — tú manejas la acción):
 *   const ok = await swalDeleteConfirm()
 *   const ok = await swalDeleteConfirm('¿Eliminar este rol?', 'No se puede deshacer.')
 *
 *   // Modo con acción + loader (action recibe los mismos helpers que swalConfirmAction):
 *   await swalDeleteConfirm(
 *     '¿Eliminar este rol?',
 *     'No se puede deshacer.',
 *     async ({ close, showError }) => {
 *       const ok = await deleteItem(id)
 *       if (ok) { toastSuccess('Rol eliminado'); close() }
 *       else showError('No se pudo eliminar el registro.')
 *     },
 *     { title: 'Eliminando...' }  // loading opcional
 *   )
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ALERTAS SIMPLES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   await swalSuccess('Guardado', 'El registro fue creado.')
 *   await swalError('Error', 'No se pudo conectar.')
 *   await swalWarning('Atención', 'Estás a punto de borrar 50 registros.')
 *   await swalInfo('Info', 'El proceso puede tardar unos segundos.')
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INPUT DE TEXTO
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   const { value } = await swalInput({ title: 'Nuevo nombre', inputPlaceholder: 'Escribe...' })
 *   if (value) rename(value)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONTROL DEL CIERRE — close() y showError()
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   close()
 *     → Cierra el modal. Llámalo cuando la acción fue exitosa.
 *       El modal NO se cierra solo — si no llamas close(), queda abierto.
 *
 *   showError(message)
 *     → Muestra un mensaje rojo dentro del modal y lo deja abierto.
 *       El usuario puede presionar "Cancelar" para cerrarlo.
 *       Úsalo cuando el error es importante y quieres que el usuario lo vea.
 *
 *   update({ title?, text?, icon? })
 *     → Cambia el contenido del modal en cualquier momento.
 *       Útil para mostrar un estado intermedio o de error personalizado.
 */

import Swal, { type SweetAlertIcon, type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2'

// ─── Tipos internos ───────────────────────────────────────────────────────────
type SwalState = {
  title?: string
  text?: string
  icon?: SweetAlertIcon
}

/**
 * Helpers que recibe el callback `action` dentro de swalConfirmAction.
 * El modal NO se cierra solo — el módulo debe llamar close() o showError().
 */
export type ActionHelpers = {
  /** Cambia title / text / icon del modal en tiempo real (p.ej. estado de carga o éxito). */
  update: (state: Partial<SwalState>) => void
  /** Cierra el modal. Llámalo cuando la acción fue exitosa. */
  close: () => void
  /** Muestra un mensaje de error rojo dentro del modal y lo deja abierto. El usuario puede cancelar. */
  showError: (message: string) => void
}

// ─── Theme-aware base ─────────────────────────────────────────────────────────
function getThemeOptions(): Partial<SweetAlertOptions> {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return isDark
    ? {
        background: '#1e2535',
        color: '#e2e8f0',
        confirmButtonColor: '#3b5bdb',
        cancelButtonColor: '#374151',
      }
    : {
        background: 'oklch(1 0 0)',
        color: 'oklch(0.129 0.042 264.695)',
        confirmButtonColor: 'oklch(0.208 0.042 265.755)',
        cancelButtonColor: 'oklch(0.554 0.046 257.417)',
      }
}

// ─── Scroll lock helpers ──────────────────────────────────────────────────────
function lockScroll() {
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  document.body.style.overflow = ''
}

// ─── Base instance ────────────────────────────────────────────────────────────
export function baseSwal<T = any>(
  options: SweetAlertOptions
): Promise<SweetAlertResult<T>> {
  const { willOpen, didClose, customClass, ...rest } = options

  const finalOptions = {
    ...getThemeOptions(),
    customClass: {
      popup: 'rounded-xl shadow-xl border border-border text-sm',
      title: 'text-base font-semibold',
      htmlContainer: 'text-muted-foreground text-sm',
      confirmButton: 'rounded-md px-4 py-2 text-sm font-medium',
      cancelButton: 'rounded-md px-4 py-2 text-sm font-medium',
      ...(customClass ?? {}),
    },
    willOpen: (popup: HTMLElement) => {
      lockScroll()
      willOpen?.(popup)
    },
    didClose: () => {
      unlockScroll()
      didClose?.()
    },
    ...rest,
  } as SweetAlertOptions

  return Swal.fire(finalOptions) as Promise<SweetAlertResult<T>>
}

// ─── Confirm puro ─────────────────────────────────────────────────────────────
// Solo pregunta. Retorna true si el usuario confirma.
// Úsalo cuando tú controlas la acción (p.ej. en formularios antes de enviar).
export async function swalConfirm(options: {
  title: string
  text?: string
  icon?: SweetAlertIcon
  confirmText?: string
  cancelText?: string
  danger?: boolean
}): Promise<boolean> {
  const result = await baseSwal({
    title: options.title,
    text: options.text,
    icon: options.icon ?? (options.danger ? 'warning' : 'question'),
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Confirmar',
    cancelButtonText: options.cancelText ?? 'Cancelar',
    reverseButtons: true,
    ...(options.danger
      ? {
          confirmButtonColor: 'oklch(0.577 0.245 27.325)',
          iconColor: 'oklch(0.577 0.245 27.325)',
        }
      : {}),
  })
  return result.isConfirmed
}

// ─── Confirm con acción + loader ──────────────────────────────────────────────
// Pregunta → usuario confirma → botón muestra loader → action(helpers) corre.
// El modal NO se cierra solo. El módulo decide cuándo cerrarlo:
//   helpers.close()          → cierra el modal (éxito)
//   helpers.showError(msg)   → muestra error en el modal y lo deja abierto
//   helpers.update({...})    → cambia title/text/icon en cualquier momento
//
// Si action() lanza una excepción no capturada, el modal queda abierto
// mostrando el mensaje del error como validationMessage.
export async function swalConfirmAction(options: {
  title: string
  text?: string
  icon?: SweetAlertIcon
  confirmText?: string
  cancelText?: string
  danger?: boolean
  /** Recibe helpers para controlar el modal. Debe llamar close() o showError() al terminar. */
  action: (helpers: ActionHelpers) => Promise<void>
  /** Si se provee, actualiza title/text del modal al iniciar la acción (estado de carga). */
  loading?: Pick<SwalState, 'title' | 'text'>
}): Promise<boolean> {
  const result = await baseSwal({
    title: options.title,
    text: options.text,
    icon: options.icon ?? (options.danger ? 'warning' : 'question'),
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Confirmar',
    cancelButtonText: options.cancelText ?? 'Cancelar',
    reverseButtons: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
    allowEnterKey: () => !Swal.isLoading(),
    ...(options.danger
      ? {
          confirmButtonColor: 'oklch(0.577 0.245 27.325)',
          iconColor: 'oklch(0.577 0.245 27.325)',
        }
      : {}),
    preConfirm: () =>
      new Promise<boolean>((resolve) => {
        let settled = false
        const settle = (value: boolean) => {
          if (!settled) { settled = true; resolve(value) }
        }

        const helpers: ActionHelpers = {
          update: (state) => Swal.update(state),
          close:  () => settle(true),
          showError: (message) => {
            Swal.showValidationMessage(message)
            settle(false)
          },
        }

        // Actualiza a estado de carga si se configuró
        if (options.loading) {
          Swal.update({ title: options.loading.title, text: options.loading.text })
        }

        options.action(helpers).catch((err) => {
          Swal.showValidationMessage(
            err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
          )
          settle(false)
        })
      }),
  })

  return result.isConfirmed
}

// ─── Delete shortcut ──────────────────────────────────────────────────────────
// Atajo de swalConfirmAction con estilo danger.
// Si no se pasa action, actúa como swalConfirm puro (retorna boolean).
// Si se pasa action, recibe ActionHelpers igual que swalConfirmAction.
export async function swalDeleteConfirm(
  title = '¿Eliminar registro?',
  text = 'Esta acción no se puede deshacer.',
  action?: (helpers: ActionHelpers) => Promise<void>,
  loading?: Pick<SwalState, 'title' | 'text'>
): Promise<boolean> {
  if (!action) {
    return swalConfirm({ title, text, confirmText: 'Sí, eliminar', cancelText: 'Cancelar', danger: true })
  }
  return swalConfirmAction({
    title,
    text,
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    danger: true,
    action,
    loading,
  })
}

// ─── Alert helpers ────────────────────────────────────────────────────────────
export function swalSuccess(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'success' })
}

export function swalError(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'error' })
}

export function swalWarning(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'warning' })
}

export function swalInfo(title: string, text?: string) {
  return baseSwal({ title, text, icon: 'info' })
}

// ─── Input dialog ─────────────────────────────────────────────────────────────
export async function swalInput(options: {
  title: string
  text?: string
  inputPlaceholder?: string
  inputLabel?: string
  confirmText?: string
}): Promise<SweetAlertResult<string>> {
  return baseSwal<string>({
    title: options.title,
    text: options.text,
    input: 'text',
    inputPlaceholder: options.inputPlaceholder,
    inputLabel: options.inputLabel,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'OK',
    inputValidator: (value: string) => {
      if (!value) return 'Por favor ingresa un valor.'
      return undefined
    },
  })
}

// Re-export raw Swal para casos especiales
export { Swal }
