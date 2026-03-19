import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export type AppRole = "admin" | "customer"

export type AppUser = {
  clerkUserId: string
  role: AppRole
  email: string
  displayName: string
}

const getPrimaryEmail = (user: Awaited<ReturnType<typeof currentUser>>) => {
  if (!user) {
    return ""
  }

  const primary =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ?? user.emailAddresses[0]

  return primary?.emailAddress?.toLowerCase() ?? ""
}

export const sanitizeReturnTo = (value?: string | null) => {
  if (!value) return null
  return value.startsWith("/") ? value : null
}

export const buildLoginUrl = (returnTo: string) => {
  const safeReturnTo = sanitizeReturnTo(returnTo) ?? "/"
  return `/login?next=${encodeURIComponent(safeReturnTo)}`
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const user = await currentUser()

  if (!user) {
    return null
  }

  const email = getPrimaryEmail(user)
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    (typeof user.unsafeMetadata?.fullName === "string" ? user.unsafeMetadata.fullName : "") ||
    email

  return {
    clerkUserId: user.id,
    role: user.publicMetadata?.role === "admin" ? "admin" : "customer",
    email,
    displayName,
  }
}

export async function requireAdminPageUser(returnTo = "/admin"): Promise<AppUser> {
  const user = await getCurrentAppUser()

  if (!user) {
    redirect(buildLoginUrl(returnTo))
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return user
}

export async function requireAdminApiUser() {
  const user = await getCurrentAppUser()

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    }
  }

  if (user.role !== "admin") {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    }
  }

  return { user, errorResponse: null }
}
