"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacySignUpRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push("/login")
  }, [router])

  return null
}
