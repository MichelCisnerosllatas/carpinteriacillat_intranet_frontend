// Las 4 keys fijas que el generador de PDF busca por coincidencia exacta (ver "key: valores fijos"
// en pdf-template-texts.md). Cualquier otra key se puede guardar en BD, pero nunca se imprime — por
// eso la UI ya no deja escribir una key libre: solo ofrece agregar versiones dentro de estos 4 grupos.
export const TEMPLATE_TEXT_KEYS = [
  {
    key: 'texto_introductorio',
    label: 'Texto introductorio',
    hint: 'Se imprime justo después de "Presente .-", antes de la tabla de ítems.',
  },
  {
    key: 'forma_pago',
    label: 'Forma de pago',
    hint: 'Se imprime dentro de la tabla de ítems, en la fila "Forma de pago".',
  },
  {
    key: 'texto_final',
    label: 'Texto final',
    hint: 'Párrafo de cierre, después de los ítems y las cuentas bancarias.',
  },
  {
    key: 'saludo_final',
    label: 'Saludo final',
    hint: 'Se imprime justo debajo del texto final, antes de la firma.',
  },
] as const

export type TemplateTextKey = (typeof TEMPLATE_TEXT_KEYS)[number]['key']

// Textos por defecto para una plantilla NUEVA (ver seedDefaults en useProformaTemplateTextDraftStore):
// el redactado estándar que ya usa la empresa, para que el usuario no tenga que escribirlo de cero
// al crear una plantilla — puede editarlo o borrarlo igual que cualquier otra versión.
export const DEFAULT_TEMPLATE_TEXTS: Record<TemplateTextKey, { title: string; content: string }> = {
  texto_introductorio: {
    title: 'Texto introductorio',
    content:
      'De mi especial consideración y agrado, me dirijo a usted para saludarlo cordialmente y hacerle llegar la siguiente proforma de trabajo a realizar:',
  },
  forma_pago: {
    title: 'Forma de pago',
    content:
      '30% Adelantado y la diferencia contra entrega. Los depósitos podrán ser efectuados en las siguientes cuentas de ahorro soles.',
  },
  texto_final: {
    title: 'Texto final',
    content: 'Ante lo expuesto quedo de usted esperando la atención a la presente.',
  },
  saludo_final: {
    title: 'Saludo final',
    content: 'Saludos cordiales.',
  },
}
