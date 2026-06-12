import { api } from '@/utils/api'

export type PresignResponse = {
  uploadUrl: string
  key: string
  publicUrl: string | null
}

export const uploadService = {
  /** ¿Está configurado S3 en el backend? */
  status: () => api.get<{ configured: boolean }>('/upload/status'),

  presign: (filename: string, contentType: string, folder = 'productos') =>
    api.post<PresignResponse>('/upload/presign', {
      filename,
      contentType,
      folder,
    }),

  /**
   * Sube un archivo a S3 vía URL prefirmada y devuelve la key + URL pública.
   * Requiere que el backend tenga S3 configurado (si no, /presign devuelve 503).
   */
  uploadFile: async (file: File, folder = 'productos') => {
    const { uploadUrl, key, publicUrl } = await uploadService.presign(
      file.name,
      file.type,
      folder,
    )
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!res.ok) throw new Error('Error al subir la imagen a S3')
    return { key, publicUrl }
  },
}
