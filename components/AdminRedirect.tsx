"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AdminRedirect() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    const role = user?.publicMetadata?.role

    if (role === "admin") {
      router.push("/admin")
    }
  }, [isLoaded, isSignedIn, router, user])

  return null
}
