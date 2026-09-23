import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
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
  '/user-devices',
  '/google-access-requests',
  '/furnitures',
  '/furniture-images',
  '/categories',
  '/images',
  '/navigations',
  '/sections',
  '/footer',
  '/section-images',
  '/section-buttons',
  '/section-items',
  '/section-item-details',
  '/testimony',
  '/typecolors',
  '/typedocs',
  '/typesections',
  '/typewoods',
  '/clients',
  '/products-services',
  '/proformas',
  '/proforma-templates',
  '/proforma-types',
  '/company-settings',
  '/company-branches',
  '/company-bank-accounts',
  '/company-signatures',
  '/company-contacts',
  '/company-social-networks',
  '/contact-messages',
  '/storage',
  '/tasks',
  '/apps',
  '/chats',
  '/help-center',
  '/ui-components',
]

// '/dashboard' NO debe estar acá: es la página de aterrizaje compartida por cualquier rol
// autenticado, y también el destino de fallback cuando un rol no tiene acceso a una ruta
// restringida (ver más abajo). Si se restringe a un rol, cualquier cuenta con otro rol entra en
// loop infinito de redirects: /ruta-restringida -> (rol no permitido) -> /dashboard -> (rol
// tampoco permitido ahí) -> /dashboard -> ...
const ROUTE_ROLES: Record<string, string[]> = {
  '/users': ['1'],
  '/roles': ['1'],
  '/permissions': ['1'],
  '/user-devices': ['1'],
}

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

function getMatchedRoleRoute(pathname: string) {
  return Object.keys(ROUTE_ROLES).find((route) => {
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('access_token')?.value
  const role = request.cookies.get('auth_role')?.value

  const isProtected = isProtectedRoute(pathname)
  if (!accessToken && isProtected) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (accessToken && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (accessToken && isProtected) {
    const matchedRoleRoute = getMatchedRoleRoute(pathname)
    if (matchedRoleRoute) {
      const allowedRoles = ROUTE_ROLES[matchedRoleRoute]

      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)).*)',
  ],
}
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
//
// const PUBLIC_ROUTES = [
//   '/',
//   '/sign-in',
//   '/forgot-password',
//   '/reset-password',
// ]
//
// const PROTECTED_PREFIXES = [
//   '/dashboard',
//   '/settings',
//   '/users',
//   '/roles',
//   '/permissions',
//   '/profile',
// ]
//
// function isPublicRoute(pathname: string) {
//   return PUBLIC_ROUTES.some(
//     (route) => pathname === route || pathname.startsWith(`${route}/`)
//   )
// }
//
// function isProtectedRoute(pathname: string) {
//   return PROTECTED_PREFIXES.some(
//     (route) => pathname === route || pathname.startsWith(`${route}/`)
//   )
// }
//
// // export function middleware(request: NextRequest) {
// //   const { pathname } = request.nextUrl
// //
// //   const accessToken = request.cookies.get('access_token')?.value
// //
// //   const isPublic = isPublicRoute(pathname)
// //   const isProtected = isProtectedRoute(pathname)
// //
// //   // Usuario sin sesión intentando entrar a rutas privadas
// //   if (!accessToken && isProtected) {
// //     return NextResponse.redirect(new URL('/sign-in', request.url))
// //   }
// //
// //   // Usuario con sesión intentando volver al login
// //   if (accessToken && pathname === '/sign-in') {
// //     return NextResponse.redirect(new URL('/dashboard', request.url))
// //   }
// //
// //   return NextResponse.next()
// // }
// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
//
//   const accessToken = request.cookies.get('access_token')?.value
//   const isProtected = isProtectedRoute(pathname)
//
//   if (!accessToken && isProtected) {
//     return NextResponse.redirect(new URL('/sign-in', request.url))
//   }
//
//   if (accessToken && pathname === '/sign-in') {
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }
//
//   return NextResponse.next()
// }
//
// export const config = {
//   matcher: [
//     /*
//       Evita que el middleware afecte:
//       - imágenes
//       - favicon
//       - archivos estáticos
//       - _next
//       - api
//     */
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)).*)',
//   ],
// }