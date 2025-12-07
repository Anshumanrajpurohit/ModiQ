"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignedOut } from "@clerk/nextjs";
import companyLogo from "@/public/images/company-logo.png";
import { NavUserAvatar } from "@/components/NavUserAvatar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Cart", href: "/cart" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const loginHref = useMemo(() => {
    const path = pathname || "/";
    const encoded = encodeURIComponent(path);
    return `/sgp?returnTo=${encoded}`;
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#9B9B9B]/40 bg-[#FFFFFF]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[#4A4A4A]">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[0.2em] uppercase"
        >
          <Image
            src={companyLogo}
            alt="ModiQ Hardware"
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-full px-4 py-2 text-sm transition hover:text-[#A5B867]"
            >
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-[#A5B867]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/cart"
            className="rounded-full border border-[#A5B867] bg-[#A5B867] px-6 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:bg-[#FFFFFF]"
          >
            View Cart
          </Link>
          <NavUserAvatar />
          <SignedOut>
            <Link
              href={loginHref}
              className="rounded-full border border-[#4A4A4A]/20 px-4 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867]"
            >
              Login
            </Link>
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#9B9B9B]/40 md:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-[#4A4A4A]" />
            <span className="block h-0.5 w-5 bg-[#4A4A4A]" />
            <span className="block h-0.5 w-5 bg-[#4A4A4A]" />
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#4A4A4A]/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute right-0 top-0 flex h-screen w-4/5 flex-col gap-6 bg-[#FFFFFF] px-6 py-10 text-[#4A4A4A] shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm tracking-[0.3em]">MODIQ</span>
                <button
                  className="rounded-full border border-[#9B9B9B]/40 px-4 py-2 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  Close
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      "rounded-2xl px-4 py-3 text-lg transition hover:bg-[#A5B867]/10 " +
                      (isActive(link.href)
                        ? "bg-[#A5B867]/15 text-[#A5B867]"
                        : "")
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <NavUserAvatar />
                <SignedOut>
                  <Link
                    href={loginHref}
                    className="w-full rounded-2xl border border-[#E0E0E0] px-4 py-3 text-center text-sm font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </SignedOut>
              </div>

              {/* Footer Contact Info */}
              <div className="mt-auto space-y-2 text-sm text-[#9B9B9B]">
                <p className="font-semibold text-[#4A4A4A]">Contact</p>
                <p>+91 99880 11223</p>
                <p>hello@modiqhardware.com</p>
                <p>Plot 21, Industrial Estate, Mumbai</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
