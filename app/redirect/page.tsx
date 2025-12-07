"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get("next") || "/"
    const timeout = setTimeout(() => router.replace(next), 1200)

    return () => clearTimeout(timeout)
  }, [router, searchParams])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-16">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="size-12 animate-spin rounded-full border-2 border-dashed border-primary/40 border-t-primary" />
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Redirecting</p>
          <h1 className="text-2xl font-semibold">Welcome! Getting things ready…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hang tight while we finish signing you in. You will be on your way in just a second.
          </p>
        </div>
      </div>
    </div>
  )
}
