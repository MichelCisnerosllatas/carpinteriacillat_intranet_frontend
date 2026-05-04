import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/splash',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
]

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/settings',
  '/users',
  '/roles',
  '/permissions',
  '/profile',
]

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value

  const isPublic = isPublicRoute(pathname)
  const isProtected = isProtectedRoute(pathname)

  // Usuario sin sesión intentando entrar a rutas privadas
  if (!accessToken && isProtected) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Usuario con sesión intentando volver al login
  if (accessToken && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Evita que el middleware afecte:
      - imágenes
      - favicon
      - archivos estáticos
      - _next
      - api
    */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)).*)',
  ],
}