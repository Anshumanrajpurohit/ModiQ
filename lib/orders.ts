import type { CheckoutDetails } from "@/types/checkout"
import {
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_VALUES,
  type AdminOrdersResult,
  type AdminOrdersSummary,
  type OrderItem,
  type OrderItemRow,
  type OrderRecord,
  type OrderRow,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/orders"
import type { AppUser } from "@/lib/auth"
import { queryServerDatabase, queryServerDatabaseWithClient, withServerTransaction } from "@/lib/supabase"
import { fetchActiveTrendByDiscountCode } from "@/lib/trends"

type CreateOrderItemInput = {
  productId: string
  quantity: number
}

type CreateOrderPayload = CheckoutDetails & {
  items: CreateOrderItemInput[]
  discountCode?: string | null
}

type ListOrdersParams = {
  page?: number
  pageSize?: number
  search?: string | null
  orderStatus?: string | null
  paymentStatus?: string | null
  sort?: string | null
}

type ProductSnapshotRow = {
  id: string
  name: string
  rate: string | null
  category_label: string | null
}

type SummaryRow = {
  total_orders: number | string
  active_orders: number | string
  pending_payment_orders: number | string
  total_revenue: number | string | null
}

type CountRow = {
  count: number | string
}

export class OrderValidationError extends Error {}

const ORDER_STATUS_SET = new Set<string>(ORDER_STATUS_VALUES)
const PAYMENT_STATUS_SET = new Set<string>(PAYMENT_STATUS_VALUES)

const ORDER_SORTS: Record<string, string> = {
  newest: "created_at DESC",
  oldest: "created_at ASC",
  total_desc: "total_amount DESC, created_at DESC",
  total_asc: "total_amount ASC, created_at DESC",
}

const toNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const normaliseMoney = (value: number) => Number(value.toFixed(2))

const mapOrderItemRow = (row: OrderItemRow): OrderItem => ({
  id: row.id,
  productId: row.product_id,
  productName: row.product_name,
  categoryLabel: row.category_label ?? "",
  unitPrice: toNumber(row.unit_price),
  quantity: row.quantity,
  lineTotal: toNumber(row.line_total),
})

const mapOrderRecord = (row: OrderRow, items: OrderItem[]): OrderRecord => ({
  id: row.id,
  orderNumber: row.order_number,
  customerUserId: row.customer_user_id,
  customerName: row.customer_name,
  customerEmail: row.customer_email ?? "",
  customerPhone: row.customer_phone,
  shippingAddress: row.shipping_address,
  currency: row.currency,
  subtotalAmount: toNumber(row.subtotal_amount),
  discountCode: row.discount_code ?? "",
  discountPercent: row.discount_percent ?? 0,
  discountAmount: toNumber(row.discount_amount),
  totalAmount: toNumber(row.total_amount),
  paymentStatus: row.payment_status,
  orderStatus: row.order_status,
  paidAt: row.paid_at,
  shippedAt: row.shipped_at,
  deliveredAt: row.delivered_at,
  cancelledAt: row.cancelled_at,
  statusUpdatedAt: row.status_updated_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  items,
  itemCount: items.reduce((count, item) => count + item.quantity, 0),
})

const groupOrdersWithItems = (orderRows: OrderRow[], itemRows: OrderItemRow[]) => {
  const itemsByOrderId = new Map<string, OrderItem[]>()

  for (const row of itemRows) {
    const items = itemsByOrderId.get(row.order_id) ?? []
    items.push(mapOrderItemRow(row))
    itemsByOrderId.set(row.order_id, items)
  }

  return orderRows.map((row) => mapOrderRecord(row, itemsByOrderId.get(row.id) ?? []))
}

const parseCreateOrderPayload = (value: unknown): CreateOrderPayload => {
  if (!value || typeof value !== "object") {
    throw new OrderValidationError("Invalid order payload")
  }

  const record = value as Record<string, unknown>
  const customerName = typeof record.customerName === "string" ? record.customerName.trim() : ""
  const customerEmail = typeof record.customerEmail === "string" ? record.customerEmail.trim().toLowerCase() : ""
  const contactNumber = typeof record.contactNumber === "string" ? record.contactNumber.trim() : ""
  const deliveryAddress = typeof record.deliveryAddress === "string" ? record.deliveryAddress.trim() : ""
  const discountCode = typeof record.discountCode === "string" ? record.discountCode.trim().toUpperCase() : ""
  const rawItems = Array.isArray(record.items) ? record.items : []

  if (!customerName) throw new OrderValidationError("Customer name is required")
  if (!customerEmail) throw new OrderValidationError("Customer email is required")
  if (!customerEmail.includes("@")) throw new OrderValidationError("Customer email is invalid")
  if (!contactNumber) throw new OrderValidationError("Contact number is required")
  if (!deliveryAddress) throw new OrderValidationError("Delivery address is required")
  if (!rawItems.length) throw new OrderValidationError("At least one order item is required")

  const items = rawItems.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new OrderValidationError("Invalid order item")
    }

    const item = entry as Record<string, unknown>
    const productId = typeof item.productId === "string" ? item.productId.trim() : ""
    const quantityValue = typeof item.quantity === "number" ? item.quantity : Number(item.quantity)

    if (!productId) throw new OrderValidationError("Product id is required for each item")
    if (!Number.isInteger(quantityValue) || quantityValue <= 0 || quantityValue > 999) {
      throw new OrderValidationError("Quantity must be an integer between 1 and 999")
    }

    return { productId, quantity: quantityValue }
  })

  return {
    customerName,
    customerEmail,
    contactNumber,
    deliveryAddress,
    discountCode: discountCode || null,
    items,
  }
}

