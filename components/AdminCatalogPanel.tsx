"use client"

import { memo } from "react"
import Image from "next/image"

import type { CatalogCategory, CatalogProduct } from "@/types/catalog"

type AdminCatalogPanelProps = {
  categories: CatalogCategory[]
  isLoadingCategories: boolean
  selectedCategory: CatalogCategory | null
  selectedCategoryId: string | null
  products: CatalogProduct[]
  loadingCategoryId: string | null
  onOpenCategory: (categoryId: string) => void
  onEditCategory: (categoryId: string) => void
  onBackToCategories: () => void
  onAddCategory: () => void
  onAddProduct: (categoryId: string) => void
  onEditProduct: (categoryId: string, productId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)

function AdminCatalogPanelComponent({
  categories,
  isLoadingCategories,
  selectedCategory,
  selectedCategoryId,
  products,
  loadingCategoryId,
  onOpenCategory,
  onEditCategory,
  onBackToCategories,
  onAddCategory,
  onAddProduct,
  onEditProduct,
}: AdminCatalogPanelProps) {
  if (!selectedCategory) {
    return isLoadingCategories ? (
      <p className="rounded-2xl border border-[#ddd7ca] bg-[#fffdf8] px-5 py-10 text-center text-sm text-[#746f66] shadow-[0_16px_32px_rgba(63,58,52,0.06)]">
        Loading categories...
      </p>
    ) : categories.length ? (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b]"
          >
            Add category
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <article key={category.id} className="glow-card flex flex-col gap-5 p-6 text-[#3f3a34]">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-[#f3efe5] md:h-40 md:w-40">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 160px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-2xl font-semibold text-[#3f3a34]">{category.name}</h2>
                  <p className="text-sm text-[#6e685f]">{category.heroLine}</p>
                  <p className="text-xs text-[#8b847a]">{category.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onEditCategory(category.id)}
                  className="flex-1 rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCategory(category.id)}
                  className="flex-1 rounded-2xl border border-[#c8d4a0] bg-[#f4f8e8] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#7d8e43] transition hover:border-[#a5b867]"
                >
                  Explore
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded-2xl bg-[#a5b867] px-4 py-2 text-sm font-semibold text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b]"
          >
            Add category
          </button>
        </div>
        <p className="rounded-2xl border border-dashed border-[#d8d2c5] bg-[#fcfaf4] px-5 py-10 text-center text-sm text-[#756f66]">
          No categories yet. Use the button above to create the first one.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glow-card flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-[#6d675f]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#94a455]">Product stack</p>
          <p>{products.length} listed under {selectedCategory.name}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBackToCategories}
            className="rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
          >
            Back to categories
          </button>
          <button
            type="button"
            onClick={() => selectedCategoryId && onAddProduct(selectedCategoryId)}
            className="rounded-2xl bg-[#a5b867] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#2f3224] shadow-[0_14px_28px_rgba(148,164,85,0.2)] transition hover:bg-[#96a65b]"
          >
            Add product
          </button>
        </div>
      </div>

      {loadingCategoryId === selectedCategoryId ? (
        <p className="rounded-2xl border border-[#ddd7ca] bg-[#fffdf8] px-5 py-10 text-center text-sm text-[#746f66] shadow-[0_16px_32px_rgba(63,58,52,0.06)]">
          Loading products...
        </p>
      ) : products.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="glow-card flex flex-col gap-4 p-6 text-[#3f3a34]">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-[#f3efe5] md:h-36 md:w-36">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 144px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-xl font-semibold text-[#3f3a34]">{product.name}</h3>
                  <p className="text-sm text-[#6e685f]">{product.description}</p>
                  <p className="text-xs text-[#8b847a]">
                    {product.price !== null ? `List rate: ${formatCurrency(product.price)}` : "Rate shared on request"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[#7a746b]">
                    {product.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full border border-[#ddd7ca] bg-[#faf7f0] px-3 py-1">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onEditProduct(product.categoryId, product.id)}
                  className="flex-1 rounded-2xl border border-[#d7d1c4] bg-[#fbf8f1] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5f5951] transition hover:border-[#a5b867] hover:text-[#3f3a34]"
                >
                  Edit product
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#d8d2c5] bg-[#fcfaf4] px-5 py-10 text-center text-sm text-[#756f66]">
          No products logged for this category yet.
        </p>
      )}
    </div>
  )
}

export const AdminCatalogPanel = memo(AdminCatalogPanelComponent)
