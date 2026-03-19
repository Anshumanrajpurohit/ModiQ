"use client"

import { memo } from "react"

import type { CatalogCategory } from "@/types/catalog"
import type { AdminOrdersResult } from "@/types/orders"

type AdminDashboardPanelProps = {
  categories: CatalogCategory[]
  isLoadingCategories: boolean
  isLoadingOrders: boolean
  ordersResult: AdminOrdersResult
  onOpenCatalog: () => void
  onOpenOrders: () => void
  onOpenTrends: () => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)

const formatDateTime = (value: string | null) => {
  if (!value) return "-"

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const ORDER_STATUS_BADGES: Record<string, string> = {
  pending: "border border-slate-200 bg-slate-50 text-slate-700",
  confirmed: "border border-sky-200 bg-sky-50 text-sky-700",
  processing: "border border-amber-200 bg-amber-50 text-amber-700",
  shipped: "border border-cyan-200 bg-cyan-50 text-cyan-700",
  delivered: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border border-red-200 bg-red-50 text-red-700",
}

const PAYMENT_STATUS_BADGES: Record<string, string> = {
  pending: "border border-amber-200 bg-amber-50 text-amber-700",
  paid: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border border-red-200 bg-red-50 text-red-700",
  refunded: "border border-purple-200 bg-purple-50 text-purple-700",
}

function AdminDashboardPanelComponent({
  categories,
  isLoadingCategories,
  isLoadingOrders,
  ordersResult,
  onOpenCatalog,
  onOpenOrders,
  onOpenTrends,
}: AdminDashboardPanelProps) {
  const latestOrders = ordersResult.orders.slice(0, 5)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="glow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Latest orders</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#3f3a34]">Recent activity</h2>
          </div>
          <button
            type="button"
            onClick={onOpenOrders}
            className="rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
          >
            Open orders
          </button>
        </div>

        {isLoadingOrders ? (
          <p className="mt-6 text-sm text-[#746f66]">Loading latest orders...</p>
        ) : latestOrders.length ? (
          <div className="mt-6 space-y-4">
            {latestOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#e1dbcf] bg-[#fffdfa] p-4 shadow-[0_10px_22px_rgba(63,58,52,0.05)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8b847a]">{order.orderNumber}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[#3f3a34]">{order.customerName}</h3>
                    <p className="text-sm text-[#6d675f]">{order.customerEmail || order.customerPhone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${ORDER_STATUS_BADGES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${PAYMENT_STATUS_BADGES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#726c63]">
                  <p>{order.itemCount} units</p>
                  <p>{formatCurrency(order.totalAmount)}</p>
                  <p>{formatDateTime(order.createdAt)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-[#d8d2c5] bg-[#fcfaf4] px-4 py-8 text-center text-sm text-[#756f66]">
            No orders have been placed yet.
          </p>
        )}
      </section>

      <section className="space-y-6">
        <article className="glow-card p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Catalog</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#3f3a34]">Products and categories</h2>
          <p className="mt-3 text-sm text-[#746f66]">
            {isLoadingCategories ? "Loading catalog..." : `${categories.length} categories ready for product management.`}
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="mt-6 rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
          >
            Open catalog manager
          </button>
        </article>

        <article className="glow-card p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">Trend campaigns</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#3f3a34]">Seasonal promotions</h2>
          <p className="mt-3 text-sm text-[#746f66]">
            Launch, edit, activate, and retire hero campaigns from the trends workspace.
          </p>
          <button
            type="button"
            onClick={onOpenTrends}
            className="mt-6 rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
          >
            Open trends
          </button>
        </article>
      </section>
    </div>
  )
}

export const AdminDashboardPanel = memo(AdminDashboardPanelComponent)
