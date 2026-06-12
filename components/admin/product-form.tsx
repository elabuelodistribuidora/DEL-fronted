'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Upload, Check } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { productsService } from '@/services/products.service'
import { categoriasService } from '@/services/categorias.service'
import { clientesService } from '@/services/clientes.service'
import { uploadService } from '@/services/upload.service'
import type { Categoria, Cliente } from '@/types/product'

type FormState = {
  name: string
  description: string
  brand: string
  unit: string
  sku: string
  price: string
  stock: string
  categoriaId: string
  clienteId: string
  featured: boolean
  image: string
}

const empty: FormState = {
  name: '',
  description: '',
  brand: '',
  unit: '',
  sku: '',
  price: '',
  stock: '0',
  categoriaId: '',
  clienteId: '',
  featured: false,
  image: '',
}

export function ProductForm({ id }: { id: string }) {
  const isNew = id === 'nuevo'
  const router = useRouter()
  const [form, setForm] = useState<FormState>(empty)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoriasService.list().then(setCategorias).catch(() => {})
    clientesService.list().then(setClientes).catch(() => {})
    if (!isNew) {
      productsService
        .getOne(id)
        .then((p) =>
          setForm({
            name: p.name,
            description: p.description ?? '',
            brand: p.brand,
            unit: p.unit,
            sku: p.sku ?? '',
            price: String(p.price),
            stock: String(p.stock),
            categoriaId: p.categoriaId,
            clienteId: p.clienteId ?? '',
            featured: Boolean(p.featured),
            image: p.image ?? '',
          }),
        )
        .catch(() => setError('No se pudo cargar el producto'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleUpload = async (file?: File) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { key } = await uploadService.uploadFile(file, 'productos')
      set('image', key)
    } catch {
      setError(
        'No se pudo subir la imagen (¿S3 configurado en el backend?). Podés guardar sin imagen por ahora.',
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || undefined,
      brand: form.brand,
      unit: form.unit,
      sku: form.sku || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      categoriaId: form.categoriaId,
      clienteId: form.clienteId || null,
      featured: form.featured,
      image: form.image || undefined,
    }
    try {
      if (isNew) {
        await productsService.create(payload)
      } else {
        await productsService.update(id, payload)
      }
      router.push('/admin/productos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Productos
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </h1>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nombre</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripción (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={form.categoriaId}
              onValueChange={(v) => set('categoriaId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proveedor (opcional)</Label>
            <Select
              value={form.clienteId || 'none'}
              onValueChange={(v) => set('clienteId', v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin proveedor</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marca</Label>
            <Input
              required
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="Laffitté, MultiMax..."
            />
          </div>
          <div className="space-y-2">
            <Label>Unidad</Label>
            <Input
              required
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              placeholder="Pomo 500 ml, Set x 12..."
            />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="LAF-PA-500"
            />
          </div>
          <div className="space-y-2">
            <Label>Precio mayorista</Label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="4500"
            />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : form.image ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Upload className="size-4" />
                )}
                {form.image ? 'Imagen cargada' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="featured"
              checked={form.featured}
              onCheckedChange={(v) => set('featured', Boolean(v))}
            />
            <Label htmlFor="featured" className="cursor-pointer font-normal">
              Producto destacado (aparece en la home)
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="rounded-full"
          loading={saving}
          disabled={!form.categoriaId}
        >
          Guardar
        </Button>
      </form>
    </div>
  )
}
