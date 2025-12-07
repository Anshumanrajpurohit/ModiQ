"use client"

import { usePathname } from "next/navigation"
import { ReactNode, useMemo } from "react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { SiteAnnouncement } from "@/components/SiteAnnouncement"
import { LoginPrompt } from "@/components/LoginPrompt"

const BARE_ROUTES = ["/sgp", "/login", "/register", "/auth/complete"]

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
      <Navbar />
      <main className="mx-auto mt-24 max-w-6xl px-6 pb-24">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <SiteAnnouncement />
      <LoginPrompt />
    </>
  )
}
