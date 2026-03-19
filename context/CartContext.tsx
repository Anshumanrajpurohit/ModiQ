"use client"

import { useUser } from "@clerk/nextjs"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import type { CheckoutDetails } from "@/types/checkout"
import type { OrderRecord } from "@/types/orders"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  categoryLabel?: string
}

type PlaceOrderResult =
  | { success: true; order: OrderRecord; message: string }
  | { success: false; message: string }

type CartContextValue = {
  cartItems: CartItem[]
  orders: OrderRecord[]
  totalAmount: number
  discountCode: string | null
  discountPercent: number
  discountAmount: number
  discountedTotal: number
  isOrdersLoading: boolean
  addToCart: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  applyTrendDiscountCode: (code: string | null) => Promise<void>
  clearDiscount: () => void
  placeOrder: (details: CheckoutDetails) => Promise<PlaceOrderResult>
  refreshOrders: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id)
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + item.quantity,
                categoryLabel: entry.categoryLabel ?? item.categoryLabel,
              }
            : entry,
        )
      }
      return [...prev, item]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )

  const discountAmount = useMemo(() => totalAmount * (discountPercent / 100), [discountPercent, totalAmount])
  const discountedTotal = useMemo(() => totalAmount - discountAmount, [discountAmount, totalAmount])

  const clearDiscount = useCallback(() => {
    setDiscountCode(null)
    setDiscountPercent(0)
  }, [])

  const refreshOrders = useCallback(async () => {
    if (!isSignedIn) {
      setOrders((current) => current.filter((order) => !order.customerUserId))
      return
    }

    setIsOrdersLoading(true)

    try {
      const response = await fetch("/api/orders?scope=mine", { cache: "no-store" })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to load orders")
      }

      setOrders(body.orders ?? [])
    } catch (error) {
      console.error("cart.refreshOrders", error)
    } finally {
      setIsOrdersLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    void refreshOrders()
  }, [isLoaded, refreshOrders])

  const applyTrendDiscountCode = useCallback(
    async (code: string | null) => {
      const normalizedCode = code?.trim().toUpperCase() ?? ""
      if (!normalizedCode) {
        clearDiscount()
        return
      }

      if (normalizedCode === discountCode) {
        return
      }

      try {
        const response = await fetch(`/api/trends?code=${encodeURIComponent(normalizedCode)}`)
        const body = await response.json().catch(() => ({}))
        if (!response.ok || !body?.trend) {
          clearDiscount()
          return
        }

        setDiscountCode(body.trend.discountCode ?? normalizedCode)
        setDiscountPercent(body.trend.discountPercent ?? 0)
      } catch {
        clearDiscount()
      }
    },
    [clearDiscount, discountCode],
  )

  const placeOrder = useCallback(
    async (details: CheckoutDetails): Promise<PlaceOrderResult> => {
      if (!cartItems.length) {
        return { success: false, message: "Your cart is empty." }
      }

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: details.customerName,
            customerEmail: details.customerEmail,
            contactNumber: details.contactNumber,
            deliveryAddress: details.deliveryAddress,
            discountCode,
            items: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        })

        const body = await response.json().catch(() => ({}))
        if (!response.ok || !body?.order) {
          return {
            success: false,
            message: body?.error ?? "Unable to place your order right now.",
          }
        }

        const order = body.order as OrderRecord
        setOrders((current) => [order, ...current.filter((entry) => entry.id !== order.id)])
        setCartItems([])
        clearDiscount()

        return {
          success: true,
          order,
          message: `${order.orderNumber} placed successfully.`,
        }
      } catch (error) {
        console.error("cart.placeOrder", error)
        return { success: false, message: "Unable to place your order right now." }
      }
    },
    [cartItems, clearDiscount, discountCode],
  )

  const value: CartContextValue = {
    cartItems,
    orders,
    totalAmount,
    discountCode,
    discountPercent,
    discountAmount,
    discountedTotal,
    isOrdersLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyTrendDiscountCode,
    clearDiscount,
    placeOrder,
    refreshOrders,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
