import type { CatalogProduct } from "@/types/catalog";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (!products.length) {
    return (
      <p className="rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-5 py-10 text-center text-sm text-[#999999]">
        No products available in this category yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
