"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import companyLogo from "@/public/images/company-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Cart", href: "/cart" },
];

const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin?panel=products" },
  { label: "Orders", href: "/admin?panel=orders" },
  { label: "Trends", href: "/admin/trends" },
];

type NavbarVariant = "admin" | "user" | "login";

type NavbarProps = {
  variant?: NavbarVariant;
};

export function Navbar({ variant = "user" }: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const isSignedIn = variant !== "login";
  const isAdmin = variant === "admin";
  const fullName =
    typeof clerkUser?.unsafeMetadata?.fullName === "string"
      ? clerkUser.unsafeMetadata.fullName
      : null;
  const name = clerkUser?.firstName || fullName || "User";
  const loginHref = useMemo(() => {
    const path = pathname || "/";
    const suffix = searchParams?.toString();
    const nextValue = suffix ? `${path}?${suffix}` : path;
    const encoded = encodeURIComponent(nextValue);
    return `/login?next=${encoded}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.closest("[data-user-menu]")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isUserMenuOpen]);

  const navLinks = isAdmin ? ADMIN_NAV_LINKS : PUBLIC_NAV_LINKS;

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" && !searchParams?.get("panel");
    }

    if (href.startsWith("/admin?panel=products")) {
      return pathname === "/admin" && searchParams?.get("panel") === "products";
    }

    if (href.startsWith("/admin?panel=orders")) {
      return pathname === "/admin" && searchParams?.get("panel") === "orders";
    }

    if (href === "/admin/trends") {
      return pathname.startsWith("/admin/trends");
    }

    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <LazyMotion features={domAnimation}>
      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/80 ${isAdmin ? "border-[#ddd7ca] bg-[#fffdf8]/92 shadow-[0_12px_32px_rgba(63,58,52,0.08)]" : "border-[#9B9B9B]/40 bg-[#FFFFFF]/90"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[#4A4A4A] dark:text-white">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[0.2em] uppercase"
        >
          <Image
            src={companyLogo}
            alt="ModiQ Hardware"
            className="h-8 w-auto"
            sizes="112px"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-full px-4 py-2 text-sm transition ${isAdmin ? "hover:text-[#8c9d50]" : "hover:text-[#A5B867] dark:hover:text-[#c4d677]"}`}
            >
              {isActive(link.href) && (
                <m.span
                  layoutId="nav-active"
                  className={`absolute inset-0 rounded-full ${isAdmin ? "border border-[#d8d2c5] bg-[#a5b867]/16" : "bg-[#A5B867]/20 dark:bg-[#c4d677]/20"}`}
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
          {isAdmin && isSignedIn ? (
            <button
              type="button"
              onClick={() => signOut()}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${isAdmin ? "border-[#d7d1c4] bg-[#fbf8f1] text-[#5f5951] hover:border-red-300 hover:text-red-600" : "border-[#4A4A4A]/20 text-[#4A4A4A] hover:border-red-400 hover:text-red-500 dark:border-white/20 dark:text-white dark:hover:border-red-400 dark:hover:text-red-300"}`}
            >
              Logout
            </button>
          ) : null}
          {isSignedIn ? (
              <div className="relative" data-user-menu>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="rounded-full border border-[#4A4A4A]/20 px-4 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867] dark:border-white/20 dark:text-white dark:hover:border-[#c4d677] dark:hover:text-[#c4d677]"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {name}
                </button>
                {isUserMenuOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      border: "1px solid #e0e0e0",
                      top: "110%",
                      background: "#f0f9da",
                      borderRadius: "15px",
                      padding: "2px",
                      minWidth: "100px",
                      display: "flex",
                      justifyContent: "center", // ✅ center content
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => signOut()}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "center",   // ✅ center text
                        color: "#ff4d4f",      // ✅ red
                        fontWeight: "bold",    // ✅ bold
                        fontSize: "14px",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href={loginHref}
                className="rounded-full border border-[#4A4A4A]/20 px-4 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867] dark:border-white/20 dark:text-white dark:hover:border-[#c4d677] dark:hover:text-[#c4d677]"
              >
                Login
              </Link>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 flex-col items-center justify-center rounded-full border border-[#4A4A4A]/20 text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867] dark:border-white/20 dark:text-white dark:hover:border-[#c4d677] dark:hover:text-[#c4d677]"
            aria-label="Toggle navigation menu"
          >
            <span className="block h-0.5 w-5 rounded bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded bg-current" />
          </button>
        </div>

      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <m.div
            className={`fixed inset-0 z-40 ${isAdmin ? "bg-[#3f3a34]/30 backdrop-blur-sm" : "bg-[#4A4A4A]/90"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.div
              className={`absolute right-0 top-0 flex h-screen w-4/5 flex-col gap-6 px-6 py-10 shadow-2xl dark:bg-[#050505] dark:text-white ${isAdmin ? "bg-[#fffdf8] text-[#3f3a34]" : "bg-[#FFFFFF] text-[#4A4A4A]"}`}
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
                      `${isAdmin ? "rounded-2xl px-4 py-3 text-lg transition hover:bg-[#a5b867]/10 hover:text-[#7d8e43]" : "rounded-2xl px-4 py-3 text-lg transition hover:bg-[#A5B867]/10 "}` +
                      (isActive(link.href)
                        ? (isAdmin ? "bg-[#a5b867]/14 text-[#7d8e43]" : "bg-[#A5B867]/15 text-[#A5B867]")
                        : "")
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void signOut();
                    }}
                    className="rounded-2xl border border-red-300/50 px-4 py-3 text-left text-lg text-red-200 transition hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                {isSignedIn ? (
                    <div className="relative w-full" data-user-menu>
                      <button
                        type="button"
                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                        className="w-full rounded-2xl border border-[#E0E0E0] px-4 py-3 text-center text-sm font-semibold dark:border-white/20"
                        aria-haspopup="menu"
                        aria-expanded={isUserMenuOpen}
                      >
                        {name}
                      </button>
                      {isUserMenuOpen ? (
                        <div className="absolute right-0 top-full z-20 mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-[#FFFFFF] p-2 shadow-lg dark:border-white/20 dark:bg-[#050505]">
                          <button
                            type="button"
                            onClick={() => signOut()}
                            className="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:bg-[#A5B867]/10 hover:text-[#A5B867] dark:hover:bg-[#c4d677]/10 dark:hover:text-[#c4d677]"
                          >
                            Logout
                          </button>
                        </div>
                      ) : null}
                    </div>
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
                <p>hello@modiqhardware.com</p>
                <p>Plot 21, Industrial Estate, Mumbai</p>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
    </LazyMotion>
  );
}

export function AdminNavbar() {
  return <Navbar variant="admin" />;
}

export function UserNavbar() {
  return <Navbar variant="user" />;
}

export function LoginNavbar() {
  return <Navbar variant="login" />;
}

export function RoleBasedNavbar() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <LoginNavbar />;
  }

  const role = user?.publicMetadata?.role;

  if (role === "admin") {
    return <AdminNavbar />;
  }

  return <UserNavbar />;
}


