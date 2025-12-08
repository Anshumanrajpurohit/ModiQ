import { createSupabaseServiceRoleClient } from "@/lib/supabase"
import { mapCategoryRow, mapProductRow } from "@/lib/catalog-utils"
import type { CatalogCategory, CatalogProduct } from "@/types/catalog"

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })
  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`)
  }
  return data?.map(mapCategoryRow) ?? []
}

export async function fetchCategoryById(categoryId: string): Promise<CatalogCategory | null> {
  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle()
  if (error) {
    throw new Error(`Unable to load category: ${error.message}`)
  }
  return data ? mapCategoryRow(data) : null
}

export async function fetchProducts(limit?: number): Promise<CatalogProduct[]> {
  const supabase = createSupabaseServiceRoleClient()
  let query = supabase.from("products").select("*").order("created_at", { ascending: false })
  if (typeof limit === "number") {
    query = query.limit(limit)
  }
  const { data, error } = await query
  if (error) {
    throw new Error(`Unable to load products: ${error.message}`)
  }
  return data?.map(mapProductRow) ?? []
}

export async function fetchProductsByCategory(categoryId: string): Promise<CatalogProduct[]> {
  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
  if (error) {
    throw new Error(`Unable to load products for ${categoryId}: ${error.message}`)
  }
  return data?.map(mapProductRow) ?? []
}

export async function fetchProductById(productId?: string): Promise<CatalogProduct | null> {
  if (!productId) {
    return null
  }
  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle()
  if (error) {
    console.error("catalog.fetchProductById", error)
    return null
  }
  return data ? mapProductRow(data) : null
}
