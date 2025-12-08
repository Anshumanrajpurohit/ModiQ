"use client"

import { usePathname } from "next/navigation"
import { ReactNode, Suspense, useMemo } from "react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { SiteAnnouncement } from "@/components/SiteAnnouncement"
import { LoginPrompt } from "@/components/LoginPrompt"

const BARE_ROUTES = ["/login", "/forgot-password"]

function NavbarFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#9B9B9B]/40 bg-[#FFFFFF]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[#4A4A4A] dark:text-white">
        <div className="h-8 w-28 rounded-full bg-[#4A4A4A]/15 dark:bg-white/10" aria-hidden />
        <div className="hidden items-center gap-2 md:flex">
          <span className="h-8 w-16 rounded-full bg-[#4A4A4A]/10 dark:bg-white/10" aria-hidden />
          <span className="h-8 w-20 rounded-full bg-[#4A4A4A]/10 dark:bg-white/10" aria-hidden />
          <span className="h-8 w-24 rounded-full bg-[#4A4A4A]/10 dark:bg-white/10" aria-hidden />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-24 rounded-full border border-[#4A4A4A]/15 dark:border-white/15 md:block" aria-hidden />
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full border border-[#4A4A4A]/20 text-[#4A4A4A] dark:border-white/20 dark:text-white md:hidden" aria-hidden>
            <span className="block h-0.5 w-5 rounded bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded bg-current" />
          </div>
        </div>
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const bareExperience = useMemo(
    () => !!pathname && BARE_ROUTES.some((route) => pathname.startsWith(route)),
    [pathname]
  )

  if (bareExperience) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="mx-auto mt-24 max-w-6xl px-6 pb-24">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <SiteAnnouncement />
      <LoginPrompt />
    </>
  )
}
