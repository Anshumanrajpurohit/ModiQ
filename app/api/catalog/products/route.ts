import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/auth"
import { fetchProducts, fetchProductsByCategory } from "@/lib/catalog"
import { mapProductRow } from "@/lib/catalog-utils"
import { createServerDatabaseClient } from "@/lib/supabase"
import type { ProductRow } from "@/types/catalog"
import { parseProductPayload, ProductValidationError } from "./validator"

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
}

const toErrorPayload = (error: unknown) => {
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; code?: unknown; detail?: unknown; hint?: unknown }
    const message = typeof value.message === "string" ? value.message : "Failed to create product"
    return {
      error: message,
      code: typeof value.code === "string" ? value.code : null,
      detail: typeof value.detail === "string" ? value.detail : null,
      hint: typeof value.hint === "string" ? value.hint : null,
    }
  }

  if (error instanceof Error) {
    const pgError = error as Error & { code?: string; detail?: string; hint?: string }
    return {
      error: error.message,
      code: pgError.code ?? null,
      detail: pgError.detail ?? null,
      hint: pgError.hint ?? null,
    }
  }

  return {
    error: "Failed to create product",
    code: null,
    detail: null,
    hint: null,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category") ?? undefined

  try {
    const products = categoryId ? await fetchProductsByCategory(categoryId) : await fetchProducts()
    return NextResponse.json({ products }, { headers: PUBLIC_CACHE_HEADERS })
  } catch (error) {
    console.error("catalog.products.GET", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load products",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const payload = await parseProductPayload(request)
    const supabase = createServerDatabaseClient()

    const { data, error } = await supabase
      .from("products")
      .insert({
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description,
        image_url: payload.image || null,
        rate: payload.price !== null ? String(payload.price) : null,
        specs: JSON.stringify(payload.specs),
        highlights: JSON.stringify(payload.highlights),
      })
      .select("*")
      .single()

    if (error || !data) {
      throw error ?? new Error("Unable to create product")
    }

    return NextResponse.json({ product: mapProductRow(data as ProductRow) }, { status: 201 })
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return NextResponse.json({ error: error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    console.error("catalog.products.POST", error)
    return NextResponse.json(toErrorPayload(error), { status: 500 })
  }
}
