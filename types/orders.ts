export const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const

export const PAYMENT_STATUS_VALUES = ["pending", "paid", "failed", "refunded"] as const

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]

export type OrderRow = {
  id: string
  order_number: string
  customer_user_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  shipping_address: string
  currency: string
  subtotal_amount: string | number
  discount_code: string | null
  discount_percent: number
  discount_amount: string | number
  total_amount: string | number
  payment_status: PaymentStatus
  order_status: OrderStatus
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  status_updated_at: string | null
  created_at: string
  updated_at: string
}

export type OrderItemRow = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  category_label: string | null
  unit_price: string | number
  quantity: number
  line_total: string | number
  created_at: string
}

export type OrderItem = {
  id: string
  productId: string | null
  productName: string
  categoryLabel: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type OrderRecord = {
  id: string
  orderNumber: string
  customerUserId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  currency: string
  subtotalAmount: number
  discountCode: string
  discountPercent: number
  discountAmount: number
  totalAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  statusUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  itemCount: number
}

export type AdminOrdersSummary = {
  totalOrders: number
  activeOrders: number
  pendingPaymentOrders: number
  totalRevenue: number
}

export type AdminOrdersResult = {
  orders: OrderRecord[]
  summary: AdminOrdersSummary
  total: number
  page: number
  pageSize: number
}
