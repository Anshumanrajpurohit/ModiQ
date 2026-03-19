import { NextResponse } from "next/server"

import { requireAdminApiUser } from "@/lib/auth"
import { fetchCategories } from "@/lib/catalog"
import { mapCategoryRow } from "@/lib/catalog-utils"
import { createServerDatabaseClient } from "@/lib/supabase"
import type { CategoryRow } from "@/types/catalog"
import { CategoryValidationError, parseCategoryPayload } from "./validator"

export async function GET() {
  try {
    const categories = await fetchCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("catalog.categories.GET", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load categories",
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
    const payload = await parseCategoryPayload(request)
    const supabase = createServerDatabaseClient()
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: payload.name,
        hero_line: payload.heroLine,
        description: payload.description,
        image_url: payload.image || null,
      })
      .select("*")
      .single()

    if (error || !data) {
      throw error ?? new Error("Unable to create category")
    }

    return NextResponse.json({ category: mapCategoryRow(data as CategoryRow) }, { status: 201 })
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("catalog.categories.POST", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create category",
      },
      { status: 500 },
    )
  }
}
