"use client"

import dynamic from "next/dynamic"
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { CatalogCategory, CatalogProduct } from "@/types/catalog"
import type { AdminOrdersResult, OrderRecord } from "@/types/orders"

type AdminPanel = "dashboard" | "orders" | "products"

type CategoryFormData = Omit<CatalogCategory, "id" | "createdAt">

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
  | { mode: "add"; data: CategoryFormData }
  | { mode: "edit"; categoryId: string; data: CategoryFormData }

type ProductModalState =
  | null
  | { mode: "add"; categoryId: string; data: ProductFormData }
  | { mode: "edit"; categoryId: string; productId: string; data: ProductFormData }

type DeleteTargetState =
  | null
  | { type: "category"; id: string; label: string }
  | { type: "product"; id: string; categoryId: string; label: string }

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

const emptyOrdersResult: AdminOrdersResult = {
  orders: [],
  summary: {
    totalOrders: 0,
    activeOrders: 0,
    pendingPaymentOrders: 0,
    totalRevenue: 0,
  },
  total: 0,
  page: 1,
  pageSize: 10,
}

const parseList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

const convertFileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsDataURL(file)
  })

const getPanelFromSearch = (searchParams: ReturnType<typeof useSearchParams>): AdminPanel => {
  const panel = searchParams?.get("panel")
  if (panel === "orders") return "orders"
  if (panel === "products") return "products"
  return "dashboard"
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)

const AdminPanelLoading = () => <div className="glow-card px-5 py-10 text-sm text-[#746f66]">Loading panel...</div>

const AdminDashboardPanel = dynamic(
  () => import("@/components/AdminDashboardPanel").then((module) => module.AdminDashboardPanel),
  { loading: AdminPanelLoading, ssr: false },
)

const AdminOrdersPanel = dynamic(
  () => import("@/components/AdminOrdersPanel").then((module) => module.AdminOrdersPanel),
  { loading: AdminPanelLoading, ssr: false },
)

