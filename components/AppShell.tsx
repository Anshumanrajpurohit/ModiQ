"use client"

import { usePathname } from "next/navigation"
import { ReactNode, Suspense, useMemo } from "react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { SiteAnnouncement } from "@/components/SiteAnnouncement"
import { LoginPrompt } from "@/components/LoginPrompt"

const BARE_ROUTES = ["/login", "/forgot-password"]

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
      <Suspense fallback={<div className="h-24" aria-hidden />}>
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
