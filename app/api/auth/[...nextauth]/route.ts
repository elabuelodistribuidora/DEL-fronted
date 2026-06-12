/**
 * NextAuth route handler.
 * Configurar providers y callbacks cuando el backend esté listo.
 *
 * import NextAuth from 'next-auth'
 * import { authOptions } from '@/lib/auth'
 * const handler = NextAuth(authOptions)
 * export { handler as GET, handler as POST }
 */
export async function GET() {
  return new Response('NextAuth — configurar en lib/auth.ts', { status: 200 })
}
export async function POST() {
  return new Response('NextAuth — configurar en lib/auth.ts', { status: 200 })
}
