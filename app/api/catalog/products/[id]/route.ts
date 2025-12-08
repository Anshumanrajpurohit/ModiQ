import { NextResponse } from "next/server"

import { mapProductRow } from "@/lib/catalog-utils"
import { createSupabaseServiceRoleClient } from "@/lib/supabase"
import { parseProductPayload, ProductValidationError } from "../validator"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await parseProductPayload(request)
    const supabase = createSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("products")
      .update({
        category_id: payload.categoryId,
        name: payload.name,
        description: payload.description,
        image: payload.image,
        price: payload.price,
        specs: payload.specs,
        sizes: payload.sizes,
        highlights: payload.highlights,
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

    return NextResponse.json({ product: mapProductRow(data) })
  } catch (error) {
    if (error instanceof ProductValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.products.update", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
