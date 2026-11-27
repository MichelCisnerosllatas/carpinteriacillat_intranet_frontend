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
  '/reports',
  '/users',
  '/roles',
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
  '/typeworks',
  '/typefonts',
  '/web-works',
  '/web-alerts',
  '/chatbot',
  '/clients',
  '/products-services',
  '/proformas',
  '/proforma-templates',
  '/proforma-types',
  '/sales',
  '/sale-document-types',
  '/sale-settings',
  '/sale-goals',
  '/company-settings',
  '/company-branches',
  '/company-bank-accounts',
  '/company-signatures',
  '/company-contacts',
  '/company-social-networks',
  '/contact-messages',
  '/storage',
  '/ui-components',
]

// Los permisos por rol YA NO se revisan aquí (antes se usaba ROUTE_ROLES con el id del rol).
// El middleware solo controla que haya token. Qué páginas puede ver cada usuario lo decide
// el guard del cliente RoutePermissionGuard (src/features/auth/ui/route-permission-guard.tsx)
// con los permisos que devuelve el backend. Ver ROLES_Y_PERMISOS.md.

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

  const isProtected = isProtectedRoute(pathname)
  if (!accessToken && isProtected) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (accessToken && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/', request.url))
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