import { NextResponse, type NextRequest } from "next/server"

import { requireAdminApiUser } from "@/lib/auth"
import { mapCategoryRow } from "@/lib/catalog-utils"
import { createServerDatabaseClient } from "@/lib/supabase"
import type { CategoryRow } from "@/types/catalog"
import { CategoryValidationError, parseCategoryPayload } from "../validator"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { errorResponse } = await requireAdminApiUser()
  if (errorResponse) {
    return errorResponse
  }

  try {
    const params = await context.params
    const { queryServerDatabase } = await import("@/lib/supabase")

    // ✅ STEP 1: delete dependent products FIRST
    await queryServerDatabase(
      'DELETE FROM "products" WHERE "category_id" = $1',
      [params.id]
    )

    // ✅ STEP 2: delete category
    await queryServerDatabase(
      'DELETE FROM "categories" WHERE "id" = $1',
      [params.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("catalog.categories.delete", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete category",
      },
      { status: 500 },
    )
  }
}

