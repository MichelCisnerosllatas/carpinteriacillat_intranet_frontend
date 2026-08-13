import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // El layout de (intranet) usa cookies() (ver layout.tsx), lo que fuerza
    // renderizado dinámico en todas las rutas protegidas. Sin esto, el
    // Router Cache del cliente tiene staleTime=0 para rutas dinámicas: cada
    // navegación (incluso revisitar una ruta ya cargada) vuelve a pedir el
    // RSC al servidor y muestra el loading.tsx del segmento (el shimmer)
    // ANTES de que el componente cliente monte y su store evalúe
    // hasLoaded/forceReload. Con esta ventana, revisitar una ruta dentro de
    // los 30s reutiliza el payload cacheado (sin shimmer); el store igual
    // refresca los datos en segundo plano (badge "Actualizando...").
    staleTimes: {
      dynamic: 30,
    },
  },
}

export default nextConfig