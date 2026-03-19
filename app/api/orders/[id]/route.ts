import { NextResponse, type NextRequest } from "next/server"

import { deleteOrder, fetchOrderById, OrderValidationError, updateOrder } from "@/lib/orders"
import { requireAdminApiUser } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await context.params
    const order = await fetchOrderById(id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("orders.id.GET", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load order" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const order = await updateOrder(id, body)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    console.error("orders.id.PATCH", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await context.params
    const deleted = await deleteOrder(id)

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("orders.id.DELETE", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete order" },
      { status: 500 },
    )
  }
}
