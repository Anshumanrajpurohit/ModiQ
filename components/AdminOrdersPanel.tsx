"use client"

import type { AdminOrdersResult, OrderRecord } from "@/types/orders"

type AdminOrdersPanelProps = {
  orderSearchInput: string
  orderStatusFilter: string
  paymentStatusFilter: string
  orderSort: string
  ordersResult: AdminOrdersResult
  isLoadingOrders: boolean
  orderActionId: string | null
  selectedOrder: OrderRecord | null
  onOrderSearchInputChange: (value: string) => void
  onOrderStatusChange: (value: string) => void
  onPaymentStatusChange: (value: string) => void
  onOrderSortChange: (value: string) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onViewOrder: (order: OrderRecord) => void
  onCloseOrder: () => void
  onRefresh: () => void
  onMarkPaid: (order: OrderRecord) => void
  onShip: (order: OrderRecord) => void
  onDeliver: (order: OrderRecord) => void
  onCancel: (order: OrderRecord) => void
  onDelete: (order: OrderRecord) => void
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

const actionButtonClass =
  "rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50"

export function AdminOrdersPanel({
  orderSearchInput,
  orderStatusFilter,
  paymentStatusFilter,
  orderSort,
  ordersResult,
  isLoadingOrders,
  orderActionId,
  selectedOrder,
  onOrderSearchInputChange,
  onOrderStatusChange,
  onPaymentStatusChange,
  onOrderSortChange,
  onPreviousPage,
  onNextPage,
  onViewOrder,
  onCloseOrder,
  onRefresh,
  onMarkPaid,
  onShip,
  onDeliver,
  onCancel,
  onDelete,
}: AdminOrdersPanelProps) {
  const hasNextPage = ordersResult.page * ordersResult.pageSize < ordersResult.total

  return (
    <>
      <section className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
          >
            Refresh orders
          </button>
        </div>

        <div className="glow-card p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm text-[#5f5951]">
              Search
              <input
                type="text"
                value={orderSearchInput}
                onChange={(event) => onOrderSearchInputChange(event.target.value)}
                placeholder="Order, customer, email, phone"
                className="mt-2 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] placeholder:text-[#9f988d] outline-none transition focus:border-[#a5b867]"
              />
            </label>

            <label className="text-sm text-[#5f5951]">
              Order status
              <select
                value={orderStatusFilter}
                onChange={(event) => onOrderStatusChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] outline-none transition focus:border-[#a5b867]"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label className="text-sm text-[#5f5951]">
              Payment status
              <select
                value={paymentStatusFilter}
                onChange={(event) => onPaymentStatusChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] outline-none transition focus:border-[#a5b867]"
              >
                <option value="all">All payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>

            <label className="text-sm text-[#5f5951]">
              Sort
              <select
                value={orderSort}
                onChange={(event) => onOrderSortChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9d4c8] bg-[#f8f5ec] px-4 py-2 text-[#3f3a34] outline-none transition focus:border-[#a5b867]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="total_desc">Highest total</option>
                <option value="total_asc">Lowest total</option>
              </select>
            </label>
          </div>
        </div>

        <div className="glow-card overflow-hidden">
          {isLoadingOrders ? (
            <p className="px-6 py-10 text-center text-sm text-[#746f66]">Loading orders...</p>
          ) : ordersResult.orders.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[#e6e0d5] bg-[#f6f2e9] text-xs uppercase tracking-[0.2em] text-[#8b847a]">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersResult.orders.map((order) => {
                      const isBusy = orderActionId === order.id
                      const canMarkPaid = order.paymentStatus !== "paid"
                      const canShip = !["shipped", "delivered", "cancelled"].includes(order.orderStatus)
                      const canDeliver = !["delivered", "cancelled"].includes(order.orderStatus)
                      const canCancel = !["cancelled", "delivered"].includes(order.orderStatus)

                      return (
                        <tr key={order.id} className="border-b border-[#ebe5d8] align-top">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-[#3f3a34]">{order.orderNumber}</p>
                            <p className="mt-1 text-xs text-[#918a80]">{order.id}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-[#3f3a34]">{order.customerName}</p>
                            <p className="mt-1 text-xs text-[#6e685f]">{order.customerEmail || "No email provided"}</p>
                            <p className="mt-1 text-xs text-[#6e685f]">{order.customerPhone}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-[#5c564f]">{order.itemCount} units</p>
                            <p className="mt-1 text-xs text-[#918a80]">{order.items.map((item) => item.productName).join(", ")}</p>
                          </td>
                          <td className="px-4 py-4 font-semibold text-[#3f3a34]">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${PAYMENT_STATUS_BADGES[order.paymentStatus]}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${ORDER_STATUS_BADGES[order.orderStatus]}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#756f66]">{formatDateTime(order.createdAt)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => onViewOrder(order)}
                                disabled={isBusy}
                                className={`${actionButtonClass} border-[#d7d1c4] bg-[#fbf8f1] text-[#5f5951] hover:border-[#a5b867] hover:text-[#3f3a34]`}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => onMarkPaid(order)}
                                disabled={isBusy || !canMarkPaid}
                                className={`${actionButtonClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300`}
                              >
                                Mark paid
                              </button>
                              <button
                                type="button"
                                onClick={() => onShip(order)}
                                disabled={isBusy || !canShip}
                                className={`${actionButtonClass} border-[#d7d1c4] bg-[#fbf8f1] text-[#5f5951] hover:border-[#a5b867] hover:text-[#3f3a34]`}
                              >
                                Ship
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeliver(order)}
                                disabled={isBusy || !canDeliver}
                                className={`${actionButtonClass} border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300`}
                              >
                                Deliver
                              </button>
                              <button
                                type="button"
                                onClick={() => onCancel(order)}
                                disabled={isBusy || !canCancel}
                                className={`${actionButtonClass} border-red-200 bg-red-50 text-red-700 hover:border-red-300`}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(order)}
                                disabled={isBusy}
                                className={`${actionButtonClass} border-red-200 bg-red-50 text-red-700 hover:border-red-300`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e0d5] px-4 py-4 text-sm text-[#746f66]">
                <p>
                  Showing {(ordersResult.page - 1) * ordersResult.pageSize + 1}
                  {" - "}
                  {Math.min(ordersResult.page * ordersResult.pageSize, ordersResult.total)} of {ordersResult.total}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onPreviousPage}
                    disabled={ordersResult.page === 1}
                    className="rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>Page {ordersResult.page}</span>
                  <button
                    type="button"
                    onClick={onNextPage}
                    disabled={!hasNextPage}
                    className="rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-[#746f66]">No orders match the current filters.</p>
          )}
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3f3a34]/30 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#ddd7ca] bg-[#fffdf8] p-6 text-[#3f3a34] shadow-[0_28px_60px_rgba(63,58,52,0.16)]">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#94a455]">{selectedOrder.orderNumber}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#3f3a34]">{selectedOrder.customerName}</h2>
                <p className="mt-1 text-sm text-[#746f66]">{selectedOrder.customerEmail || "No email provided"}</p>
                <p className="text-sm text-[#746f66]">{selectedOrder.customerPhone}</p>
              </div>
              <button
                type="button"
                onClick={onCloseOrder}
                className="rounded-full border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-sm text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
              >
                Close
              </button>
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#e3ddd1] bg-[#f7f3ea] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a455]">Shipping</p>
                <p className="mt-3 text-sm text-[#5f5951]">{selectedOrder.shippingAddress}</p>
              </div>
              <div className="rounded-2xl border border-[#e3ddd1] bg-[#f7f3ea] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94a455]">Order summary</p>
                <div className="mt-3 space-y-2 text-sm text-[#655f57]">
                  <p>Subtotal: {formatCurrency(selectedOrder.subtotalAmount)}</p>
                  <p>
                    Discount: {selectedOrder.discountCode ? `${selectedOrder.discountCode} (${selectedOrder.discountPercent}%)` : "None"}
                  </p>
                  <p>Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p>Created: {formatDateTime(selectedOrder.createdAt)}</p>
                  <p>Status updated: {formatDateTime(selectedOrder.statusUpdatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${ORDER_STATUS_BADGES[selectedOrder.orderStatus]}`}>
                {selectedOrder.orderStatus}
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${PAYMENT_STATUS_BADGES[selectedOrder.paymentStatus]}`}>
                {selectedOrder.paymentStatus}
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f6f2e9] text-xs uppercase tracking-[0.2em] text-[#8b847a]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-t border-[#ebe5d8]">
                      <td className="px-4 py-3 text-[#3f3a34]">{item.productName}</td>
                      <td className="px-4 py-3 text-[#746f66]">{item.categoryLabel || "-"}</td>
                      <td className="px-4 py-3 text-[#746f66]">{item.quantity}</td>
                      <td className="px-4 py-3 text-[#746f66]">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-[#5c564f]">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