const getOrderItems = async (orderIds: string[]) => {
  if (!orderIds.length) {
    return []
  }

  return queryServerDatabase<OrderItemRow>(
    `
      SELECT *
      FROM order_items
      WHERE order_id = ANY($1::uuid[])
      ORDER BY created_at ASC
    `,
    [orderIds],
  )
}

const getWhereClause = (
  params: ListOrdersParams,
  options: { customerUserId?: string | null } = {},
) => {
  const parts: string[] = []
  const values: unknown[] = []

  if (options.customerUserId) {
    values.push(options.customerUserId)
    parts.push(`customer_user_id = $${values.length}`)
  }

  const search = params.search?.trim()
  if (search) {
    values.push(`%${search}%`)
    const placeholder = `$${values.length}`
    parts.push(
      `(order_number ILIKE ${placeholder} OR customer_name ILIKE ${placeholder} OR COALESCE(customer_email, '') ILIKE ${placeholder} OR customer_phone ILIKE ${placeholder})`,
    )
  }

  if (params.orderStatus && ORDER_STATUS_SET.has(params.orderStatus)) {
    values.push(params.orderStatus)
    parts.push(`order_status = $${values.length}`)
  }

  if (params.paymentStatus && PAYMENT_STATUS_SET.has(params.paymentStatus)) {
    values.push(params.paymentStatus)
    parts.push(`payment_status = $${values.length}`)
  }

  return {
    whereClause: parts.length ? `WHERE ${parts.join(" AND ")}` : "",
    values,
  }
}

const parseOrderStatus = (value: unknown): OrderStatus | undefined => {
  return typeof value === "string" && ORDER_STATUS_SET.has(value) ? (value as OrderStatus) : undefined
}

const parsePaymentStatus = (value: unknown): PaymentStatus | undefined => {
  return typeof value === "string" && PAYMENT_STATUS_SET.has(value) ? (value as PaymentStatus) : undefined
}

const getSummaryFromRow = (row?: SummaryRow): AdminOrdersSummary => ({
  totalOrders: Number(row?.total_orders ?? 0),
  activeOrders: Number(row?.active_orders ?? 0),
  pendingPaymentOrders: Number(row?.pending_payment_orders ?? 0),
  totalRevenue: toNumber(row?.total_revenue),
})

