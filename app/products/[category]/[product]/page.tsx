import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { SpecDetailList } from "@/components/SpecDetailList";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { fetchProductById, fetchCategoryById } from "@/lib/catalog";

export const revalidate = 0;

type ProductPageParams = { category?: string; product?: string };
type ProductPageProps = { params: Promise<ProductPageParams> };

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const categoryParam = resolvedParams.category?.trim();
  const productParam = resolvedParams.product?.trim();

  if (!categoryParam || !productParam || categoryParam === "undefined" || productParam === "undefined") {
    return notFound();
  }

  const product = await fetchProductById(productParam);
  if (!product || product.categoryId !== categoryParam) {
    return notFound();
  }

  const category = await fetchCategoryById(product.categoryId);
  const categoryName = category?.name ?? product.categoryId;

  const priceLabel = product.price
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(product.price)
    : "Rate on request";

  const highlightsCopy = product.highlights.length
    ? product.highlights.slice(0, 3).join(" • ")
    : "Made-to-order build. Share your finish and sizing requirements to receive a tailored quote.";

  return (
    <div className="space-y-10">
      <Reveal>
        <section className="rounded-[40px] border border-[#9B9B9B]/30 bg-gradient-to-br from-[#f6f6f6] via-white to-[#e4ecd2] p-4 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.6fr,1fr]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[36px] bg-[#111]/5 p-6 lg:aspect-[5/3] lg:p-12">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1280px) 1100px, (min-width: 768px) 70vw, 100vw"
                className="object-contain object-center"
                priority
              />
            </div>
            <div className="flex flex-col rounded-3xl bg-white/80 p-6 text-[#4A4A4A] shadow-2xl shadow-[#000]/5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.5em] text-[#A5B867]">{categoryName}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">{product.name}</h1>
              <p className="mt-3 text-sm text-[#9B9B9B]">SKU · {product.id}</p>
              <p className="mt-4 text-base text-[#5c5c5c]">{product.description}</p>
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#A5B867]/30 bg-[#f9fbf2] p-4 text-sm text-[#67704b]">
                <span className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Indicative rate</span>
                <span className="text-2xl font-semibold text-[#4A4A4A]">{priceLabel}</span>
                <p>{highlightsCopy}</p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <SpecDetailList title="Specifications" items={product.specs} />
                <SpecDetailList title="Highlights" items={product.highlights} />
              </div>
              <div className="mt-10 rounded-3xl border border-[#E0E0E0]/60 bg-white p-4">
                <ProductPurchasePanel
                  productName={product.name}
                  productId={product.id}
                  priceLabel={priceLabel}
                  unitPrice={product.price ?? 0}
                  categoryLabel={categoryName}
                />
              </div>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-[#4A4A4A]/20 px-6 py-3 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867]"
              >
                ← Back to catalog
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
