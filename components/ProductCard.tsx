import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const highlightSummary = product.highlights.slice(0, 2).join(" · ")
  const secondaryLabel = highlightSummary || "Made-to-order"

  return (
    <div className="flex flex-col rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-5 text-[#4A4A4A] shadow-lg shadow-[#4A4A4A]/10">
      <div className="relative mb-4 h-48 overflow-hidden rounded-xl">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-[#4A4A4A]/95 via-[#4A4A4A]/70 to-transparent p-4 text-[#FFFFFF]">
          <p className="text-xs text-[#A5B867]">{product.id}</p>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-xs text-[#9B9B9B]">
            {product.price !== null ? `Starts at ₹${product.price}` : secondaryLabel}
          </p>
        </div>
      </div>
      <p className="text-sm text-[#999999]">{product.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-xs text-[#9B9B9B]">
        {product.specs.map((spec) => (
          <li key={spec} className="rounded-full border border-[#9B9B9B]/40 px-3 py-1">
            {spec}
          </li>
        ))}
      </ul>
      <Link
        href={`/products/${product.categoryId}/${product.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-[#A5B867] px-4 py-2 text-sm font-semibold text-[#A5B867] transition hover:bg-[#A5B867] hover:text-[#4A4A4A]"
      >
        View Details
      </Link>
    </div>
  );
}
