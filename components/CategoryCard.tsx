import Image from "next/image";
import Link from "next/link";
import type { CatalogCategory } from "@/types/catalog";

export function CategoryCard({ category }: { category: CatalogCategory }) {
  return (
    <Link
      href={`/products/${category.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] shadow-lg shadow-[#4A4A4A]/10 transition hover:-translate-y-1 hover:border-[#A5B867] hover:bg-[#F2F2F2]"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-center transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition group-hover:bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 px-4 pb-3 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">{category.name}</p>
          <p className="text-lg font-semibold">{category.heroLine}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between px-5 pb-5 pt-4">
        <p className="text-sm text-[#999999]">{category.description}</p>
        <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#A5B867]">
          Explore →
        </span>
      </div>
    </Link>
  );
}