export async function createOrder(value: unknown, user: AppUser | null): Promise<OrderRecord> {
  const payload = parseCreateOrderPayload(value)
  const uniqueProductIds = [...new Set(payload.items.map((item) => item.productId))]

  const products = await queryServerDatabase<ProductSnapshotRow>(
    `
      SELECT
        p.id,
        p.name,
        p.rate,
        c.name AS category_label
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ANY($1::uuid[])
    `,
    [uniqueProductIds],
  )

  if (products.length !== uniqueProductIds.length) {
    throw new OrderValidationError("One or more products could not be found")
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const trend = payload.discountCode ? await fetchActiveTrendByDiscountCode(payload.discountCode) : null
  const discountPercent = trend?.discountPercent ?? 0
  const discountCode = trend?.discountCode ?? null

  const lineItems = payload.items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) {
      throw new OrderValidationError(`Product ${item.productId} could not be found`)
    }

    const unitPrice = normaliseMoney(toNumber(product.rate))
    const lineTotal = normaliseMoney(unitPrice * item.quantity)

    return {
      productId: product.id,
      productName: product.name,
      categoryLabel: product.category_label ?? "",
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    }
  })

  const subtotalAmount = normaliseMoney(lineItems.reduce((sum, item) => sum + item.lineTotal, 0))
  const discountAmount = normaliseMoney(subtotalAmount * (discountPercent / 100))
  const totalAmount = normaliseMoney(Math.max(subtotalAmount - discountAmount, 0))
  const now = new Date().toISOString()

  const order = await withServerTransaction(async (client) => {
    const orderRows = await queryServerDatabaseWithClient<OrderRow>(
      client,
      `
        INSERT INTO orders (
          customer_user_id,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          currency,
          subtotal_amount,
          discount_code,
          discount_percent,
          discount_amount,
          total_amount,
          payment_status,
          order_status,
          status_updated_at,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7, $8, $9, $10, 'pending', 'pending', $11, $11, $11)
        RETURNING *
      `,
      [
        user?.clerkUserId ?? null,
        payload.customerName,
        payload.customerEmail,
        payload.contactNumber,
        payload.deliveryAddress,
        subtotalAmount,
        discountCode,
        discountPercent,
        discountAmount,
        totalAmount,
        now,
      ],
    )

    const insertedOrder = orderRows[0]

    if (!insertedOrder) {
      throw new Error("Unable to create order")
    }

    for (const item of lineItems) {
      await queryServerDatabaseWithClient(
        client,
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            category_label,
            unit_price,
            quantity,
            line_total,
            created_at
          )
          VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8)
        `,
        [
          insertedOrder.id,
          item.productId,
          item.productName,
          item.categoryLabel || null,
          item.unitPrice,
          item.quantity,
          item.lineTotal,
          now,
        ],
      )
    }

    return insertedOrder
  })

  const itemRows = await getOrderItems([order.id])
  return mapOrderRecord(order, itemRows.map(mapOrderItemRow))
}

export async function fetchOrdersForCustomer(user: AppUser): Promise<OrderRecord[]> {
  const orderRows = await queryServerDatabase<OrderRow>(
    `
      SELECT *
      FROM orders
      WHERE customer_user_id = $1
      ORDER BY created_at DESC
    `,
    [user.clerkUserId],
  )

  const itemRows = await getOrderItems(orderRows.map((row) => row.id))
  return groupOrdersWithItems(orderRows, itemRows)
}

export async function fetchAdminOrders(params: ListOrdersParams = {}): Promise<AdminOrdersResult> {
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize ?? 10) || 10))
  const offset = (page - 1) * pageSize
  const sortClause = ORDER_SORTS[params.sort ?? ""] ?? ORDER_SORTS.newest
  const { whereClause, values } = getWhereClause(params)

  const [countRows, summaryRows, orderRows] = await Promise.all([
    queryServerDatabase<CountRow>(
      `SELECT COUNT(*)::int AS count FROM orders ${whereClause}`,
      values,
    ),
    queryServerDatabase<SummaryRow>(
      `
        SELECT
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE order_status NOT IN ('delivered', 'cancelled'))::int AS active_orders,
          COUNT(*) FILTER (WHERE payment_status = 'pending')::int AS pending_payment_orders,
          COALESCE(SUM(total_amount), 0)::numeric AS total_revenue
        FROM orders
        ${whereClause}
      `,
      values,
    ),
    queryServerDatabase<OrderRow>(
      `
        SELECT *
        FROM orders
        ${whereClause}
        ORDER BY ${sortClause}
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `,
      [...values, pageSize, offset],
    ),
  ])

  const itemRows = await getOrderItems(orderRows.map((row) => row.id))

  return {
    orders: groupOrdersWithItems(orderRows, itemRows),
    summary: getSummaryFromRow(summaryRows[0]),
    total: Number(countRows[0]?.count ?? 0),
    page,
    pageSize,
  }
}

export async function fetchOrderById(orderId: string): Promise<OrderRecord | null> {
  const orderRows = await queryServerDatabase<OrderRow>(
    `
      SELECT *
      FROM orders
      WHERE id = $1
      LIMIT 1
    `,
    [orderId],
  )

  const order = orderRows[0]
  if (!order) {
    return null
  }

  const itemRows = await getOrderItems([order.id])
  return mapOrderRecord(order, itemRows.map(mapOrderItemRow))
}

export async function updateOrder(orderId: string, value: unknown): Promise<OrderRecord | null> {
  if (!value || typeof value !== "object") {
    throw new OrderValidationError("Invalid order update payload")
  }

  const payload = value as Record<string, unknown>
  const nextOrderStatus = parseOrderStatus(payload.orderStatus)
  const nextPaymentStatus = parsePaymentStatus(payload.paymentStatus)

  if (!nextOrderStatus && !nextPaymentStatus) {
    throw new OrderValidationError("At least one valid status update is required")
  }

  const currentOrder = await fetchOrderById(orderId)
  if (!currentOrder) {
    return null
  }

  if (currentOrder.orderStatus === "cancelled" && nextOrderStatus && nextOrderStatus !== "cancelled") {
    throw new OrderValidationError("Cancelled orders cannot be re-opened")
  }

  if (currentOrder.orderStatus === "delivered" && nextOrderStatus && nextOrderStatus !== "delivered") {
    throw new OrderValidationError("Delivered orders cannot be moved to a different status")
  }

  if (currentOrder.orderStatus === "delivered" && nextOrderStatus === "cancelled") {
    throw new OrderValidationError("Delivered orders cannot be cancelled")
  }

  const updateEntries = new Map<string, unknown>()
  const now = new Date().toISOString()

  if (nextOrderStatus && nextOrderStatus !== currentOrder.orderStatus) {
    updateEntries.set("order_status", nextOrderStatus)
    updateEntries.set("status_updated_at", now)

    if (nextOrderStatus === "shipped" && !currentOrder.shippedAt) {
      updateEntries.set("shipped_at", now)
    }

    if (nextOrderStatus === "delivered") {
      if (!currentOrder.shippedAt) {
        updateEntries.set("shipped_at", now)
      }
      if (!currentOrder.deliveredAt) {
        updateEntries.set("delivered_at", now)
      }
    }

    if (nextOrderStatus === "cancelled" && !currentOrder.cancelledAt) {
      updateEntries.set("cancelled_at", now)
    }
  }

  if (nextPaymentStatus && nextPaymentStatus !== currentOrder.paymentStatus) {
    updateEntries.set("payment_status", nextPaymentStatus)
    if (nextPaymentStatus === "paid" && !currentOrder.paidAt) {
      updateEntries.set("paid_at", now)
    }
  }

  if (!updateEntries.size) {
    return currentOrder
  }

  updateEntries.set("updated_at", now)

  const columns = [...updateEntries.keys()]
  const values = [...updateEntries.values()]

  const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(", ")
  const updatedRows = await queryServerDatabase<OrderRow>(
    `
      UPDATE orders
      SET ${setClause}
      WHERE id = $${columns.length + 1}
      RETURNING *
    `,
    [...values, orderId],
  )

  const updatedOrder = updatedRows[0]
  if (!updatedOrder) {
    return null
  }

  const itemRows = await getOrderItems([updatedOrder.id])
  return mapOrderRecord(updatedOrder, itemRows.map(mapOrderItemRow))
}

export async function deleteOrder(orderId: string) {
  const deletedRows = await queryServerDatabase<{ id: string }>(
    `
      DELETE FROM orders
      WHERE id = $1
      RETURNING id
    `,
    [orderId],
  )

  return Boolean(deletedRows[0]?.id)
}
