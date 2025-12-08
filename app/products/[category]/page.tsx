import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { fetchCategoryById, fetchProductsByCategory } from "@/lib/catalog";

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = await fetchCategoryById(params.category);
  if (!category) return notFound();
  const filteredProducts = await fetchProductsByCategory(category.id);

  return (
    <div className="space-y-10">
      <Reveal className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
        <p className="text-sm uppercase tracking-[0.5em] text-[#A5B867]">{category.name}</p>
        <h1 className="mt-3 text-3xl font-bold">{category.heroLine}</h1>
        <p className="mt-3 text-sm text-[#999999]">{category.description}</p>
      </Reveal>
      <Reveal>
        <ProductGrid products={filteredProducts} />
      </Reveal>
    </div>
  );
}