const AdminCatalogPanel = dynamic(
  () => import("@/components/AdminCatalogPanel").then((module) => module.AdminCatalogPanel),
  { loading: AdminPanelLoading, ssr: false },
)

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activePanel = useMemo(() => getPanelFromSearch(searchParams), [searchParams])

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(searchParams?.get("category"))
  const [categoryList, setCategoryList] = useState<CatalogCategory[]>([])
  const [productMap, setProductMap] = useState<Record<string, CatalogProduct[]>>({})
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null)
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(null)
  const [productModal, setProductModal] = useState<ProductModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetState>(null)
  const [isCategorySaving, setIsCategorySaving] = useState(false)
  const [isProductSaving, setIsProductSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [orderSearchInput, setOrderSearchInput] = useState("")
  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [orderSort, setOrderSort] = useState("newest")
  const [orderPage, setOrderPage] = useState(1)
  const [ordersResult, setOrdersResult] = useState<AdminOrdersResult>(emptyOrdersResult)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orderActionId, setOrderActionId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)

  const selectedCategory = useMemo(
    () => categoryList.find((category) => category.id === selectedCategoryId) ?? null,
    [categoryList, selectedCategoryId],
  )
  const visibleProducts = useMemo(
    () => (selectedCategoryId ? productMap[selectedCategoryId] ?? [] : []),
    [productMap, selectedCategoryId],
  )

  const setAdminQuery = useCallback(
    (panel: AdminPanel, extraParams?: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString())
      if (panel === "dashboard") params.delete("panel")
      else params.set("panel", panel)

      if (extraParams) {
        for (const [key, value] of Object.entries(extraParams)) {
          if (!value) params.delete(key)
          else params.set(key, value)
        }
      }

      const query = params.toString()
      router.replace(query ? `/admin?${query}` : "/admin")
    },
    [router, searchParams],
  )

  const handleApiError = useCallback((error: unknown, fallback: string) => {
    console.error("admin", error)
    setErrorMessage(error instanceof Error ? error.message : fallback)
  }, [])

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch("/api/catalog/categories", { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? "Unable to load categories")
      setCategoryList(payload.categories ?? [])
    } catch (error) {
      handleApiError(error, "Unable to load categories")
    } finally {
      setIsLoadingCategories(false)
    }
  }, [handleApiError])

  const fetchProductsForCategory = useCallback(
    async (categoryId: string, force = false) => {
      if (!force && productMap[categoryId]) return
      setLoadingCategoryId(categoryId)
      try {
        const response = await fetch(`/api/catalog/products?category=${categoryId}`, { cache: "no-store" })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload?.error ?? "Unable to load products")
        setProductMap((current) => ({ ...current, [categoryId]: payload.products ?? [] }))
      } catch (error) {
        handleApiError(error, "Unable to load products")
      } finally {
        setLoadingCategoryId((current) => (current === categoryId ? null : current))
      }
    },
    [handleApiError, productMap],
  )

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true)
    try {
      const params = new URLSearchParams({
        scope: "admin",
        page: String(orderPage),
        pageSize: "10",
        sort: orderSort,
      })
      if (orderSearch) params.set("search", orderSearch)
      if (orderStatusFilter !== "all") params.set("orderStatus", orderStatusFilter)
      if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter)
      const response = await fetch(`/api/orders?${params.toString()}`, { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? "Unable to load orders")
      setOrdersResult({
        orders: payload.orders ?? [],
        summary: payload.summary ?? emptyOrdersResult.summary,
        total: payload.total ?? 0,
        page: payload.page ?? 1,
        pageSize: payload.pageSize ?? 10,
      })
    } catch (error) {
      handleApiError(error, "Unable to load orders")
    } finally {
      setIsLoadingOrders(false)
    }
  }, [handleApiError, orderPage, orderSearch, orderSort, orderStatusFilter, paymentStatusFilter])

  useEffect(() => {
    setSelectedCategoryId(searchParams?.get("category"))
  }, [searchParams])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrderSearch(orderSearchInput.trim())
      setOrderPage(1)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [orderSearchInput])

  useEffect(() => {
    if (!errorMessage) return
    const timer = window.setTimeout(() => setErrorMessage(null), 4500)
    return () => window.clearTimeout(timer)
  }, [errorMessage])

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  useEffect(() => {
    if (activePanel === "orders" || activePanel === "dashboard") {
      void fetchOrders()
    }
  }, [activePanel, fetchOrders])

  useEffect(() => {
    if (activePanel === "products" && selectedCategoryId) {
      void fetchProductsForCategory(selectedCategoryId)
    }
  }, [activePanel, fetchProductsForCategory, selectedCategoryId])

  const mutateOrder = async (order: OrderRecord, request: { method?: "PATCH" | "DELETE"; body?: Record<string, unknown>; successMessage: string }) => {
    setOrderActionId(order.id)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: request.method ?? "PATCH",
        headers: request.body ? { "Content-Type": "application/json" } : undefined,
        body: request.body ? JSON.stringify(request.body) : undefined,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? "Unable to update order")
      setActionMessage(request.successMessage)
      if (request.method === "DELETE") setSelectedOrder((current) => (current?.id === order.id ? null : current))
      if (payload.order) setSelectedOrder((current) => (current?.id === order.id ? (payload.order as OrderRecord) : current))
      await fetchOrders()
    } catch (error) {
      handleApiError(error, "Unable to update order")
    } finally {
      setOrderActionId(null)
    }
  }

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!categoryModal) return

    const endpoint =
      categoryModal.mode === "add"
        ? "/api/catalog/categories"
        : `/api/catalog/categories/${categoryModal.categoryId}`

    setIsCategorySaving(true)

    try {
      const response = await fetch(endpoint, {
        method: categoryModal.mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryModal.data),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? "Unable to save category")
      const category = payload.category as CatalogCategory
      setCategoryList((current) =>
        categoryModal.mode === "add"
          ? [...current, category]
          : current.map((entry) => (entry.id === category.id ? category : entry)),
      )
      setCategoryModal(null)
      setActionMessage(categoryModal.mode === "add" ? "Category created." : "Category updated.")
      if (categoryModal.mode === "add") {
        setAdminQuery("products", { category: category.id })
      }
    } catch (error) {
      handleApiError(error, "Unable to save category")
    } finally {
      setIsCategorySaving(false)
    }
  }

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!productModal) return

    const payload = {
      categoryId: productModal.categoryId,
      name: productModal.data.name.trim(),
      description: productModal.data.description.trim(),
      image: productModal.data.image.trim(),
      price: productModal.data.price.trim() ? Number(productModal.data.price.trim()) : null,
      specs: parseList(productModal.data.specs),
      highlights: parseList(productModal.data.highlights),
    }

    const endpoint =
      productModal.mode === "add" ? "/api/catalog/products" : `/api/catalog/products/${productModal.productId}`

    setIsProductSaving(true)

    try {
      const response = await fetch(endpoint, {
        method: productModal.mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body?.error ?? "Unable to save product")
      const product = body.product as CatalogProduct
      setProductMap((current) => {
        const existing = current[payload.categoryId] ?? []
        return {
          ...current,
          [payload.categoryId]:
            productModal.mode === "add"
              ? [product, ...existing]
              : existing.map((entry) => (entry.id === product.id ? product : entry)),
        }
      })
      setProductModal(null)
      setActionMessage(productModal.mode === "add" ? "Product created." : "Product updated.")
    } catch (error) {
      handleApiError(error, "Unable to save product")
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
      const image = await convertFileToDataUrl(file)
      setCategoryModal((current) => (current ? { ...current, data: { ...current.data, image } } : current))
    } catch (error) {
      handleApiError(error, "Unable to read image")
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
      const image = await convertFileToDataUrl(file)
      setProductModal((current) => (current ? { ...current, data: { ...current.data, image } } : current))
    } catch (error) {
      handleApiError(error, "Unable to read image")
    } finally {
      event.target.value = ""
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    const endpoint =
      deleteTarget.type === "category"
        ? `/api/catalog/categories/${deleteTarget.id}`
        : `/api/catalog/products/${deleteTarget.id}`

    try {
      const response = await fetch(endpoint, { method: "DELETE" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? "Unable to delete item")

      if (deleteTarget.type === "category") {
        setCategoryList((current) => current.filter((entry) => entry.id !== deleteTarget.id))
        setProductMap((current) => {
          const next = { ...current }
          delete next[deleteTarget.id]
          return next
        })
        if (selectedCategoryId === deleteTarget.id) {
          setAdminQuery("products", { category: null })
        }
        setActionMessage("Category deleted.")
      } else {
        setProductMap((current) => ({
          ...current,
          [deleteTarget.categoryId]: (current[deleteTarget.categoryId] ?? []).filter((entry) => entry.id !== deleteTarget.id),
        }))
        setActionMessage("Product deleted.")
      }

      setDeleteTarget(null)
    } catch (error) {
      handleApiError(error, "Unable to delete item")
    }
  }

  return (
    <>
      <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#fbf9f2_0%,_#f3efe5_46%,_#ece7dc_100%)] px-4 py-12 text-[#3f3a34]">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#94a455]">Admin Control</p>
              <h1 className="text-3xl font-semibold text-[#3f3a34]">
                {activePanel === "dashboard" && "Admin Overview"}
                {activePanel === "orders" && "Order Management Desk"}
                {activePanel === "products" && (selectedCategory ? `${selectedCategory.name} Inventory` : "Catalog Management")}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {activePanel === "dashboard" && (
                <button
                  type="button"
                  onClick={() => router.push("/admin/trends")}
                  className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_30px_rgba(148,164,85,0.24)] transition hover:bg-[#96a65b]"
                >
                  Manage trends
                </button>
              )}
            </div>
          </header>

          {(errorMessage || actionMessage) && (
            <div className="space-y-3">
              {errorMessage && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-[0_10px_24px_rgba(127,29,29,0.08)]">
                  {errorMessage}
                </p>
              )}
              {actionMessage && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-[0_10px_24px_rgba(6,95,70,0.08)]">
                  {actionMessage}
                </p>
              )}
            </div>
          )}

          {(activePanel === "dashboard" || activePanel === "orders") && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="glow-card px-5 py-4"><p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Total orders</p><p className="mt-2 text-3xl font-semibold text-[#3f3a34]">{ordersResult.summary.totalOrders}</p></div>
              <div className="glow-card px-5 py-4"><p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Active orders</p><p className="mt-2 text-3xl font-semibold text-[#3f3a34]">{ordersResult.summary.activeOrders}</p></div>
              <div className="glow-card px-5 py-4"><p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Pending payments</p><p className="mt-2 text-3xl font-semibold text-[#3f3a34]">{ordersResult.summary.pendingPaymentOrders}</p></div>
              <div className="glow-card px-5 py-4"><p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Revenue tracked</p><p className="mt-2 text-3xl font-semibold text-[#3f3a34]">{formatCurrency(ordersResult.summary.totalRevenue)}</p></div>
            </div>
          )}

          {activePanel === "dashboard" && (
            <AdminDashboardPanel
              categories={categoryList}
              isLoadingCategories={isLoadingCategories}
              isLoadingOrders={isLoadingOrders}
              ordersResult={ordersResult}
              onOpenCatalog={() => setAdminQuery("products")}
              onOpenOrders={() => setAdminQuery("orders")}
              onOpenTrends={() => router.push("/admin/trends")}
            />
          )}

          {activePanel === "orders" && (
            <AdminOrdersPanel
              orderSearchInput={orderSearchInput}
              orderStatusFilter={orderStatusFilter}
              paymentStatusFilter={paymentStatusFilter}
              orderSort={orderSort}
              ordersResult={ordersResult}
              isLoadingOrders={isLoadingOrders}
              orderActionId={orderActionId}
              selectedOrder={selectedOrder}
              onOrderSearchInputChange={setOrderSearchInput}
              onOrderStatusChange={(value) => {
                setOrderStatusFilter(value)
                setOrderPage(1)
              }}
              onPaymentStatusChange={(value) => {
                setPaymentStatusFilter(value)
                setOrderPage(1)
              }}
              onOrderSortChange={(value) => {
                setOrderSort(value)
                setOrderPage(1)
              }}
              onPreviousPage={() => setOrderPage((current) => Math.max(1, current - 1))}
              onNextPage={() => setOrderPage((current) => current + 1)}
              onViewOrder={setSelectedOrder}
              onCloseOrder={() => setSelectedOrder(null)}
              onRefresh={() => void fetchOrders()}
              onMarkPaid={(order) => void mutateOrder(order, { body: { paymentStatus: "paid" }, successMessage: `${order.orderNumber} marked as paid.` })}
              onShip={(order) => void mutateOrder(order, { body: { orderStatus: "shipped" }, successMessage: `${order.orderNumber} marked as shipped.` })}
              onDeliver={(order) => void mutateOrder(order, { body: { orderStatus: "delivered" }, successMessage: `${order.orderNumber} marked as delivered.` })}
              onCancel={(order) => {
                if (!window.confirm(`Cancel ${order.orderNumber}?`)) return
                void mutateOrder(order, { body: { orderStatus: "cancelled" }, successMessage: `${order.orderNumber} cancelled.` })
              }}
              onDelete={(order) => {
                if (!window.confirm(`Delete ${order.orderNumber}? This cannot be undone.`)) return
                void mutateOrder(order, { method: "DELETE", successMessage: `${order.orderNumber} deleted.` })
              }}
            />
          )}

          {activePanel === "products" && (
            <AdminCatalogPanel
              categories={categoryList}
              isLoadingCategories={isLoadingCategories}
              selectedCategory={selectedCategory}
              selectedCategoryId={selectedCategoryId}
              products={visibleProducts}
              loadingCategoryId={loadingCategoryId}
              onOpenCategory={(categoryId) => setAdminQuery("products", { category: categoryId })}
              onEditCategory={(categoryId) => {
                const category = categoryList.find((entry) => entry.id === categoryId)
                if (!category) return
                setCategoryModal({ mode: "edit", categoryId, data: { name: category.name, heroLine: category.heroLine, description: category.description, image: category.image } })
              }}
              onDeleteCategory={(categoryId, categoryName) => setDeleteTarget({ type: "category", id: categoryId, label: categoryName })}
              onBackToCategories={() => setAdminQuery("products", { category: null })}
              onAddCategory={() => setCategoryModal({ mode: "add", data: { ...emptyCategoryForm } })}
              onAddProduct={(categoryId) => setProductModal({ mode: "add", categoryId, data: { ...emptyProductForm } })}
              onEditProduct={(categoryId, productId) => {
                const product = productMap[categoryId]?.find((entry) => entry.id === productId)
                if (!product) return
                setProductModal({ mode: "edit", categoryId, productId, data: { name: product.name, description: product.description, image: product.image, price: product.price !== null ? String(product.price) : "", specs: product.specs.join(", "), highlights: product.highlights.join(", ") } })
              }}
              onDeleteProduct={(categoryId, productId, productName) => setDeleteTarget({ type: "product", id: productId, categoryId, label: productName })}
            />
          )}
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f3a34]/30 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-[#ddd7ca] bg-[#fffdf8] p-6 text-center text-[#3f3a34] shadow-[0_28px_60px_rgba(63,58,52,0.16)]">
              <p className="text-sm uppercase tracking-[0.4em] text-[#94a455]">Confirm delete</p>
              <p className="mt-4 text-base font-medium text-[#3f3a34]">Are you sure you want to delete this?</p>
              <div className="mt-6 flex justify-center gap-3">
                <button type="button" onClick={handleDeleteConfirm} className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b]">Confirm</button>
                <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-[#d4cfc3] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {categoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f3a34]/30 px-4 backdrop-blur-sm">
            <form
              className="w-full max-w-lg space-y-4 rounded-3xl border border-[#ddd7ca] bg-[#fffdf8] p-6 text-[#3f3a34] shadow-[0_28px_60px_rgba(63,58,52,0.16)]"
              onSubmit={handleCategorySubmit}
            >
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Category</p>
                  <h2 className="text-2xl font-semibold text-[#3f3a34]">{categoryModal.mode === "add" ? "Add new category" : "Edit category"}</h2>
                </div>
                <button type="button" onClick={() => setCategoryModal(null)} className="text-[#7a746b] transition hover:text-[#3f3a34]">X</button>
              </header>
              <label className="block text-sm text-[#5f5951]">
                Name
                <input type="text" required className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={categoryModal.data.name} onChange={(event) => setCategoryModal((current) => current ? { ...current, data: { ...current.data, name: event.target.value } } : current)} />
              </label>
              <label className="block text-sm text-[#5f5951]">
                Hero line
                <input type="text" required className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={categoryModal.data.heroLine} onChange={(event) => setCategoryModal((current) => current ? { ...current, data: { ...current.data, heroLine: event.target.value } } : current)} />
              </label>
              <label className="block text-sm text-[#5f5951]">
                Description
                <textarea rows={3} required className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={categoryModal.data.description} onChange={(event) => setCategoryModal((current) => current ? { ...current, data: { ...current.data, description: event.target.value } } : current)} />
              </label>
              <label className="block text-sm text-[#5f5951]">
                Image
                <input type="file" accept="image/*" className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-sm text-[#5f5951]" onChange={handleCategoryImageSelect} required={!categoryModal.data.image} />
                {categoryModal.data.image && (
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#e3ddd1] bg-[#f4f0e6] px-3 py-2 text-xs text-[#6c665e]">
                    <span className="truncate">{categoryModal.data.image}</span>
                    <button type="button" onClick={() => setCategoryModal((current) => current ? { ...current, data: { ...current.data, image: "" } } : current)} className="rounded-full border border-[#cbc5b8] px-2 py-1 text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]">X</button>
                  </div>
                )}
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCategoryModal(null)} className="rounded-2xl border border-[#d4cfc3] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]">Cancel</button>
                <button type="submit" disabled={isCategorySaving} className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b] disabled:opacity-60">{isCategorySaving ? "Saving..." : categoryModal.mode === "add" ? "Create" : "Save changes"}</button>
              </div>
            </form>
          </div>
        )}

        {productModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f3a34]/30 px-4 backdrop-blur-sm">
            <form
              className="w-full max-w-2xl space-y-4 rounded-3xl border border-[#ddd7ca] bg-[#fffdf8] p-6 text-[#3f3a34] shadow-[0_28px_60px_rgba(63,58,52,0.16)]"
              onSubmit={handleProductSubmit}
            >
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Product</p>
                  <h2 className="text-2xl font-semibold text-[#3f3a34]">{productModal.mode === "add" ? "Add new product" : "Edit product"}</h2>
                </div>
                <button type="button" onClick={() => setProductModal(null)} className="text-[#7a746b] transition hover:text-[#3f3a34]">X</button>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-[#5f5951]">
                  Product name
                  <input type="text" required className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={productModal.data.name} onChange={(event) => setProductModal((current) => current ? { ...current, data: { ...current.data, name: event.target.value } } : current)} />
                </label>
                <label className="block text-sm text-[#5f5951]">
                  Image
                  <input type="file" accept="image/*" className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-sm text-[#5f5951]" onChange={handleProductImageSelect} required={!productModal.data.image} />
                  {productModal.data.image && (
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#e3ddd1] bg-[#f4f0e6] px-3 py-2 text-xs text-[#6c665e]">
                      <span className="truncate">{productModal.data.image}</span>
                      <button type="button" onClick={() => setProductModal((current) => current ? { ...current, data: { ...current.data, image: "" } } : current)} className="rounded-full border border-[#cbc5b8] px-2 py-1 text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]">X</button>
                    </div>
                  )}
                </label>
                <label className="block text-sm text-[#5f5951]">
                  Specs (comma separated)
                  <input type="text" className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={productModal.data.specs} onChange={(event) => setProductModal((current) => current ? { ...current, data: { ...current.data, specs: event.target.value } } : current)} />
                </label>
                <label className="block text-sm text-[#5f5951]">
                  Highlights (comma separated)
                  <input type="text" className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={productModal.data.highlights} onChange={(event) => setProductModal((current) => current ? { ...current, data: { ...current.data, highlights: event.target.value } } : current)} />
                </label>
                <label className="block text-sm text-[#5f5951]">
                  Rate (optional)
                  <input type="number" min={0} step={1} className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={productModal.data.price} onChange={(event) => setProductModal((current) => current ? { ...current, data: { ...current.data, price: event.target.value } } : current)} />
                </label>
              </div>
              <label className="block text-sm text-[#5f5951]">
                Description
                <textarea rows={4} required className="mt-1 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] shadow-inner outline-none transition focus:border-[#a5b867]" value={productModal.data.description} onChange={(event) => setProductModal((current) => current ? { ...current, data: { ...current.data, description: event.target.value } } : current)} />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setProductModal(null)} className="rounded-2xl border border-[#d4cfc3] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]">Cancel</button>
                <button type="submit" disabled={isProductSaving} className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b] disabled:opacity-60">{isProductSaving ? "Saving..." : productModal.mode === "add" ? "Create" : "Save changes"}</button>
              </div>
            </form>
          </div>
        )}
      </section>
      <style jsx global>{`
        .glow-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(216, 210, 197, 0.95);
          background: rgba(255, 252, 246, 0.92);
          box-shadow:
            0 18px 38px rgba(63, 58, 52, 0.08),
            0 2px 0 rgba(255, 255, 255, 0.75) inset;
        }

        .glow-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(245, 241, 233, 0));
          pointer-events: none;
        }

        .glow-card > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  )
}

