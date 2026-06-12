/**
 * Manejo del JWT del lado del cliente.
 * Guarda el token en una cookie (no httpOnly) para que el middleware de Next
 * pueda leerlo y proteger rutas, además del store persistido en localStorage.
 */
export const TOKEN_COOKIE = 'del_token'

export function setTokenCookie(token: string) {
  if (typeof document === 'undefined') return
  // 7 días, SameSite=Lax. En prod (https) agregar Secure.
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${TOKEN_COOKIE}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`
}

export function clearTokenCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}
