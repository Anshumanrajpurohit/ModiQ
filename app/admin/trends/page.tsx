"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"

type TrendCampaign = {
  id: string
  title: string
  subtitle: string
  discountCode: string
  discountPercent: number
  heroImage: string
  productIds: string[]
  targetCategory: string
  active: boolean
  createdAt: string | null
}

type AdminProduct = {
  id: string
  name: string
}

type AdminCategory = {
  id: string
  name: string
}

export default function AdminTrendsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [trends, setTrends] = useState<TrendCampaign[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingId, setIsSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/admin/trends")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
    }
  }, [router, user])

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)
      try {
        const [trendsRes, productsRes, categoriesRes] = await Promise.all([
          fetch("/api/trends?scope=all"),
          fetch("/api/catalog/products"),
          fetch("/api/catalog/categories"),
        ])

        const trendsBody = await trendsRes.json().catch(() => ({}))
        const productsBody = await productsRes.json().catch(() => ({}))
        const categoriesBody = await categoriesRes.json().catch(() => ({}))

        if (!trendsRes.ok) {
          throw new Error(trendsBody?.error ?? "Unable to load trends")
        }
        if (!productsRes.ok) {
          throw new Error(productsBody?.error ?? "Unable to load products")
        }
        if (!categoriesRes.ok) {
          throw new Error(categoriesBody?.error ?? "Unable to load categories")
        }

        if (!active) return

        setTrends(trendsBody.trends ?? [])
        setProducts(productsBody.products ?? [])
        setCategories(categoriesBody.categories ?? [])
      } catch (loadError) {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : "Failed to load trends")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const formatCreatedDate = (value: string | null) => {
    if (!value) return "-"
    return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  }

  const productNameById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product.name]))
  }, [products])

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]))
  }, [categories])

  const activeCampaign = useMemo(() => trends.find((trend) => trend.active) ?? null, [trends])
  const pastCampaigns = useMemo(() => trends.filter((trend) => !trend.active), [trends])

  const refreshTrends = async () => {
    const response = await fetch("/api/trends?scope=all")
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(body?.error ?? "Unable to refresh trends")
    }
    setTrends(body.trends ?? [])
  }

  const updateCampaignActiveState = async (trend: TrendCampaign, nextActive: boolean) => {
    setError(null)
    setIsSavingId(trend.id)
    try {
      const response = await fetch(`/api/trends/${trend.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trend.title,
          subtitle: trend.subtitle,
          discountCode: trend.discountCode,
          discountPercent: trend.discountPercent,
          heroImage: trend.heroImage,
          productIds: trend.productIds,
          targetCategory: trend.targetCategory,
          active: nextActive,
        }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to update campaign")
      }

      await refreshTrends()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update campaign")
    } finally {
      setIsSavingId(null)
    }
  }

  const handleDelete = async (trendId: string) => {
    const confirmed = window.confirm("Delete this trend campaign?")
    if (!confirmed) return

    setError(null)
    setIsSavingId(trendId)
    try {
      const response = await fetch(`/api/trends/${trendId}`, { method: "DELETE" })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to delete trend")
      }

      await refreshTrends()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete trend")
    } finally {
      setIsSavingId(null)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <section className="flex min-h-screen items-center justify-center text-sm text-[#999999]">
        Validating admin access...
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#4A4A4A]">Trend Campaigns</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-[#9B9B9B]/40 px-4 py-2 text-sm font-semibold text-[#4A4A4A]"
          >
            Admin Home
          </Link>
          <Link
            href="/admin/trends/create"
            className="rounded-full bg-[#A5B867] px-5 py-2 text-sm font-semibold text-[#4A4A4A]"
          >
            Create Campaign
          </Link>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Active Campaign</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#999999]">Loading campaigns...</p>
        ) : activeCampaign ? (
          <article className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-[#4A4A4A]">{activeCampaign.title}</p>
                <p className="text-sm text-[#666666]">{activeCampaign.subtitle}</p>
              </div>
              <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Active
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#4A4A4A]">
              <p>
                <span className="font-semibold">Discount:</span> {activeCampaign.discountCode} ({activeCampaign.discountPercent}%)
              </p>
              <p>
                <span className="font-semibold">Products:</span>{" "}
                {activeCampaign.productIds.map((id) => productNameById.get(id) ?? id).join(", ")}
              </p>
              <p>
                <span className="font-semibold">Target Category:</span>{" "}
                {categoryNameById.get(activeCampaign.targetCategory) ?? activeCampaign.targetCategory}
              </p>
              <p>
                <span className="font-semibold">Created:</span> {formatCreatedDate(activeCampaign.createdAt)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => updateCampaignActiveState(activeCampaign, false)}
                disabled={isSavingId === activeCampaign.id}
                className="rounded-full border border-[#9B9B9B]/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] disabled:opacity-60"
              >
                Deactivate
              </button>
              <Link
                href={`/admin/trends/${activeCampaign.id}/edit`}
                className="rounded-full border border-[#9B9B9B]/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#4A4A4A]"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(activeCampaign.id)}
                disabled={isSavingId === activeCampaign.id}
                className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </article>
        ) : (
          <p className="mt-4 text-sm text-[#999999]">No active campaign currently running.</p>
        )}
      </section>

      <section className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Past Campaigns</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#999999]">Loading campaign history...</p>
        ) : pastCampaigns.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-xs uppercase tracking-[0.2em] text-[#777777]">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Discount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastCampaigns.map((trend) => (
                  <tr key={trend.id} className="border-b border-[#F0F0F0] align-top">
                    <td className="px-3 py-3 font-medium text-[#4A4A4A]">{trend.title}</td>
                    <td className="px-3 py-3 text-[#666666]">{trend.discountCode}</td>
                    <td className="px-3 py-3 text-[#666666]">{trend.discountPercent}%</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-[#CFCFCF] bg-[#F8F8F8] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
                        Inactive
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#666666]">{formatCreatedDate(trend.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/trends/${trend.id}/edit`}
                          className="rounded-full border border-[#9B9B9B]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4A4A4A]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(trend.id)}
                          disabled={isSavingId === trend.id}
                          className="rounded-full border border-red-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCampaignActiveState(trend, true)}
                          disabled={isSavingId === trend.id}
                          className="rounded-full border border-emerald-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 disabled:opacity-60"
                        >
                          Activate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#999999]">No past campaigns found.</p>
        )}
      </section>

      <section className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">All Campaigns (Quick Scan)</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#999999]">Loading campaigns...</p>
        ) : trends.length ? (
          <div className="mt-4 grid gap-4">
            {trends.map((trend) => (
              <article
                key={trend.id}
                className={`rounded-2xl border p-4 ${trend.active ? "border-emerald-300 bg-emerald-50/30" : "border-[#9B9B9B]/30 bg-white"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#4A4A4A]">{trend.title}</p>
                    <p className="text-sm text-[#666666]">{trend.subtitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#666666]">
                      {trend.discountCode} • {trend.discountPercent}% OFF
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      trend.active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-[#CFCFCF] bg-[#F8F8F8] text-[#777777]"
                    }`}
                  >
                    {trend.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#999999]">No trend campaigns created yet.</p>
        )}
      </section>
    </div>
  )
}

