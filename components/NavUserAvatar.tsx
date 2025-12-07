"use client"

import Link from "next/link"
import { SignedIn, useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function getInitials(name?: string | null) {
  if (!name) return "M"
  return name
    .split(" ")
    .map((segment) => segment.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function NavUserAvatar() {
  const { user } = useUser()
  const initials = getInitials(user?.fullName)

  return (
    <SignedIn>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1 transition hover:border-[#A5B867]/60"
        aria-label="Open account menu"
      >
        <Avatar className="h-9 w-9 border border-[#A5B867]/50 bg-white">
          <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.fullName ?? "Account avatar"} />
          <AvatarFallback className="text-xs font-semibold uppercase text-[#4A4A4A]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] group-hover:text-[#A5B867]">
          {user?.firstName ?? "Account"}
        </span>
      </Link>
    </SignedIn>
  )
}
