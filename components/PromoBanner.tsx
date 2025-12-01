"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    id: "festive-hinges",
    badge: "Shubho Mahalaya",
    headline: "25% Off Signature Collections",
    subhead: "Smooth hinges & slim drawers for festive installs",
    image: "/images/regular-auto-hinge.png",
    href: "/products/hinges",
  },
  {
    id: "channels",
    badge: "Limited Window",
    headline: "Upgrade to Silent Channels",
    subhead: "Feather glide telescopic runners in matte graphite",
    image: "/images/soft-close-Tchannel.png",
    href: "/products/telescopic-channels",
  },
  {
    id: "slim-box",
    badge: "Design Studio Pick",
    headline: "Slim Box Pantry Kits",
    subhead: "Ultra-thin profiles with soft-close and glass sides",
    image: "/images/slim-box-long.png",
    href: "/products/slim-box",
  },
];

export function PromoBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative h-[420px] overflow-hidden rounded-3xl border border-[#A5B867]/30 bg-[#111] text-white shadow-xl shadow-[#050505]/30 sm:h-[460px]">
      {slides.map((item, index) => (
        <Image
          key={item.id}
          src={item.image}
          alt={item.headline}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 960px, 100vw"
          className={`object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 z-10 w-full max-w-xl space-y-4 px-6 pb-8 pt-12 sm:px-10">
        <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-[#A5B867]">
          {slide.badge}
        </p>
        <h2 className="text-3xl font-semibold sm:text-4xl">{slide.headline}</h2>
        <p className="text-sm text-[#F1F1F1]">{slide.subhead}</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white">
            Code <span className="ml-2 text-[#A5B867]">DURGA25</span>
          </div>
          <Link
            href={slide.href}
            className="rounded-full bg-[#A5B867] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:bg-white"
          >
            Order Now
          </Link>
          <Link href="/products" className="text-sm font-semibold text-white underline-offset-4 hover:underline">
            View Catalog
          </Link>
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-10 flex gap-2 rounded-full bg-black/40 px-4 py-2 backdrop-blur">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2.5 w-6 rounded-full transition ${index === active ? "bg-[#A5B867]" : "bg-white/40 hover:bg-white/70"}`}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
