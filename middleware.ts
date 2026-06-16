import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_COOKIE = 'del_token'

/**
 * Protege rutas privadas verificando la presencia del JWT en la cookie.
 * La validación real del token la hace el backend; acá solo redirigimos a
 * /login si no hay sesión. El rol admin se valida además en el AdminGuard
 * del lado del cliente.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_COOKIE)

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // /cuenta queda fuera (es la página de login). Protegemos /cuenta/pedidos.
  matcher: [
    '/admin/:path*',
    '/cuenta/pedidos/:path*',
    '/carrito/:path*',
    '/checkout/:path*',
  ],
}
