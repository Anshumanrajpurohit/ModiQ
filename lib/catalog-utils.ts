import type { CatalogCategory, CatalogProduct, CategoryRow, ProductRow } from "@/types/catalog"

export const mapCategoryRow = (row: CategoryRow): CatalogCategory => ({
  id: row.id,
  name: row.name,
  heroLine: row.hero_line,
  description: row.description ?? "",
  image: row.image_url ?? "",
  createdAt: row.created_at,
})

export const mapProductRow = (row: ProductRow): CatalogProduct => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description ?? "",
  image: row.image_url ?? "",
  price: row.rate ? Number(row.rate) || null : null,
  specs: row.specs ?? [],
  highlights: row.highlights ?? [],
  createdAt: row.created_at,
})

export const normaliseList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((entry) => entry.trim()).filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

