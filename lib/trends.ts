import { mapProductRow } from "@/lib/catalog-utils"
import { queryServerDatabase } from "@/lib/supabase"
import type { ProductRow } from "@/types/catalog"
import { cache } from "react"
import type {
  TrendCampaign,
  TrendCampaignWithProducts,
  TrendPayload,
  TrendRow,
} from "@/types/trends"

const normalizeDiscountCode = (value: string) => value.trim().toUpperCase()

const mapTrendRow = (row: TrendRow): TrendCampaign => ({
  id: row.id,
  title: row.title ?? "",
  subtitle: row.subtitle ?? "",
  discountCode: row.discount_code ?? "",
  discountPercent: row.discount_percent ?? 0,
  heroImage: row.hero_image ?? "",
  productIds: row.product_ids ?? [],
  targetCategory: row.target_category ?? "",
  active: Boolean(row.active),
  createdAt: row.created_at,
})

const toTrendWritePayload = (payload: TrendPayload) => ({
  title: payload.title,
  subtitle: payload.subtitle,
  discount_code: normalizeDiscountCode(payload.discountCode),
  discount_percent: payload.discountPercent,
  hero_image: payload.heroImage,
  product_ids: payload.productIds,
  target_category: payload.targetCategory,
  active: payload.active,
})

export class TrendValidationError extends Error {}

export const validateTrendPayload = (value: unknown): TrendPayload => {
  if (!value || typeof value !== "object") {
    throw new TrendValidationError("Invalid trend payload")
  }

  const record = value as Record<string, unknown>
  const title = typeof record.title === "string" ? record.title.trim() : ""
  const subtitle = typeof record.subtitle === "string" ? record.subtitle.trim() : ""
  const discountCode = typeof record.discountCode === "string" ? record.discountCode.trim() : ""
  const heroImage = typeof record.heroImage === "string" ? record.heroImage.trim() : ""
  const targetCategory = typeof record.targetCategory === "string" ? record.targetCategory.trim() : ""
  const active = Boolean(record.active)
  const rawPercent =
    typeof record.discountPercent === "number"
      ? record.discountPercent
      : Number(record.discountPercent)

  const rawProductIds = Array.isArray(record.productIds) ? record.productIds : []
  const productIds = rawProductIds.map((entry) => String(entry).trim()).filter(Boolean)

  if (!title) throw new TrendValidationError("Trend title is required")
  if (!subtitle) throw new TrendValidationError("Trend subtitle is required")
  if (!discountCode) throw new TrendValidationError("Discount code is required")
  if (!Number.isInteger(rawPercent) || rawPercent <= 0 || rawPercent > 100) {
    throw new TrendValidationError("Discount percent must be an integer between 1 and 100")
  }
  if (!heroImage) throw new TrendValidationError("Hero image is required")
  if (productIds.length !== 3) throw new TrendValidationError("Select exactly 3 products")
  if (!targetCategory) throw new TrendValidationError("Target category is required")

  return {
    title,
    subtitle,
    discountCode: normalizeDiscountCode(discountCode),
    discountPercent: rawPercent,
    heroImage,
    productIds,
    targetCategory,
    active,
  }
}

const fetchTrendsCached = cache(async (): Promise<TrendCampaign[]> => {
  const rows = await queryServerDatabase<TrendRow>(
    "SELECT * FROM trends ORDER BY created_at DESC",
  )
  return rows.map(mapTrendRow)
})

const fetchTrendByIdCached = cache(async (id: string): Promise<TrendCampaign | null> => {
  const rows = await queryServerDatabase<TrendRow>("SELECT * FROM trends WHERE id = $1 LIMIT 1", [id])
  return rows[0] ? mapTrendRow(rows[0]) : null
})

const fetchActiveTrendCached = cache(async (): Promise<TrendCampaign | null> => {
  const rows = await queryServerDatabase<TrendRow>(
    "SELECT * FROM trends WHERE active = true ORDER BY created_at DESC LIMIT 1",
  )
  return rows[0] ? mapTrendRow(rows[0]) : null
})

const fetchActiveTrendsCached = cache(async (): Promise<TrendCampaign[]> => {
  const rows = await queryServerDatabase<TrendRow>(
    "SELECT * FROM trends WHERE active = true ORDER BY created_at DESC",
  )
  return rows.map(mapTrendRow)
})

// Alias kept to match callsites that prefer `get*` naming.
export const getActiveTrends = async () => fetchActiveTrendsCached()

