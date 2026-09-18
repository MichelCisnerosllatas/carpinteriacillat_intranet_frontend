'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

/**
 * Mapa clickeable (Leaflet + OpenStreetMap, sin API key) para elegir latitud/longitud sin
 * escribirlas a mano — click para mover el pin, o arrastrarlo. `leaflet` toca `window`/`document`
 * apenas se importa, así que este componente SOLO se puede montar en el cliente — quien lo use
 * debe importarlo con `next/dynamic({ ssr: false })` (ver section-item-form.tsx).
 *
 * Usa la API imperativa de `leaflet` directo (no `react-leaflet`): esta última no tiene soporte
 * sólido para React 19 todavía, y acá alcanza con un mapa + un marcador, no hace falta el
 * wrapper declarativo.
 */
type LocationPickerProps = {
  latitude: number | null
  longitude: number | null
  onChange?: (lat: number, lng: number) => void
  className?: string
  /** Solo vista — sin pin arrastrable, sin click-para-mover, sin botón "Usar mi ubicación". Para mostrar una ubicación ya guardada (ver `LocationPreviewButton`), no para elegirla. */
  readOnly?: boolean
}

// Centro por defecto cuando todavía no hay coordenadas: Iquitos, Loreto - Perú (mismo dato real
// ya sembrado para el item "branch" de Contacto, ver SectionItemSeeder::seedContactInfo()).
const DEFAULT_CENTER: [number, number] = [-3.777157, -73.305]
const DEFAULT_ZOOM = 13
const PIN_ZOOM = 16

// DivIcon con SVG inline en vez de los PNG que trae `leaflet` por defecto — evita el problema
// clásico de bundlers ("no se ve el pin") sin depender de que el empaquetador resuelva imágenes
// dentro de node_modules/leaflet/dist/images.
const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.4))">
    <path fill="#dc2626" stroke="white" stroke-width="1" d="M12 0C7.03 0 3 4.03 3 9c0 6.63 8.13 14.49 8.47 14.82a.75.75 0 0 0 1.06 0C12.87 23.49 21 15.63 21 9c0-4.97-4.03-9-9-9Z"/>
    <circle cx="12" cy="9" r="3.5" fill="white"/>
  </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

export function LocationPicker({ latitude, longitude, onChange, className, readOnly = false }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [locating, setLocating] = useState(false)
  // En un ref para que el efecto de abajo (que crea el mapa UNA sola vez) no tenga que
  // depender de `onChange` y volver a crear el mapa en cada render del form.
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const hasCoords = latitude != null && longitude != null
    const center: [number, number] = hasCoords ? [latitude, longitude] : DEFAULT_CENTER

    const map = L.map(containerRef.current).setView(center, hasCoords ? PIN_ZOOM : DEFAULT_ZOOM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Pan/zoom siguen habilitados incluso en modo solo-lectura (es un widget para VER la
    // ubicación, no un mapa congelado) — lo único que se desactiva es poder mover el pin.
    const marker = L.marker(center, { icon: pinIcon, draggable: !readOnly }).addTo(map)

    if (!readOnly) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChangeRef.current?.(pos.lat, pos.lng)
      })
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        onChangeRef.current?.(e.latlng.lat, e.latlng.lng)
      })
    }

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el mapa se crea una sola vez; los cambios de lat/lng los sincroniza el efecto de abajo, no este.
  }, [])

  // Si lat/lng cambian desde AFUERA (ej. el admin los escribe a mano en los inputs), el pin se
  // mueve para reflejarlo — sincronización en el sentido contrario al de arriba.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (latitude == null || longitude == null) return

    const current = markerRef.current.getLatLng()
    if (Math.abs(current.lat - latitude) > 1e-9 || Math.abs(current.lng - longitude) > 1e-9) {
      markerRef.current.setLatLng([latitude, longitude])
      mapRef.current.panTo([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const { latitude: lat, longitude: lng } = pos.coords
        markerRef.current?.setLatLng([lat, lng])
        mapRef.current?.setView([lat, lng], PIN_ZOOM)
        onChangeRef.current?.(lat, lng)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className={className ?? 'h-64 w-full rounded-lg border'} />
      {!readOnly && (
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleUseMyLocation}
        disabled={locating}
        className={cn('absolute right-2 top-2 z-[1000] shadow-md')}
      >
        {locating ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <LocateFixed className="mr-1.5 size-3.5" />}
        Usar mi ubicación
      </Button>
      )}
    </div>
  )
}
