"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

type AdminView = "categories" | "products"

type AdminCategory = {
  id: string
  name: string
  heroLine: string
  description: string
  image: string
}

type AdminProduct = {
  id: string
  categoryId: string
  name: string
  price: number | null
  specs: string[]
  image: string
  description: string
  highlights: string[]
}

type AdminOrder = {
  id: string
  client: string
  status: "Awaiting dispatch" | "In production" | "Completed"
  items: number
  value: string
  eta: string
}

type CategoryFormData = Omit<AdminCategory, "id">
type ProductFormData = {
  name: string
  description: string
  image: string
  price: string
  specs: string
  highlights: string
}

type CategoryModalState =
  | null
  | {
      mode: "add"
      data: CategoryFormData
    }
  | {
      mode: "edit"
      categoryId: string
      data: CategoryFormData
    }

type ProductModalState =
  | null
  | {
      mode: "add"
      categoryId: string
      data: ProductFormData
    }
  | {
      mode: "edit"
      categoryId: string
      productId: string
      data: ProductFormData
    }

const emptyCategoryForm: CategoryFormData = {
  name: "",
  heroLine: "",
  description: "",
  image: "",
}

const emptyProductForm: ProductFormData = {
  name: "",
  description: "",
  image: "",
  price: "",
  specs: "",
  highlights: "",
}

const parseList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

const MOCK_ORDERS: AdminOrder[] = [
  {
    id: "ORD-4821",
    client: "Studio Aurelia",
    status: "In production",
    items: 42,
    value: "₹4.8L",
    eta: "12 Dec",
  },
  {
    id: "ORD-4822",
    client: "Maison Kinetic",
    status: "Awaiting dispatch",
    items: 18,
    value: "₹2.1L",
    eta: "09 Dec",
  },
  {
    id: "ORD-4823",
    client: "Urban Grain",
    status: "Completed",
    items: 25,
    value: "₹3.6L",
    eta: "Delivered",
  },
]

const ORDER_BADGE_STYLES: Record<AdminOrder["status"], string> = {
  "Awaiting dispatch": "border border-sky-400/40 bg-sky-500/15 text-sky-200",
  "In production": "border border-amber-400/40 bg-amber-500/15 text-amber-100",
  Completed: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
}

const convertFileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsDataURL(file)
  })

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(null)
  const [productModal, setProductModal] = useState<ProductModalState>(null)
  const [categoryList, setCategoryList] = useState<AdminCategory[]>([])
  const [productMap, setProductMap] = useState<Record<string, AdminProduct[]>>({})
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCategorySaving, setIsCategorySaving] = useState(false)
  const [isProductSaving, setIsProductSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/admin")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
    }
  }, [router, user])

  const handleApiError = useCallback((error: unknown) => {
    console.error("admin.api", error)
    setErrorMessage(error instanceof Error ? error.message : "Unexpected Supabase error.")
  }, [])

  useEffect(() => {
    if (!errorMessage) return
    const timer = window.setTimeout(() => setErrorMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [errorMessage])

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch("/api/catalog/categories")
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load categories")
      }
      setCategoryList(payload.categories ?? [])
      setErrorMessage(null)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoadingCategories(false)
    }
  }, [handleApiError])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const fetchProductsForCategory = useCallback(
    async (categoryId: string) => {
      setLoadingCategoryId(categoryId)
      try {
        const response = await fetch(`/api/catalog/products?category=${categoryId}`)
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to load products")
        }
        setProductMap((previous) => ({ ...previous, [categoryId]: payload.products ?? [] }))
      } catch (error) {
        handleApiError(error)
      } finally {
        setLoadingCategoryId((current) => (current === categoryId ? null : current))
      }
    },
    [handleApiError]
  )

  useEffect(() => {
    if (!selectedCategoryId) return
    if (productMap[selectedCategoryId]) return
    fetchProductsForCategory(selectedCategoryId)
  }, [fetchProductsForCategory, productMap, selectedCategoryId])

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return categoryList.find((category) => category.id === selectedCategoryId) ?? null
  }, [categoryList, selectedCategoryId])

  const visibleProducts = useMemo(() => {
    if (!selectedCategoryId) return []
    return productMap[selectedCategoryId] ?? []
  }, [productMap, selectedCategoryId])

  const ordersMode = searchParams?.get("panel") === "orders"

  const activeView: AdminView = selectedCategory ? "products" : "categories"

  const openCategoryModal = (mode: "add" | "edit", categoryId?: string) => {
    if (mode === "edit" && categoryId) {
      const category = categoryList.find((entry) => entry.id === categoryId)
      if (!category) return
      setCategoryModal({
        mode: "edit",
        categoryId,
        data: {
          name: category.name,
          heroLine: category.heroLine,
          description: category.description,
          image: category.image,
        },
      })
      return
    }

    setCategoryModal({
      mode: "add",
      data: { ...emptyCategoryForm },
    })
  }

  const openProductModal = (mode: "add" | "edit", categoryId: string, productId?: string) => {
    if (mode === "edit" && productId) {
      const product = productMap[categoryId]?.find((entry) => entry.id === productId)
      if (!product) return
      setProductModal({
        mode: "edit",
        categoryId,
        productId,
        data: {
          name: product.name,
          description: product.description,
          image: product.image,
              price: product.price !== null ? String(product.price) : "",
          specs: product.specs.join(", "),
          highlights: product.highlights.join(", "),
        },
      })
      return
    }

    setProductModal({
      mode: "add",
      categoryId,
      data: { ...emptyProductForm },
    })
  }

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!categoryModal) return
    const trimmedName = categoryModal.data.name.trim()
    if (!trimmedName) return

    setIsCategorySaving(true)
    const endpoint =
      categoryModal.mode === "add"
        ? "/api/catalog/categories"
        : `/api/catalog/categories/${categoryModal.categoryId}`
    const method = categoryModal.mode === "add" ? "POST" : "PUT"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryModal.data),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to save category")
      }

      const savedCategory = payload.category as AdminCategory
      setCategoryList((prev) => {
        if (categoryModal.mode === "add") {
          return [...prev, savedCategory]
        }
        return prev.map((category) => (category.id === savedCategory.id ? savedCategory : category))
      })
      setProductMap((prev) => ({ ...prev, [savedCategory.id]: prev[savedCategory.id] ?? [] }))
      if (categoryModal.mode === "add") {
        setSelectedCategoryId(savedCategory.id)
      }
      setCategoryModal(null)
      setErrorMessage(null)
      setActionMessage(
        categoryModal.mode === "add" ? "Category created successfully." : "Category updated successfully."
      )
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsCategorySaving(false)
    }
  }

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!productModal) return

    const categoryId = productModal.categoryId
    const priceValue = productModal.data.price.trim()
    const payload = {
      categoryId,
      name: productModal.data.name.trim(),
      description: productModal.data.description.trim(),
      image: productModal.data.image.trim() || "/images/placeholder.png",
      price: priceValue ? Number(priceValue) : null,
      specs: parseList(productModal.data.specs),
      highlights: parseList(productModal.data.highlights),
    }

    setIsProductSaving(true)
    const endpoint =
      productModal.mode === "add"
        ? "/api/catalog/products"
        : `/api/catalog/products/${productModal.productId}`
    const method = productModal.mode === "add" ? "POST" : "PUT"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to save product")
      }

      const savedProduct = body.product as AdminProduct
      setProductMap((prev) => {
        const current = prev[categoryId] ?? []
        if (productModal.mode === "add") {
          return {
            ...prev,
            [categoryId]: [...current, savedProduct],
          }
        }

        return {
          ...prev,
          [categoryId]: current.map((product) => (product.id === savedProduct.id ? savedProduct : product)),
        }
      })
      setProductModal(null)
      setSelectedCategoryId(categoryId)
      setErrorMessage(null)
      setActionMessage(
        productModal.mode === "add" ? "Product created successfully." : "Product updated successfully."
      )
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsProductSaving(false)
    }
  }

  const handleCategoryImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !categoryModal) {
      event.target.value = ""
      return
    }

    try {
      const dataUrl = await convertFileToDataUrl(file)
      setCategoryModal((current) =>
        current ? { ...current, data: { ...current.data, image: dataUrl } } : current
      )
    } catch (error) {
      handleApiError(error)
    } finally {
      event.target.value = ""
    }
  }

  const handleProductImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !productModal) {
      event.target.value = ""
      return
    }

    try {
      const dataUrl = await convertFileToDataUrl(file)
      setProductModal((current) =>
        current ? { ...current, data: { ...current.data, image: dataUrl } } : current
      )
    } catch (error) {
      handleApiError(error)
    } finally {
      event.target.value = ""
    }
  }

  const clearCategoryImage = () =>
    setCategoryModal((current) =>
      current ? { ...current, data: { ...current.data, image: "" } } : current
    )

  const clearProductImage = () =>
    setProductModal((current) =>
      current ? { ...current, data: { ...current.data, image: "" } } : current
    )

  if (!user || user.role !== "admin") {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm tracking-[0.3em] text-white/40">Validating admin clearance…</p>
      </section>
    )
  }

  return (
    <>
      <section className="min-h-screen bg-gradient-to-b from-[#050505] via-[#0b0b0b] to-[#151515] px-4 py-12 text-white">
        <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {ordersMode ? (
              <>
                <p className="text-xs uppercase tracking-[0.5em] text-[#c4d677]">Looking in · Orders</p>
                <h1 className="text-3xl font-semibold">Order Management Desk</h1>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.5em] text-[#c4d677]">
                  {selectedCategory ? `Looking in · ${selectedCategory.name}` : "Looking in · Categories"}
                </p>
                <h1 className="text-3xl font-semibold">
                  {selectedCategory ? `${selectedCategory.name} Inventory` : "Category Control Deck"}
                </h1>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {ordersMode ? (
              <button
                type="button"
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40"
              >
                Refresh board
              </button>
            ) : (
              <>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40"
                  >
                    ← Back to categories
                  </button>
                )}
                {activeView === "categories" ? (
                  <button
                    type="button"
                    onClick={() => openCategoryModal("add")}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#121212]"
                  >
                    ➕ Add new category
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectedCategoryId && openProductModal("add", selectedCategoryId)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#121212] disabled:opacity-60"
                    disabled={!selectedCategoryId}
                  >
                    ➕ Add product
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {(errorMessage || actionMessage) && (
          <div className="space-y-3">
            {errorMessage && (
              <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            )}
            {actionMessage && (
              <p className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {actionMessage}
              </p>
            )}
          </div>
        )}

          {ordersMode ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="glow-card px-5 py-4 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Active orders</p>
                <p className="text-3xl font-semibold text-white">{MOCK_ORDERS.length}</p>
                <p className="text-white/50">Currently in flight</p>
              </div>
                <div className="glow-card px-5 py-4 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Dispatch queue</p>
                <p className="text-3xl font-semibold text-white">
                  {MOCK_ORDERS.filter((order) => order.status === "Awaiting dispatch").length}
                </p>
                <p className="text-white/50">Need logistics slot</p>
              </div>
                <div className="glow-card px-5 py-4 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Completed</p>
                <p className="text-3xl font-semibold text-white">24</p>
                <p className="text-white/50">Month to date</p>
              </div>
            </div>
              <div className="space-y-4">
                {MOCK_ORDERS.map((order) => (
                  <article key={order.id} className="glow-card p-6 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/50">{order.id}</p>
                      <h3 className="text-xl font-semibold">{order.client}</h3>
                    </div>
                    <span className={`rounded-full px-4 py-1 text-xs font-semibold ${ORDER_BADGE_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                    <p>{order.items} line items</p>
                    <p>{order.value}</p>
                    <p>ETA {order.eta}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40"
                    >
                      📦 View products
                    </button>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:border-emerald-400/70"
                    >
                      ✅ Mark complete
                    </button>
                  </div>
                  </article>
                ))}
              </div>
            </div>
          ) : activeView === "categories" ? (
            isLoadingCategories ? (
              <p className="rounded-2xl border border-white/20 bg-black/30 px-5 py-10 text-center text-sm text-white/70">
                Syncing categories from Supabase…
              </p>
            ) : categoryList.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {categoryList.map((category) => (
                  <article key={category.id} className="glow-card flex flex-col gap-5 p-6 text-white">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-black/30 md:h-40 md:w-40">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 160px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <h2 className="text-2xl font-semibold">{category.name}</h2>
                      <p className="text-sm text-white/70">{category.heroLine}</p>
                      <p className="text-xs text-white/50">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openCategoryModal("edit", category.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#c4d677]/40 bg-[#c4d677]/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#c4d677] transition hover:border-[#c4d677]/60"
                    >
                      🚪 Explore
                    </button>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-400/60"
                      disabled
                      title="Delete via Supabase dashboard"
                    >
                      🗑 Delete
                    </button>
                  </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/20 px-5 py-10 text-center text-sm text-white/60">
                No categories yet. Use the “Add new category” button to seed the catalog.
              </p>
            )
          ) : (
            <div className="space-y-6">
              <div className="glow-card flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-white/70">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-[#c4d677]">Product stack</p>
                  <p>{visibleProducts.length} listed under {selectedCategory?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => selectedCategoryId && openProductModal("add", selectedCategoryId)}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 disabled:opacity-60"
                  disabled={!selectedCategoryId}
                >
                  ➕ Add another product
                </button>
              </div>
              {loadingCategoryId === selectedCategoryId ? (
                <p className="rounded-2xl border border-white/20 bg-black/30 px-5 py-10 text-center text-sm text-white/70">
                  Loading products for this category…
                </p>
              ) : visibleProducts.length ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {visibleProducts.map((product) => (
                    <article key={product.id} className="glow-card flex flex-col gap-4 p-6 text-white">
                      <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-black/40 md:h-36 md:w-36">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 144px"
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="text-sm text-white/70">{product.description}</p>
                          <p className="text-xs text-white/50">
                            {product.price !== null ? `List rate: ₹${product.price}` : "Rate shared on request"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                            {product.highlights.map((highlight) => (
                              <span key={highlight} className="rounded-full border border-white/10 px-3 py-1">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => openProductModal("edit", product.categoryId, product.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40"
                        >
                          ✏️ Edit product
                        </button>
                        <button
                          type="button"
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-400/60"
                          disabled
                          title="Delete from Supabase directly"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/20 px-5 py-10 text-center text-sm text-white/60">
                  No products logged yet. Use the buttons above to add SKUs under this category.
                </p>
              )}
            </div>
          )}
        </div>

        {categoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            className="w-full max-w-lg space-y-4 rounded-3xl border border-white/20 bg-[#111]/95 p-6 text-white"
            onSubmit={handleCategorySubmit}
          >
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Category</p>
                <h2 className="text-2xl font-semibold">
                  {categoryModal.mode === "add" ? "Add new category" : "Edit category"}
                </h2>
              </div>
              <button type="button" onClick={() => setCategoryModal(null)} className="text-white/60">
                ✕
              </button>
            </header>
            <label className="block text-sm">
              Name
              <input
                type="text"
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                value={categoryModal.data.name}
                onChange={(event) =>
                  setCategoryModal((current) =>
                    current
                      ? { ...current, data: { ...current.data, name: event.target.value } }
                      : current
                  )
                }
                required
              />
            </label>
            <label className="block text-sm">
              Hero line
              <input
                type="text"
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                value={categoryModal.data.heroLine}
                onChange={(event) =>
                  setCategoryModal((current) =>
                    current
                      ? { ...current, data: { ...current.data, heroLine: event.target.value } }
                      : current
                  )
                }
                required
              />
            </label>
            <label className="block text-sm">
              Description
              <textarea
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                rows={3}
                value={categoryModal.data.description}
                onChange={(event) =>
                  setCategoryModal((current) =>
                    current
                      ? { ...current, data: { ...current.data, description: event.target.value } }
                      : current
                  )
                }
                required
              />
            </label>
            <label className="block text-sm">
              Image URL
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2 text-sm"
                onChange={handleCategoryImageSelect}
                required={!categoryModal.data.image}
              />
              {categoryModal.data.image && (
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white/70">
                  <span className="truncate" title={categoryModal.data.image}>
                    {categoryModal.data.image}
                  </span>
                  <button
                    type="button"
                    onClick={clearCategoryImage}
                    className="rounded-full border border-white/30 px-2 py-1 text-white/80 hover:border-white"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryModal(null)}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCategorySaving}
                className="rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-4 py-2 text-sm font-semibold text-[#121212] disabled:opacity-60"
              >
                {isCategorySaving
                  ? "Saving…"
                  : categoryModal.mode === "add"
                    ? "Create"
                    : "Save changes"}
              </button>
            </div>
          </form>
          </div>
        )}

        {productModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/20 bg-[#111]/95 p-6 text-white"
            onSubmit={handleProductSubmit}
          >
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Product</p>
                <h2 className="text-2xl font-semibold">
                  {productModal.mode === "add" ? "Add new product" : "Edit product"}
                </h2>
                <p className="text-xs text-white/60">
                  Under category: {categoryList.find((entry) => entry.id === productModal.categoryId)?.name}
                </p>
              </div>
              <button type="button" onClick={() => setProductModal(null)} className="text-white/60">
                ✕
              </button>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                Product name
                <input
                  type="text"
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                  value={productModal.data.name}
                  onChange={(event) =>
                    setProductModal((current) =>
                      current
                        ? { ...current, data: { ...current.data, name: event.target.value } }
                        : current
                    )
                  }
                  required
                />
              </label>
              <label className="block text-sm">
                Image URL
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2 text-sm"
                  onChange={handleProductImageSelect}
                  required={!productModal.data.image}
                />
                {productModal.data.image && (
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white/70">
                    <span className="truncate" title={productModal.data.image}>
                      {productModal.data.image}
                    </span>
                    <button
                      type="button"
                      onClick={clearProductImage}
                      className="rounded-full border border-white/30 px-2 py-1 text-white/80 hover:border-white"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </label>
              <label className="block text-sm">
                Specs (comma separated)
                <input
                  type="text"
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                  value={productModal.data.specs}
                  onChange={(event) =>
                    setProductModal((current) =>
                      current
                        ? { ...current, data: { ...current.data, specs: event.target.value } }
                        : current
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                Highlights (comma separated)
                <input
                  type="text"
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                  value={productModal.data.highlights}
                  onChange={(event) =>
                    setProductModal((current) =>
                      current
                        ? { ...current, data: { ...current.data, highlights: event.target.value } }
                        : current
                    )
                  }
                />
              </label>
              <label className="block text-sm">
                Rate (optional)
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                  value={productModal.data.price}
                  onChange={(event) =>
                    setProductModal((current) =>
                      current
                        ? { ...current, data: { ...current.data, price: event.target.value } }
                        : current
                    )
                  }
                />
              </label>
            </div>
            <label className="block text-sm">
              Description
              <textarea
                className="mt-1 w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-2"
                rows={4}
                value={productModal.data.description}
                onChange={(event) =>
                  setProductModal((current) =>
                    current
                      ? { ...current, data: { ...current.data, description: event.target.value } }
                      : current
                  )
                }
                required
              />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductModal(null)}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-white/80"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProductSaving}
                className="rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-4 py-2 text-sm font-semibold text-[#121212] disabled:opacity-60"
              >
                {isProductSaving
                  ? "Saving…"
                  : productModal.mode === "add"
                    ? "Create"
                    : "Save changes"}
              </button>
            </div>
          </form>
          </div>
        )}
      </section>
      <style jsx>{`
        .glow-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(196, 214, 119, 0.35);
          background: transparent;
          box-shadow: 0 0 25px rgba(196, 214, 119, 0.12);
        }

        .glow-card::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg,
            rgba(196, 214, 119, 0.8),
            rgba(196, 214, 119, 0.1),
            transparent,
            rgba(196, 214, 119, 0.8)
          );
          opacity: 0.4;
          filter: blur(12px);
          animation: glowSweep 8s linear infinite;
          pointer-events: none;
        }

        .glow-card > * {
          position: relative;
          z-index: 1;
        }

        @keyframes glowSweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
