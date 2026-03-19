import { NextResponse, type NextRequest } from "next/server"

import { requireAdminApiUser } from "@/lib/auth"
import {
  createTrend,
  getActiveTrends,
  fetchActiveTrendByDiscountCode,
  fetchTrends,
  TrendValidationError,
  validateTrendPayload,
} from "@/lib/trends"

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope")
    const code = searchParams.get("code")

    if (scope === "all") {
      const { errorResponse } = await requireAdminApiUser()
      if (errorResponse) {
        return errorResponse
      }

      const trends = await fetchTrends()
      return NextResponse.json({ trends }, { headers: { "Cache-Control": "no-store" } })
    }

    if (code) {
      const trend = await fetchActiveTrendByDiscountCode(code)
      return NextResponse.json({ trend }, { headers: PUBLIC_CACHE_HEADERS })
    }

    const trends = await getActiveTrends()
    return NextResponse.json({ trends, trend: trends[0] ?? null }, { headers: PUBLIC_CACHE_HEADERS })
  } catch (error) {
    console.error("trends.GET", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load trends" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const body = await request.json()
    const payload = validateTrendPayload(body)
    const trend = await createTrend(payload)
    return NextResponse.json({ trend }, { status: 201 })
  } catch (error) {
    if (error instanceof TrendValidationError) {
      return NextResponse.json({ error: error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    console.error("trends.POST", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create trend" },
      { status: 500 },
    )
  }
}