const fetchActiveTrendByDiscountCodeCached = cache(async (discountCode: string): Promise<TrendCampaign | null> => {
  const normalizedCode = normalizeDiscountCode(discountCode)
  if (!normalizedCode) return null

  const rows = await queryServerDatabase<TrendRow>(
    "SELECT * FROM trends WHERE active = true AND UPPER(discount_code) = $1 ORDER BY created_at DESC LIMIT 1",
    [normalizedCode],
  )
  return rows[0] ? mapTrendRow(rows[0]) : null
})

const fetchTrendProductsCached = cache(async (productIdsKey: string): Promise<TrendCampaignWithProducts["products"]> => {
  const productIds = productIdsKey ? productIdsKey.split(",").filter(Boolean) : []
  if (!productIds.length) {
    return []
  }

  const rows = await queryServerDatabase<ProductRow>(
    `
      SELECT *
      FROM products
      WHERE id = ANY($1::uuid[])
      ORDER BY array_position($1::uuid[], id)
    `,
    [productIds],
  )

  return rows.map(mapProductRow)
})

export const fetchTrends = async (): Promise<TrendCampaign[]> => fetchTrendsCached()

export const fetchTrendById = async (id: string): Promise<TrendCampaign | null> => fetchTrendByIdCached(id)

export const fetchActiveTrend = async (): Promise<TrendCampaign | null> => fetchActiveTrendCached()

export const fetchActiveTrends = async (): Promise<TrendCampaign[]> => fetchActiveTrendsCached()

export const fetchActiveTrendByDiscountCode = async (discountCode: string): Promise<TrendCampaign | null> =>
  fetchActiveTrendByDiscountCodeCached(discountCode)

export const fetchTrendProducts = async (productIds: string[]): Promise<TrendCampaignWithProducts["products"]> =>
  fetchTrendProductsCached(productIds.join(","))

export const createTrend = async (payload: TrendPayload): Promise<TrendCampaign> => {
  const trendPayload = toTrendWritePayload(payload)

  const rows = await queryServerDatabase<TrendRow>(
    `
      INSERT INTO trends (
        title,
        subtitle,
        discount_code,
        discount_percent,
        hero_image,
        product_ids,
        target_category,
        active
      )
      VALUES ($1, $2, $3, $4, $5, $6::uuid[], $7::uuid, $8)
      RETURNING *
    `,
    [
      trendPayload.title,
      trendPayload.subtitle,
      trendPayload.discount_code,
      trendPayload.discount_percent,
      trendPayload.hero_image,
      trendPayload.product_ids,
      trendPayload.target_category,
      trendPayload.active,
    ],
  )

  if (!rows[0]) {
    throw new Error("Unable to create trend")
  }

  return mapTrendRow(rows[0])
}

export const updateTrend = async (id: string, payload: TrendPayload): Promise<TrendCampaign | null> => {
  const trendPayload = toTrendWritePayload(payload)

  const rows = await queryServerDatabase<TrendRow>(
    `
      UPDATE trends
      SET
        title = $1,
        subtitle = $2,
        discount_code = $3,
        discount_percent = $4,
        hero_image = $5,
        product_ids = $6::uuid[],
        target_category = $7::uuid,
        active = $8
      WHERE id = $9
      RETURNING *
    `,
    [
      trendPayload.title,
      trendPayload.subtitle,
      trendPayload.discount_code,
      trendPayload.discount_percent,
      trendPayload.hero_image,
      trendPayload.product_ids,
      trendPayload.target_category,
      trendPayload.active,
      id,
    ],
  )

  return rows[0] ? mapTrendRow(rows[0]) : null
}

export const setTrendActiveState = async (id: string, active: boolean): Promise<TrendCampaign | null> => {
  if (active) {
    const rows = await queryServerDatabase<TrendRow>(
      "UPDATE trends SET active = true WHERE id = $1 RETURNING *",
      [id],
    )
    return rows[0] ? mapTrendRow(rows[0]) : null
  }

  const rows = await queryServerDatabase<TrendRow>(
    "UPDATE trends SET active = false WHERE id = $1 RETURNING *",
    [id],
  )
  return rows[0] ? mapTrendRow(rows[0]) : null
}

export const deleteTrend = async (id: string): Promise<boolean> => {
  const rows = await queryServerDatabase<{ id: string }>(
    "DELETE FROM trends WHERE id = $1 RETURNING id",
    [id],
  )
  return Boolean(rows[0]?.id)
}
