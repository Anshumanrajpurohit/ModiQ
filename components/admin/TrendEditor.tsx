"use client"

import { useRouter } from "next/navigation"
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react"

type AdminProduct = {
  id: string
  categoryId: string
  name: string
}

type AdminCategory = {
  id: string
  name: string
}

type TrendFormData = {
  title: string
  subtitle: string
  discountCode: string
  discountPercent: number
  heroImage: string
  productIds: string[]
  targetCategory: string
  active: boolean
}

type TrendEditorProps = {
  mode: "create" | "edit"
  trendId?: string
}

const emptyForm: TrendFormData = {
  title: "",
  subtitle: "",
  discountCode: "",
  discountPercent: 10,
  heroImage: "",
  productIds: [],
  targetCategory: "",
  active: false,
}

const convertFileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsDataURL(file)
  })

export function TrendEditor({ mode, trendId }: TrendEditorProps) {
  const router = useRouter()
  const [form, setForm] = useState<TrendFormData>(emptyForm)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      try {
        const [productsRes, categoriesRes, trendRes] = await Promise.all([
          fetch("/api/catalog/products"),
          fetch("/api/catalog/categories"),
          mode === "edit" && trendId ? fetch(`/api/trends/${trendId}`) : Promise.resolve(null),
        ])

        const productsBody = await productsRes.json().catch(() => ({}))
        const categoriesBody = await categoriesRes.json().catch(() => ({}))
        const trendBody = trendRes ? await trendRes.json().catch(() => ({})) : null

        if (!productsRes.ok) throw new Error(productsBody?.error ?? "Unable to load products")
        if (!categoriesRes.ok) throw new Error(categoriesBody?.error ?? "Unable to load categories")
        if (trendRes && !trendRes.ok) throw new Error(trendBody?.error ?? "Unable to load trend")

        if (!active) return

        setProducts(productsBody.products ?? [])
        setCategories(categoriesBody.categories ?? [])

        if (trendBody?.trend) {
          const trend = trendBody.trend as TrendFormData
          setForm({
            title: trend.title ?? "",
            subtitle: trend.subtitle ?? "",
            discountCode: trend.discountCode ?? "",
            discountPercent: trend.discountPercent ?? 10,
            heroImage: trend.heroImage ?? "",
            productIds: trend.productIds ?? [],
            targetCategory: trend.targetCategory ?? "",
            active: Boolean(trend.active),
          })
        }
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "Failed to load form data")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [mode, trendId])

  const selectedProductCount = form.productIds.length
  const productLookup = useMemo(() => new Set(form.productIds), [form.productIds])

  const toggleProduct = (productId: string) => {
    setForm((current) => {
      const exists = current.productIds.includes(productId)
      if (exists) {
        return { ...current, productIds: current.productIds.filter((id) => id !== productId) }
      }

      if (current.productIds.length >= 3) {
        return current
      }

      return { ...current, productIds: [...current.productIds, productId] }
    })
  }

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await convertFileToDataUrl(file)
      setForm((current) => ({ ...current, heroImage: dataUrl }))
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Unable to upload image")
    } finally {
      event.target.value = ""
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (form.productIds.length !== 3) {
      setError("Select exactly 3 products for the trend campaign")
      return
    }

    setIsSaving(true)
    try {
      const endpoint = mode === "create" ? "/api/trends" : `/api/trends/${trendId}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to save trend campaign")
      }

      router.push("/admin/trends")
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save campaign")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-6 py-10 text-center text-sm text-[#999999]">
        Loading trend campaign form...
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
      {error && (
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[#4A4A4A]">
          Trend Title
          <input
            required
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2"
          />
        </label>
        <label className="text-sm text-[#4A4A4A]">
          Discount Code
          <input
            required
            type="text"
            value={form.discountCode}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountCode: event.target.value.toUpperCase() }))
            }
            className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2"
          />
        </label>
      </div>

      <label className="block text-sm text-[#4A4A4A]">
        Subtitle
        <textarea
          required
          rows={3}
          value={form.subtitle}
          onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
          className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[#4A4A4A]">
          Discount Percent
          <input
            required
            type="number"
            min={1}
            max={100}
            value={form.discountPercent}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountPercent: Number(event.target.value) || 0 }))
            }
            className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2"
          />
        </label>
        <label className="text-sm text-[#4A4A4A]">
          Target Category
          <select
            required
            value={form.targetCategory}
            onChange={(event) => setForm((current) => ({ ...current, targetCategory: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm text-[#4A4A4A]">
        Hero Image Upload
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="mt-1 w-full rounded-2xl border border-[#9B9B9B]/40 px-4 py-2 text-sm"
          required={!form.heroImage}
        />
        {form.heroImage && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#666666]">Image selected</span>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, heroImage: "" }))}
              className="rounded-full border border-[#9B9B9B]/50 px-2 py-1 text-xs"
            >
              Remove
            </button>
          </div>
        )}
      </label>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#4A4A4A]">Select 3 Products</p>
          <span className="text-xs text-[#666666]">{selectedProductCount}/3 selected</span>
        </div>
        <div className="grid max-h-72 gap-2 overflow-y-auto rounded-2xl border border-[#9B9B9B]/30 p-3">
          {products.map((product) => {
            const checked = productLookup.has(product.id)
            const disabled = !checked && selectedProductCount >= 3
            return (
              <label
                key={product.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                  checked ? "border-[#A5B867] bg-[#F7FBEF]" : "border-[#E3E3E3]"
                } ${disabled ? "opacity-50" : ""}`}
              >
                <span>{product.name}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleProduct(product.id)}
                />
              </label>
            )
          })}
        </div>
      </section>

      <label className="inline-flex items-center gap-2 text-sm text-[#4A4A4A]">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
        />
        Active campaign
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/trends")}
          className="rounded-full border border-[#9B9B9B]/40 px-5 py-2 text-sm font-semibold text-[#4A4A4A]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[#A5B867] px-6 py-2 text-sm font-semibold text-[#4A4A4A] disabled:opacity-60"
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create Campaign" : "Save Campaign"}
        </button>
      </div>
    </form>
  )
}
