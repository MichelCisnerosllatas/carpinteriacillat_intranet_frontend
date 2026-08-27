import {
  Building2,
  FileSignature,
  FileText,
  PanelBottom,
  PanelTop,
  Truck,
  User,
} from 'lucide-react'
import type { ProformaTemplateStatus, ProformaTemplateSections } from './schema'

// module fijo de PdfTemplate para esta feature: las plantillas de proforma son un caso particular
// del módulo genérico pdf_templates (ver pdf-templates.md).
export const PDF_TEMPLATE_MODULE = 'proforma'

export const proformaTemplateStatusBadge = new Map<ProformaTemplateStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const HEADER_LAYOUT_OPTIONS: { value: 'logo_izquierda' | 'logo_derecha'; label: string }[] =
  [
    { value: 'logo_derecha', label: 'Logo a la derecha' },
    { value: 'logo_izquierda', label: 'Logo a la izquierda' },
  ]

export type SectionField = { name: keyof ProformaTemplateSections; label: string; tip: string }

// Las 24 keys fijas de pdf_templates.sections y su agrupación visual espejan exactamente
// App\Enums\PdfTemplateSectionKey (backend) — misma fuente de verdad que usan las validaciones
// del servidor, para no inventar nombres de grupo por cuenta propia. No hay control por-cuenta/
// por-sucursal: show_bank_accounts y show_branches son un único interruptor que muestra u oculta
// TODA la lista (el backend aún no soporta seleccionar cuentas/sucursales individuales).
// Se comparte entre sections-tab.tsx (editable) y proforma-template-detail.tsx (solo lectura)
// para no mantener las 24 keys/labels duplicadas en dos archivos.
export const SECTION_GROUPS: {
  key: string
  label: string
  hint: string
  icon: typeof PanelTop
  fields: SectionField[]
}[] = [
  {
    key: 'header',
    label: 'Encabezado',
    hint: 'Qué se muestra en la parte superior del documento',
    icon: PanelTop,
    fields: [
      {
        name: 'showLogo',
        label: 'Mostrar logo',
        tip: 'Muestra el logo de la empresa en el encabezado.',
      },
      {
        name: 'showDate',
        label: 'Mostrar fecha',
        tip: 'Muestra la fecha de emisión en el encabezado.',
      },
      {
        name: 'showCompanyName',
        label: 'Mostrar nombre de la empresa (encabezado)',
        tip: 'Muestra el nombre comercial de la empresa junto al logo, en el encabezado.',
      },
    ],
  },
  {
    key: 'client',
    label: 'Cliente',
    hint: 'Datos del cliente al que va dirigida la proforma',
    icon: User,
    fields: [
      {
        name: 'showClientName',
        label: 'Mostrar nombre del cliente',
        tip: 'Muestra el nombre o razón social del cliente al que se dirige la proforma.',
      },
      {
        name: 'showClientDocument',
        label: 'Mostrar RUC/DNI del cliente',
        tip: 'Muestra el número de documento (RUC o DNI) del cliente.',
      },
      {
        name: 'showClientAddress',
        label: 'Mostrar dirección del cliente',
        tip: 'Muestra la dirección registrada del cliente.',
      },
      {
        name: 'showClientAttention',
        label: 'Mostrar atención (contacto del cliente)',
        tip: 'Muestra a qué persona de contacto va dirigida la proforma.',
      },
    ],
  },
  {
    key: 'intro',
    label: 'Introducción y resumen',
    hint: 'Texto de apertura, tabla de ítems y total del servicio',
    icon: FileText,
    fields: [
      {
        name: 'showIntroText',
        label: 'Mostrar texto introductorio',
        tip: 'Muestra el párrafo de apertura configurado en la pestaña "Textos extra", antes de la tabla de ítems.',
      },
      {
        name: 'showItemsTable',
        label: 'Mostrar tabla de ítems',
        tip: 'Muestra la tabla con los productos o servicios cotizados.',
      },
      {
        name: 'showSummaryTotal',
        label: 'Mostrar total del servicio',
        tip: 'Muestra el resumen con el subtotal, impuestos y total.',
      },
      {
        name: 'showDeliveryTime',
        label: 'Mostrar tiempo de entrega',
        tip: 'Muestra el plazo de entrega indicado en la proforma.',
      },
      {
        name: 'showAdditionalNotes',
        label: 'Mostrar notas adicionales',
        tip: 'Muestra, debajo del tiempo de entrega, la lista de notas adicionales agregadas en la proforma (ej: garantía, validez de la oferta).',
      },
    ],
  },
  {
    key: 'company',
    label: 'Datos de la empresa',
    hint: 'Información de la empresa emisora, línea por línea',
    icon: Building2,
    fields: [
      {
        name: 'showCompanyData',
        label: 'Mostrar datos de la empresa',
        tip: 'Muestra el bloque general de datos de la empresa.',
      },
      {
        name: 'showCompanyTaxId',
        label: 'Mostrar RUC de la empresa',
        tip: 'Muestra el RUC de la empresa emisora.',
      },
      {
        name: 'showCompanyAddress',
        label: 'Mostrar domicilio fiscal',
        tip: 'Muestra la dirección fiscal registrada de la empresa.',
      },
      {
        name: 'showCompanyBusinessName',
        label: 'Mostrar razón social',
        tip: 'Muestra la razón social de la empresa.',
      },
      {
        name: 'showCompanySocialNetworks',
        label: 'Mostrar redes sociales',
        tip: 'Muestra los enlaces a las redes sociales de la empresa.',
      },
      {
        name: 'showCompanyContacts',
        label: 'Mostrar contactos',
        tip: 'Muestra los teléfonos y correos de contacto de la empresa.',
      },
    ],
  },
  {
    key: 'logistics',
    label: 'Sucursales y pagos',
    hint: 'Sucursales, forma de pago y cuentas bancarias',
    icon: Truck,
    fields: [
      {
        name: 'showBranches',
        label: 'Mostrar sucursales',
        tip: 'Muestra la lista completa de sucursales. No se puede elegir sucursales individuales.',
      },
      {
        name: 'showPaymentMethod',
        label: 'Mostrar forma de pago',
        tip: 'Muestra la forma de pago aceptada (efectivo, transferencia, etc.).',
      },
      {
        name: 'showBankAccounts',
        label: 'Mostrar cuentas bancarias',
        tip: 'Muestra la lista completa de cuentas bancarias registradas. No se puede elegir cuentas individuales.',
      },
    ],
  },
  {
    key: 'closing',
    label: 'Cierre',
    hint: 'Texto final, saludo y firma antes de terminar el documento',
    icon: FileSignature,
    fields: [
      {
        name: 'showFinalText',
        label: 'Mostrar texto final',
        tip: 'Muestra el párrafo de cierre configurado en la pestaña "Textos extra".',
      },
      {
        name: 'showFinalGreeting',
        label: 'Mostrar saludo final',
        tip: 'Muestra el saludo de despedida configurado en la pestaña "Textos extra".',
      },
      {
        name: 'showSignature',
        label: 'Mostrar firma',
        tip: 'Muestra un espacio con la firma registrada al final del documento.',
      },
    ],
  },
  {
    key: 'footer',
    label: 'Pie de página',
    hint: 'Franja inferior del documento',
    icon: PanelBottom,
    fields: [
      {
        name: 'showFooter',
        label: 'Mostrar pie de página',
        tip: 'Muestra la franja inferior con el texto de cierre configurado en la pestaña "Diseño del PDF".',
      },
    ],
  },
]
