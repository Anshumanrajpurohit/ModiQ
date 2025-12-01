import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { Reveal } from "@/components/Reveal";
import { PromoBanner } from "@/components/PromoBanner";
import { categories } from "@/data/categories";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Reveal>
        <PromoBanner />
      </Reveal>
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#A5B867]">Brand Intro</p>
            <p className="mt-4 text-3xl font-bold text-[#4A4A4A]">Hardware that elevates modern living.</p>
            <p className="mt-4 text-sm text-[#999999]">
              ModiQ partners with architects, kitchen studios, and OEMs to deliver hinges, channels, and slim drawer systems that feel luxurious from day one and stay flawless for years. Every assembly is cycle-tested, salt-spray certified, and built for the Indian climate.
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-[#9B9B9B]">
              <div>
                <p className="text-3xl font-bold text-[#4A4A4A]">10+</p>
                <p>Years servicing premium interiors</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#4A4A4A]">150+</p>
                <p>SKUs spanning five categories</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#4A4A4A]">24h</p>
                <p>Average turnaround on RFQs</p>
              </div>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center text-sm font-semibold text-[#A5B867]"
            >
              Discover our process →
            </Link>
          </div>
          <div className="rounded-2xl border border-[#9B9B9B]/40 bg-[#4A4A4A] p-5 text-sm text-[#9B9B9B]">
            <p className="text-white">Trusted by:</p>
            <ul className="mt-4 space-y-2">
              <li>- Boutique kitchen studios</li>
              <li>- Luxury residential developers</li>
              <li>- Modular furniture OEMs</li>
              <li>- Interior turnkey teams</li>
            </ul>
          </div>
        </div>
      </Reveal>
      <Reveal className="space-y-6">
        <div>
          <p className="text-2xl font-semibold text-[#4A4A4A]">Product Categories</p>
          <p className="text-sm text-[#999999]">Hardware families engineered for every premium project.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Reveal>
      <Reveal className="rounded-3xl border border-[#4A4A4A]/20 bg-[#4A4A4A] p-6 text-[#FFFFFF]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#9B9B9B]">Why Choose ModiQ</p>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {["Durable", "Rust-proof", "Premium", "Long Life"].map((item) => (
            <div key={item} className="rounded-2xl border border-[#FFFFFF]/20 bg-[#FFFFFF]/5 p-4">
              <p className="text-2xl font-semibold">{item}</p>
              <p className="mt-3 text-sm text-[#9B9B9B]">
                Tested against humidity, load, and friction to deliver flawless performance.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="rounded-full border border-[#FFFFFF]/30 px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#A5B867] hover:text-[#A5B867]"
          >
            Download Catalog
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[#A5B867] bg-[#A5B867] px-6 py-3 text-sm font-semibold text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
          >
            Contact Sales
          </Link>
        </div>
      </Reveal>
      <Reveal className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] px-6 py-10 text-[#4A4A4A]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#999999]">Ready to collaborate</p>
            <p className="text-3xl font-bold">We support designers end-to-end.</p>
          </div>
          <Link
            href="/cart"
            className="rounded-full bg-[#A5B867] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
          >
            View Cart
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
