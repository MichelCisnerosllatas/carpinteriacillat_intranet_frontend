/**
 * Navegador/dispositivo legible a partir del user agent (aproximado, solo para mostrar).
 * Ej.: "Chrome · Windows", "Safari · iPhone".
 */
export function describeUserAgent(ua: string | null | undefined): string {
  if (!ua) return '—'
  const browser =
    /Edg\//.test(ua) ? 'Edge'
      : /OPR\/|Opera/.test(ua) ? 'Opera'
        : /Firefox\//.test(ua) ? 'Firefox'
          : /Chrome\//.test(ua) ? 'Chrome'
            : /Safari\//.test(ua) ? 'Safari'
              : 'Navegador'
  const os =
    /iPhone/.test(ua) ? 'iPhone'
      : /iPad/.test(ua) ? 'iPad'
        : /Android/.test(ua) ? 'Android'
          : /Windows/.test(ua) ? 'Windows'
            : /Mac OS X|Macintosh/.test(ua) ? 'Mac'
              : /Linux/.test(ua) ? 'Linux'
                : 'otro'
  return `${browser} · ${os}`
}
