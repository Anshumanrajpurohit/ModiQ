"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import companyLogo from "@/public/images/company-logo.png";
import { NavUserAvatar } from "@/components/NavUserAvatar";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Cart", href: "/cart" },
];

const ADMIN_NAV_LINKS = [
  { label: "Products", href: "/admin" },
  { label: "Orders", href: "/admin?panel=orders" },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const loginHref = useMemo(() => {
    const path = pathname || "/";
    const encoded = encodeURIComponent(path);
    return `/login?next=${encoded}`;
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = isAdmin ? ADMIN_NAV_LINKS : PUBLIC_NAV_LINKS;

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" && searchParams?.get("panel") !== "orders";
    }

    if (href.startsWith("/admin?panel=orders")) {
      return pathname === "/admin" && searchParams?.get("panel") === "orders";
    }

    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#9B9B9B]/40 bg-[#FFFFFF]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[#4A4A4A] dark:text-white">
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
              className="relative rounded-full px-4 py-2 text-sm transition hover:text-[#A5B867] dark:hover:text-[#c4d677]"
            >
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-[#A5B867]/20 dark:bg-[#c4d677]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!isAdmin && (
            <Link
              href="/cart"
              className="rounded-full border border-[#A5B867] bg-[#A5B867] px-6 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:bg-[#FFFFFF] dark:border-[#c4d677] dark:bg-[#c4d677]/90 dark:text-[#050505] dark:hover:bg-transparent dark:hover:text-[#c4d677]"
            >
              View Cart
            </Link>
          )}
          {user ? (
            <NavUserAvatar />
          ) : (
            <Link
              href={loginHref}
              className="rounded-full border border-[#4A4A4A]/20 px-4 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867] dark:border-white/20 dark:text-white dark:hover:border-[#c4d677] dark:hover:text-[#c4d677]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#9B9B9B]/40 dark:border-white/20 md:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-[#4A4A4A] dark:bg-white" />
            <span className="block h-0.5 w-5 bg-[#4A4A4A] dark:bg-white" />
            <span className="block h-0.5 w-5 bg-[#4A4A4A] dark:bg-white" />
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
              className="absolute right-0 top-0 flex h-screen w-4/5 flex-col gap-6 bg-[#FFFFFF] px-6 py-10 text-[#4A4A4A] shadow-2xl dark:bg-[#050505] dark:text-white"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm tracking-[0.3em]">MODIQ</span>
                <button
                  className="rounded-full border border-[#9B9B9B]/40 px-4 py-2 text-sm dark:border-white/20"
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
                <ThemeToggle />
                {user ? (
                  <NavUserAvatar />
                ) : (
                  <Link
                    href={loginHref}
                    className="w-full rounded-2xl border border-[#E0E0E0] px-4 py-3 text-center text-sm font-semibold dark:border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
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
