import { getAuthToken, useAuthStore } from '@/store/authStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  token?: string
  cache?: RequestCache
  revalidate?: number
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
    cache,
    revalidate,
  } = options

  // Si no se pasa token explícito, se toma el de la sesión actual.
  const authToken = token ?? getAuthToken()

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    ...(revalidate !== undefined
      ? { next: { revalidate } }
      : {}),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    // Sesión vencida/inválida: si mandamos un token y el server responde 401,
    // cerramos la sesión y mandamos al login (evita errores confusos por acción,
    // ej. "no se pudo subir la imagen: Unauthorized"). No aplica al propio login,
    // que va sin token.
    if (res.status === 401 && authToken && typeof window !== 'undefined') {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/cuenta')) {
        const here = window.location.pathname + window.location.search
        window.location.href = `/cuenta?callbackUrl=${encodeURIComponent(here)}&expired=1`
      }
      throw new ApiError(401, 'Tu sesión expiró. Iniciá sesión de nuevo.')
    }
    throw new ApiError(res.status, error.message ?? 'Error inesperado')
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T>(path: string, body: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
}

export { ApiError }
