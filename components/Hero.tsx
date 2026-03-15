import { HeroSlider } from "@/components/HeroSlider"
import { getActiveTrends, fetchTrendProducts } from "@/lib/trends"
import type { TrendCampaignWithProducts } from "@/types/trends"

export async function Hero() {
  const trends = await getActiveTrends()

  if (!trends.length) {
    return null
  }

  const trendsWithProducts: TrendCampaignWithProducts[] = await Promise.all(
    trends.map(async (trend) => ({
      ...trend,
      products: await fetchTrendProducts(trend.productIds),
    })),
  )

  return <HeroSlider trends={trendsWithProducts} />
}
