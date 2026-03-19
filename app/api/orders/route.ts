import { NextResponse, type NextRequest } from "next/server"

import { getCurrentAppUser, requireAdminApiUser } from "@/lib/auth"
import { createOrder, fetchAdminOrders, fetchOrdersForCustomer, OrderValidationError } from "@/lib/orders"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get("scope")

  try {
    if (scope === "mine") {
      const user = await getCurrentAppUser()

      if (!user) {
        return NextResponse.json({ orders: [] })
      }

      const orders = await fetchOrdersForCustomer(user)
      return NextResponse.json({ orders })
    }

    const { errorResponse } = await requireAdminApiUser()
    if (errorResponse) {
      return errorResponse
    }

    const page = Number(searchParams.get("page") ?? 1)
    const pageSize = Number(searchParams.get("pageSize") ?? 10)
    const result = await fetchAdminOrders({
      page,
      pageSize,
      search: searchParams.get("search"),
      orderStatus: searchParams.get("orderStatus"),
      paymentStatus: searchParams.get("paymentStatus"),
      sort: searchParams.get("sort"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("orders.GET", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load orders" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await getCurrentAppUser()
    const order = await createOrder(body, user)
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    console.error("orders.POST", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}
