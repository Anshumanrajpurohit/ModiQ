import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { fetchCategories, fetchProducts } from "@/lib/catalog";

export const revalidate = 0;

export default async function ProductsPage() {
  const [categories, featured] = await Promise.all([fetchCategories(), fetchProducts(6)]);
  return (
    <div className="space-y-16">
      <Reveal className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
        <p className="text-3xl font-bold">Product Catalog</p>
        <p className="mt-3 text-sm text-[#999999]">
          Explore hardware systems crafted for luxury residences, modular kitchens, and premium commercial spaces.
        </p>
        {categories.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.id}`}
                className="rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-4 py-4 text-left text-sm text-[#4A4A4A] transition hover:border-[#A5B867]"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-[#A5B867]">{category.name}</p>
                <p className="mt-2 text-[#999999]">{category.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-5 py-10 text-center text-sm text-[#999999]">
            No categories yet. Add one from the admin panel to unlock the catalog.
          </p>
        )}
      </Reveal>
      <Reveal className="space-y-6">
        <div>
          <p className="text-2xl font-semibold text-[#4A4A4A]">Featured Systems</p>
          <p className="text-sm text-[#999999]">Preview best-sellers across hinges, channels, and drawer systems.</p>
        </div>
        <ProductGrid products={featured} />
      </Reveal>
    </div>
  );
}
