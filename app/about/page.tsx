import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { categories } from "@/data/categories";

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
        <p className="text-2xl font-semibold">Precision without compromise</p>
        <p className="mt-4 text-sm text-[#999999]">
          For over a decade, ModiQ has delivered premium motion systems built around three pillars: durability, design, and daily usability. Every hinge, channel, and drawer system undergoes rigorous testing for corrosion resistance, life-cycle endurance, and load stability to ensure that designers deliver luxury experiences that last.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <div key={category.id} className="rounded-2xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-[#A5B867]">{category.name}</p>
              <p className="mt-2 text-sm text-[#999999]">{category.description}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal className="grid gap-6 md:grid-cols-2">
        {["Durable", "Rust-proof", "Premium", "Long Life"].map((value) => (
          <div key={value} className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6 text-[#4A4A4A]">
            <p className="text-sm text-[#A5B867]">Why Choose ModiQ</p>
            <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
            <p className="mt-3 text-sm text-[#999999]">
              Engineered and tested to meet extreme performance benchmarks, ensuring architectural projects stay pristine for years.
            </p>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
