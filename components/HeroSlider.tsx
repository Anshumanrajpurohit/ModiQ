"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { ProductGrid } from "@/components/ProductGrid"
import type { TrendCampaignWithProducts } from "@/types/trends"

type HeroSliderProps = {
  trends: TrendCampaignWithProducts[]
}

export function HeroSlider({ trends }: HeroSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const totalSlides = trends.length

  useEffect(() => {
    if (totalSlides <= 1) return

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [totalSlides])

  const safeActiveSlide = totalSlides ? activeSlide % totalSlides : 0
  const currentTrend = useMemo(() => trends[safeActiveSlide] ?? null, [safeActiveSlide, trends])

  return (
    <section className="space-y-6">
      <article className="relative overflow-hidden rounded-3xl border border-[#9B9B9B]/40 bg-[#4A4A4A] px-6 py-10 text-[#FFFFFF] shadow-2xl shadow-[#4A4A4A]/50 sm:px-10">
        <div className="relative min-h-[420px]">
          {trends.map((trend, index) => {
            const isActive = index === safeActiveSlide
            const orderNowHref = `/products/${trend.targetCategory}?discount=${encodeURIComponent(trend.discountCode)}`
            return (
              <div
                key={trend.id}
                className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
                aria-hidden={!isActive}
              >
                <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:items-center">
                  <div className="flex flex-col gap-5">
                    <p className="text-sm uppercase tracking-[0.5em] text-[#A5B867]">Active Trend Campaign</p>
                    <h1 className="text-3xl font-bold leading-tight text-[#FFFFFF] sm:text-4xl">{trend.title}</h1>
                    <p className="max-w-2xl text-[#CFCFCF]">{trend.subtitle}</p>
                    <div className="inline-flex w-fit rounded-full border border-[#A5B867]/50 bg-[#A5B867]/15 px-4 py-2 text-sm font-semibold text-[#E8F4BD]">
                      Use Code: {trend.discountCode} ({trend.discountPercent}% OFF)
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href={orderNowHref}
                        className="rounded-full bg-[#A5B867] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
                      >
                        Order Now
                      </Link>
                      <Link
                        href="/products"
                        className="rounded-full border border-[#FFFFFF]/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#FFFFFF] transition hover:border-[#A5B867] hover:text-[#A5B867]"
                      >
                        View Catalog
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#FFFFFF]/20 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trend.heroImage}
                      alt={trend.title}
                      className="h-full max-h-[360px] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {totalSlides > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {trends.map((trend, index) => {
              const isActive = index === safeActiveSlide
              return (
                <button
                  key={trend.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition ${isActive ? "w-8 bg-[#A5B867]" : "w-5 bg-white/40 hover:bg-white/70"}`}
                  aria-label={`Show trend slide ${index + 1}`}
                />
              )
            })}
          </div>
        )}
      </article>

      {currentTrend && currentTrend.products.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A5B867]">
            Featured in this trend
          </p>
          <ProductGrid products={currentTrend.products} />
        </div>
      )}
    </section>
  )
}
