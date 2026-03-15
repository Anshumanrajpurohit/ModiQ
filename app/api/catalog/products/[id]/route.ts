import { NextResponse, type NextRequest } from "next/server"

import { mapProductRow } from "@/lib/catalog-utils"
import { createServerDatabaseClient } from "@/lib/supabase"
import type { ProductRow } from "@/types/catalog"
import { parseProductPayload, ProductValidationError } from "../validator"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const payload = await parseProductPayload(request)
    const supabase = createServerDatabaseClient()
    const { data, error } = await supabase
      .from("products")
      .update({
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description,
        // Keep write fields aligned with the existing DB schema.
        image_url: payload.image || null,
        rate: payload.price !== null ? String(payload.price) : null,
        specs: JSON.stringify(payload.specs),
        highlights: JSON.stringify(payload.highlights),
      })
      .eq("id", params.id)
      .select("*")
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product: mapProductRow(data as ProductRow) })
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.products.update", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 },
    )
  }
}
