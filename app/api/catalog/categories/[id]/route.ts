import { NextResponse, type NextRequest } from "next/server"

import { mapCategoryRow } from "@/lib/catalog-utils"
import { createServerDatabaseClient } from "@/lib/supabase"
import type { CategoryRow } from "@/types/catalog"
import { CategoryValidationError, parseCategoryPayload } from "../validator"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const payload = await parseCategoryPayload(request)
    const supabase = createServerDatabaseClient()
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: payload.name,
        hero_line: payload.heroLine,
        description: payload.description,
        // Keep write fields aligned with the existing DB schema.
        image_url: payload.image || null,
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

    return NextResponse.json({ category: mapCategoryRow(data as CategoryRow) })
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.categories.update", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update category",
      },
      { status: 500 },
    )
  }
}
