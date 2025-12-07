import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

type AuthCompletePageProps = {
  searchParams?: {
    returnTo?: string
  }
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
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

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0]

  const normalizedEmail = primaryEmail?.emailAddress?.toLowerCase() ?? ""
  const isAdmin = getAdminEmails().includes(normalizedEmail)
  const fallbackDestination = isAdmin ? "/admin" : "/"
  const destination = sanitizeReturnTo(searchParams?.returnTo) ?? fallbackDestination

  redirect(destination)
}
