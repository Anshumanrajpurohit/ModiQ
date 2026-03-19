import { HeroSlider } from "@/components/HeroSlider"
import { getActiveTrends, fetchTrendProducts } from "@/lib/trends"
import type { TrendCampaignWithProducts } from "@/types/trends"

export async function Hero() {
  const trends = await getActiveTrends()

  if (!trends.length) {
    return null
  }

  const uniqueProductIds = [...new Set(trends.flatMap((trend) => trend.productIds))]
  const products = await fetchTrendProducts(uniqueProductIds)
  const productsById = new Map(products.map((product) => [product.id, product]))

  const trendsWithProducts: TrendCampaignWithProducts[] = trends.map((trend) => ({
    ...trend,
    products: trend.productIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is NonNullable<typeof product> => Boolean(product)),
  }))

  return <HeroSlider trends={trendsWithProducts} />
}
