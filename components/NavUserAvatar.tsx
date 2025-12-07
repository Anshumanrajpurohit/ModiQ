"use client"

import { useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function getInitials(name?: string) {
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
  const { user, logout } = useAuth()
  const initials = useMemo(() => getInitials(user?.displayName), [user?.displayName])

  if (!user) {
    return null
  }

  return (
    <div className="group inline-flex items-center gap-3 rounded-full border border-transparent px-3 py-1 transition hover:border-[#A5B867]/60">
      <Avatar className="h-9 w-9 border border-[#A5B867]/50 bg-white">
        <AvatarFallback className="text-xs font-semibold uppercase text-[#4A4A4A]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-xs font-semibold uppercase tracking-wide text-[#4A4A4A]">
        <span className="text-[11px] text-[#A5B867]">{user.role}</span>
        <span>{user.displayName}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-[#E0E0E0] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#4A4A4A] transition hover:border-[#A5B867] hover:text-[#A5B867]"
      >
        Logout
      </button>
    </div>
  )
}
