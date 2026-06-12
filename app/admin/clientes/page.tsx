'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2, Trash2, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientesService } from '@/services/clientes.service'
import { uploadService } from '@/services/upload.service'
import type { Cliente } from '@/types/product'

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () =>
    clientesService
      .list(true)
      .then(setClientes)
      .catch(() => setClientes([]))
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

  const openEdit = (c: Cliente) => {
    setEditing(c)
    setName(c.name)
    setLogo(c.logo ?? '')
    setError(null)
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await clientesService.update(editing.id, { name, logo: logo || undefined })
      } else {
        await clientesService.create({ name, logo: logo || undefined })
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: Cliente) => {
    if (
      !confirm(
        `¿Eliminar el proveedor "${c.name}"? Los productos asociados quedarán sin proveedor.`,
      )
    )
      return
    await clientesService.remove(c.id)
    load()
  }

  const uploadLogo = async (file?: File) => {
    if (!file) return
    try {
      const { key } = await uploadService.uploadFile(file, 'clientes')
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
            Proveedores
          </h1>
          <p className="text-sm text-muted-foreground">
            Etiqueta de proveedor oficial de los productos (nombre + logo).
          </p>
        </div>
        <Button onClick={openNew} className="rounded-full">
          <Plus className="size-4" />
          Nuevo proveedor
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
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
              {logo && (
                <p className="text-xs text-green-600">Logo: {logo}</p>
              )}
            </div>
          </div>
          <Button
            onClick={save}
            disabled={saving || !name}
            className="mt-4 rounded-full"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
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
                <th>Productos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c._count?.products ?? 0}</td>
                  <td>
                    <span
                      className={`status-badge ${c.active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}
                    >
                      {c.active ? 'Activo' : 'Inactivo'}
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
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 className="size-3" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No hay proveedores.
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
