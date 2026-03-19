import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

type AuthCompletePageProps = {
  searchParams?: {
    returnTo?: string
  }
}

const sanitizeReturnTo = (value?: string) => {
  if (!value) return null
  return value.startsWith("/") ? value : null
}

export default async function AuthCompletePage({ searchParams }: AuthCompletePageProps) {
  const user = await currentUser()

  if (!user) {
    redirect("/sgp")
  }

  const isAdmin = user.publicMetadata?.role === "admin"
  const fallbackDestination = isAdmin ? "/admin" : "/"
  const destination = sanitizeReturnTo(searchParams?.returnTo) ?? fallbackDestination

  redirect(destination)
}
