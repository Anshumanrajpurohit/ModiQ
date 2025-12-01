import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { getProductById, products } from "@/data/products";
import { SpecDetailList } from "@/components/SpecDetailList";

export async function generateStaticParams() {
  return products.map((product) => ({
    category: product.category,
    product: product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.product);
  if (!product || product.category !== resolvedParams.category) {
    return notFound();
  }
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-[#F5F5F5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 900px, 100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </Reveal>
      <Reveal className="rounded-3xl bg-[#FFFFFF] p-6 text-[#4A4A4A] shadow-lg shadow-[#4A4A4A]/5">
        <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">{product.category}</p>
        <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-sm text-[#999999]">SKU: {product.id}</p>
        <p className="mt-4 text-sm text-[#999999]">{product.description}</p>
        <p className="mt-2 text-sm text-[#999999]">Indicative ex-factory price: {formattedPrice}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <SpecDetailList title="Specifications" items={product.specs} />
          <div>
            <SpecDetailList title="Highlights" items={product.highlights} />
            <p className="mt-4 text-sm text-[#999999]">Available sizes: {product.sizes.join(", ")}</p>
          </div>
        </div>
        <Link
          href="/cart"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#A5B867] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
        >
          Go to Cart
        </Link>
      </Reveal>
      <Reveal>
        <ProductPurchasePanel
          productName={product.name}
          productId={product.id}
          priceLabel={formattedPrice}
          unitPrice={product.price}
        />
      </Reveal>
      <Reveal>
        <Link href="/products" className="inline-flex text-sm text-[#999999] transition hover:text-[#4A4A4A]">
          ← Back to catalog
        </Link>
      </Reveal>
    </div>
  );
}
