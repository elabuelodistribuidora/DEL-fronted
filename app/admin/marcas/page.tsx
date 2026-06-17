'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2, Trash2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { marcasService } from '@/services/marcas.service'
import { uploadService } from '@/services/upload.service'
import type { Marca } from '@/types/product'

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Marca | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Marca | null>(null)
  const [reassignTo, setReassignTo] = useState('')
  const [reassigning, setReassigning] = useState(false)

  const load = () =>
    marcasService
      .list(true)
      .then(setMarcas)
      .catch(() => setMarcas([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setName('')
    setLogo('')
    setError(null)
    setShowForm(true)
  }

  const openEdit = (m: Marca) => {
    setEditing(m)
    setName(m.name)
    setLogo(m.logo ?? '')
    setError(null)
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await marcasService.update(editing.id, { name, logo: logo || undefined })
      } else {
        await marcasService.create({ name, logo: logo || undefined })
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const startDelete = async (m: Marca) => {
    if ((m._count?.products ?? 0) === 0) {
      if (!confirm(`¿Eliminar la marca "${m.name}"?`)) return
      setBusyId(m.id)
      try {
        await marcasService.remove(m.id)
        await load()
      } finally {
        setBusyId(null)
      }
      return
    }
    // Tiene productos: pedir marca destino
    setDeleting(m)
    setReassignTo('')
  }

  const confirmReassignDelete = async () => {
    if (!deleting || !reassignTo) return
    setReassigning(true)
    try {
      await marcasService.remove(deleting.id, reassignTo)
      setDeleting(null)
      await load()
    } finally {
      setReassigning(false)
    }
  }

  const uploadLogo = async (file?: File) => {
    if (!file) return
    try {
      const { key } = await uploadService.uploadFile(file, 'marcas')
      setLogo(key)
    } catch {
      setError('No se pudo subir el logo (¿S3 configurado?).')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Marcas
          </h1>
          <p className="text-sm text-muted-foreground">
            Etiqueta de marca de los productos (nombre + logo).
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="size-4" />
          Nueva marca
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {editing ? 'Editar marca' : 'Nueva marca'}
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
                placeholder="Faber-Castell"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => uploadLogo(e.target.files?.[0])}
              />
              {logo && <p className="text-xs text-green-600">Logo: {logo}</p>}
            </div>
          </div>
          <Button
            onClick={save}
            loading={saving}
            disabled={!name}
            className="mt-4 rounded-full"
          >
            Guardar
          </Button>
        </div>
      )}

      {/* Panel de reasignación al borrar (si la marca tiene productos) */}
      {deleting && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="font-heading text-base font-semibold text-amber-900">
            Reasignar productos de “{deleting.name}”
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Esta marca tiene {deleting._count?.products} producto(s). Elegí a qué
            marca moverlos antes de eliminarla.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-64 space-y-2">
              <Label>Mover productos a</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí una marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas
                    .filter((m) => m.id !== deleting.id)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              disabled={!reassignTo}
              loading={reassigning}
              onClick={confirmReassignDelete}
            >
              Reasignar y eliminar
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Productos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((m) => (
                <tr key={m.id}>
                  <td className="font-medium">{m.name}</td>
                  <td>{m._count?.products ?? 0}</td>
                  <td>
                    <span
                      className={`status-badge ${m.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {m.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(m)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Pencil className="size-3" /> Editar
                      </button>
                      <button
                        onClick={() => startDelete(m)}
                        disabled={busyId === m.id}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        {busyId === m.id ? (
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
              {marcas.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No hay marcas.
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
