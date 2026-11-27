// ¿Se pinta este bloque (widget) del dashboard?
// - Antes de cargar (data null): sí, para que se vea el "cargando".
// - Ya cargado: solo si el backend lo mandó. El backend OMITE los bloques que el rol no tiene,
//   así un widget nunca se queda "cargando" para siempre.
// Se usa junto con useCan('<pantalla>.<widget>') en cada página del dashboard.
export function hasBlock<T extends object>(data: T | null, key: keyof T): boolean {
  return !data || data[key] != null
}
