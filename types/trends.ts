import type { CatalogProduct } from "@/types/catalog"

export type TrendRow = {
  id: string
  title: string | null
  subtitle: string | null
  discount_code: string | null
  discount_percent: number | null
  hero_image: string | null
  product_ids: string[] | null
  target_category: string | null
  active: boolean | null
  created_at: string | null
}

export type TrendCampaign = {
  id: string
  title: string
  subtitle: string
  discountCode: string
  discountPercent: number
  heroImage: string
  productIds: string[]
  targetCategory: string
  active: boolean
  createdAt: string | null
}

export type TrendCampaignWithProducts = TrendCampaign & {
  products: CatalogProduct[]
}

export type TrendPayload = {
  title: string
  subtitle: string
  discountCode: string
  discountPercent: number
  heroImage: string
  productIds: string[]
  targetCategory: string
  active: boolean
}
