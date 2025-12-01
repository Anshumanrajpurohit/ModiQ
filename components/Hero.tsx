import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#9B9B9B]/40 bg-[#4A4A4A] px-6 py-16 text-[#FFFFFF] shadow-2xl shadow-[#4A4A4A]/50 sm:px-10">
      <div className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.5em] text-[#9B9B9B]">Premium Architectural Hardware</p>
        <h1 className="text-3xl font-bold leading-tight text-[#FFFFFF] sm:text-4xl">
          Crafted for designers who demand flawless motion and stunning finishes.
        </h1>
        <p className="max-w-2xl text-[#9B9B9B]">
          ModiQ systems combine precise engineering, anti-corrosion coatings, and luxurious aesthetics to elevate every kitchen, wardrobe, and workspace.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-full bg-[#A5B867] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
          >
            View Catalog
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-[#FFFFFF]/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#FFFFFF] transition hover:border-[#A5B867] hover:text-[#A5B867]"
          >
            View Cart
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border border-[#A5B867]/40 bg-[#A5B867]/20 blur-3xl sm:block" />
    </section>
  );
}
