import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } })
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0]

  const email = primaryEmail?.emailAddress?.toLowerCase() ?? ""
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    email
  const role = user.publicMetadata?.role === "admin" ? "admin" : "customer"

  return NextResponse.json(
    {
      user: {
        role,
        email,
        displayName,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
