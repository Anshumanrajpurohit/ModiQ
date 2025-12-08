import { NextResponse } from "next/server"

import { fetchProducts, fetchProductsByCategory } from "@/lib/catalog"
import { mapProductRow } from "@/lib/catalog-utils"
import { createSupabaseServiceRoleClient } from "@/lib/supabase"
import { parseProductPayload, ProductValidationError } from "./validator"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category") ?? undefined

  try {
    const products = categoryId ? await fetchProductsByCategory(categoryId) : await fetchProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("catalog.products.GET", error)
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseProductPayload(request)
    const supabase = createSupabaseServiceRoleClient()

    const { data, error } = await supabase
      .from("products")
      .insert({
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description,
        image_url: payload.image || null,
        rate: payload.price !== null ? String(payload.price) : null,
        specs: payload.specs,
        highlights: payload.highlights,
      })
      .select("*")
      .single()

    if (error || !data) {
      throw error ?? new Error("Unable to create product")
    }

    return NextResponse.json({ product: mapProductRow(data) }, { status: 201 })
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.products.POST", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
