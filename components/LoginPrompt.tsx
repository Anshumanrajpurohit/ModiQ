"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

const DISMISS_STORAGE_KEY = "modiq-login-prompt-dismissed"
const IGNORED_ROUTES = ["/login", "/forgot-password"]

export function LoginPrompt() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const { user } = useAuth()

  const shouldIgnoreRoute = useMemo(() => {
    return IGNORED_ROUTES.some((route) => pathname?.startsWith(route))
  }, [pathname])

  const loginHref = useMemo(() => {
    const path = pathname || "/"
    const encoded = encodeURIComponent(path)
    return `/login?next=${encoded}`
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === "true") return
    if (shouldIgnoreRoute) return

    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [shouldIgnoreRoute])

  const handleDismiss = () => {
    setVisible(false)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "true")
    }
  }

  if (!visible || user) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 text-gray-900 shadow-2xl">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss login invite"
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"
        >
          &times;
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-[#c4d677]">Partner access</p>
        <h2 className="mt-3 text-2xl font-semibold">Log in for bespoke pricing</h2>
        <p className="mt-2 text-sm text-gray-600">
          Unlock curated assortments, live stock, and concierge ordering tailored to your studio.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-500"
          >
            Continue browsing
          </button>
          <Link
            href={loginHref}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem(DISMISS_STORAGE_KEY, "true")
              }
            }}
            className="w-full rounded-full bg-[#c4d677] px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-[#d2e17d]"
          >
            Access login
          </Link>
        </div>
      </div>
    </div>
  )
}
