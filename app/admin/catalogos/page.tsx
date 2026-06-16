'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2, Trash2, Pencil, X, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  catalogosService,
  type Catalogo,
  type CatalogoKind,
} from '@/services/catalogos.service'
import { uploadService } from '@/services/upload.service'

export default function AdminCatalogosPage() {
  const [items, setItems] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Catalogo | null>(null)
  const [name, setName] = useState('')
  const [sourceType, setSourceType] = useState<CatalogoKind>('drive')
  const [driveUrl, setDriveUrl] = useState('')
  const [pdfKey, setPdfKey] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () =>
    catalogosService
      .listAdmin()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setName('')
    setSourceType('drive')
    setDriveUrl('')
    setPdfKey('')
    setPdfName('')
    setImage('')
    setError(null)
  }

  const openNew = () => {
    setEditing(null)
    resetForm()
    setShowForm(true)
  }

  const openEdit = (c: Catalogo) => {
    setEditing(c)
    setName(c.name)
    setSourceType(c.pdfKey ? 'pdf' : 'drive')
    setDriveUrl(c.driveUrl ?? '')
    setPdfKey(c.pdfKey ?? '')
    setPdfName(c.pdfKey ? c.pdfKey.split('/').pop() ?? 'PDF actual' : '')
    setImage(c.image ?? '')
    setError(null)
    setShowForm(true)
  }

  const uploadImage = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const { key } = await uploadService.uploadFile(file, 'catalogos')
      setImage(key)
    } catch {
      setError('No se pudo subir la imagen (¿S3 configurado?).')
    } finally {
      setUploading(false)
    }
  }

  const uploadPdf = async (file?: File) => {
    if (!file) return
    setUploadingPdf(true)
    setError(null)
    try {
      const { key } = await uploadService.uploadFile(file, 'catalogos')
      setPdfKey(key)
      setPdfName(file.name)
    } catch {
      setError('No se pudo subir el PDF (¿S3 configurado?).')
    } finally {
      setUploadingPdf(false)
    }
  }

  const save = async () => {
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name,
        image: image || undefined,
        driveUrl: sourceType === 'drive' ? driveUrl : null,
        pdfKey: sourceType === 'pdf' ? pdfKey : null,
      }
      if (editing) await catalogosService.update(editing.id, payload)
      else await catalogosService.create(payload)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: Catalogo) => {
    if (!confirm(`¿Eliminar el catálogo "${c.name}"?`)) return
    setBusyId(c.id)
    try {
      await catalogosService.remove(c.id)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const canSave =
    !!name && (sourceType === 'drive' ? !!driveUrl : !!pdfKey) && !uploadingPdf

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Catálogos
          </h1>
          <p className="text-sm text-muted-foreground">
            Link de Drive o PDF, visibles solo para clientes logueados.
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="size-4" />
          Nuevo catálogo
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {editing ? 'Editar catálogo' : 'Nuevo catálogo'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Catálogo General 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen de portada</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files?.[0])}
              />
              {uploading && (
                <p className="text-xs text-muted-foreground">Subiendo…</p>
              )}
              {image && !uploading && (
                <p className="text-xs text-green-600">Imagen cargada</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tipo de catálogo</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSourceType('drive')}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    sourceType === 'drive'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Link de Drive
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('pdf')}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    sourceType === 'pdf'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  PDF
                </button>
              </div>
            </div>

            {sourceType === 'drive' ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>Link público de Drive</Label>
                <Input
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                />
              </div>
            ) : (
              <div className="space-y-2 sm:col-span-2">
                <Label>Archivo PDF</Label>
                <Input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => uploadPdf(e.target.files?.[0])}
                />
                {uploadingPdf && (
                  <p className="text-xs text-muted-foreground">Subiendo PDF…</p>
                )}
                {pdfKey && !uploadingPdf && (
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <FileText className="size-3" />
                    {pdfName || 'PDF cargado'}
                  </p>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={save}
            loading={saving}
            disabled={!canSave}
            className="mt-4 rounded-full"
          >
            Guardar
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Contenido</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="text-xs text-muted-foreground">
                    {c.pdfKey ? 'PDF' : 'Drive'}
                  </td>
                  <td>
                    <a
                      href={c.pdfKey ? c.pdfUrl ?? '#' : c.driveUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {c.pdfKey ? (
                        <FileText className="size-3" />
                      ) : (
                        <ExternalLink className="size-3" />
                      )}{' '}
                      Abrir
                    </a>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${c.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {c.active ? 'Visible' : 'Oculto'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Pencil className="size-3" /> Editar
                      </button>
                      <button
                        onClick={() => remove(c)}
                        disabled={busyId === c.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {busyId === c.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}{' '}
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay catálogos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
