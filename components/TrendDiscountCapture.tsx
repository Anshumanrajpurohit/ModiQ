"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useCart } from "@/context/CartContext"

export function TrendDiscountCapture() {
  const searchParams = useSearchParams()
  const { applyTrendDiscountCode } = useCart()

  useEffect(() => {
    const discount = searchParams.get("discount")
    void applyTrendDiscountCode(discount)
  }, [applyTrendDiscountCode, searchParams])

  return null
}
