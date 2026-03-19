import { NextResponse, type NextRequest } from "next/server"

import { requireAdminApiUser } from "@/lib/auth"
import {
  deleteTrend,
  fetchTrendById,
  setTrendActiveState,
  TrendValidationError,
  updateTrend,
  validateTrendPayload,
} from "@/lib/trends"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await context.params
    const trend = await fetchTrendById(id)

    if (!trend) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 })
    }

    return NextResponse.json({ trend })
  } catch (error) {
    console.error("trends.id.GET", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load trend" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await context.params
    const body = await request.json()

    if (
      body &&
      typeof body === "object" &&
      Object.keys(body as Record<string, unknown>).length === 1 &&
      typeof (body as Record<string, unknown>).active === "boolean"
    ) {
      const trend = await setTrendActiveState(id, Boolean((body as Record<string, unknown>).active))
      if (!trend) {
        return NextResponse.json({ error: "Trend not found" }, { status: 404 })
      }
      return NextResponse.json({ trend })
    }

    const payload = validateTrendPayload(body)
    const trend = await updateTrend(id, payload)

    if (!trend) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 })
    }

    return NextResponse.json({ trend })
  } catch (error) {
    if (error instanceof TrendValidationError) {
      return NextResponse.json({ error: error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    console.error("trends.id.PUT", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update trend" },
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
    const deleted = await deleteTrend(id)
    if (!deleted) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("trends.id.DELETE", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete trend" },
      { status: 500 },
    )
  }
}

