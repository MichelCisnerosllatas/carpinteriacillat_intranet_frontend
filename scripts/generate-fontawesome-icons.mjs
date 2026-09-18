// scripts/generate-fontawesome-icons.mjs
//
// Regenera `src/shared/config/data/fontawesome-free-icons.json` a partir de la metadata REAL
// del paquete `@fortawesome/fontawesome-free` instalado (node_modules) — nunca a mano. Así el
// selector de iconos (`IconPicker`) solo puede ofrecer nombres que de verdad existen en la
// versión de Font Awesome Free que usa el proyecto web público (ver icon-picker.tsx).
//
// Se queda solo con estilos "classic" (solid/regular/brands) disponibles en la licencia FREE —
// el paquete "-free" no incluye SVGs de iconos Pro, así que cualquier icono con al menos un
// estilo classic libre entra en la lista.
//
// Incluye el `path`/`viewBox` de cada SVG directo en el JSON (en vez de que `IconPicker`
// importe archivos `.svg` individuales de `node_modules` en tiempo de ejecución) — este proyecto
// no tiene configurado un loader de SVG-a-texto (ni webpack ni Turbopack lo hacen por defecto),
// así que depender de esos imports sería frágil. Un solo JSON de ~1.5MB (se achica mucho con
// gzip) que Next.js carga bajo demanda solo cuando se abre el selector es más simple y seguro.
//
// Ejecutar tras actualizar la versión de `@fortawesome/fontawesome-free`:
//   node scripts/generate-fontawesome-icons.mjs

import { createRequire } from 'module'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const families = require('@fortawesome/fontawesome-free/metadata/icon-families.json')

const list = []
for (const name of Object.keys(families).sort()) {
  const entry = families[name]
  const free = entry.familyStylesByLicense?.free ?? []
  const styles = free.filter((f) => f.family === 'classic').map((f) => f.style)
  if (!styles.length) continue

  const svgs = entry.svgs?.classic ?? {}
  /** @type {Record<string, [number, number, string]>} por estilo: [width, height, path] */
  const p = {}
  for (const style of styles) {
    const svg = svgs[style]
    if (svg) p[style] = [svg.width, svg.height, svg.path]
  }

  list.push({
    n: name,
    l: entry.label ?? name,
    s: styles,
    t: (entry.search?.terms ?? []).slice(0, 3),
    p,
  })
}

const outPath = join(__dirname, '..', 'src', 'shared', 'config', 'data', 'fontawesome-free-icons.json')
writeFileSync(outPath, JSON.stringify(list))
console.log(`Escritos ${list.length} iconos en ${outPath}`)
