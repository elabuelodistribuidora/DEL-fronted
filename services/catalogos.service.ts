import { api } from '@/utils/api'

export type CatalogoKind = 'drive' | 'pdf'

export type CatalogoPublic = {
  id: string
  name: string
  imageUrl: string | null
  kind: CatalogoKind
}

export type Catalogo = {
  id: string
  name: string
  image?: string | null
  imageUrl?: string | null
  driveUrl?: string | null
  pdfKey?: string | null
  pdfUrl?: string | null
  active: boolean
}

export type CatalogoInput = {
  name: string
  image?: string
  driveUrl?: string | null
  pdfKey?: string | null
  active?: boolean
}

export const catalogosService = {
  /** Público: nombre + imagen + tipo (sin link/PDF). */
  list: () => api.get<CatalogoPublic[]>('/catalogos'),

  /** Requiere sesión: devuelve la URL a abrir (PDF o Drive). */
  getLink: (id: string) =>
    api.get<{ id: string; name: string; url: string; kind: CatalogoKind }>(
      `/catalogos/${id}/link`,
    ),

  // ── Admin ──
  listAdmin: () => api.get<Catalogo[]>('/catalogos/admin/all'),
  create: (input: CatalogoInput) => api.post<Catalogo>('/catalogos', input),
  update: (id: string, input: Partial<CatalogoInput>) =>
    api.patch<Catalogo>(`/catalogos/${id}`, input),
  remove: (id: string) =>
    api.delete<{ deleted: boolean }>(`/catalogos/${id}`),
}
