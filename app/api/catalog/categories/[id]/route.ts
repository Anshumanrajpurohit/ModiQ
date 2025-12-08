import { NextResponse, type NextRequest } from "next/server"

import { mapCategoryRow } from "@/lib/catalog-utils"
import { createSupabaseServiceRoleClient } from "@/lib/supabase"
import { CategoryValidationError, parseCategoryPayload } from "../validator"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const payload = await parseCategoryPayload(request)
    const supabase = createSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: payload.name,
        hero_line: payload.heroLine,
        description: payload.description,
        image: payload.image,
      })
      .eq("id", params.id)
      .select("*")
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: mapCategoryRow(data) })
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.categories.update", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}
