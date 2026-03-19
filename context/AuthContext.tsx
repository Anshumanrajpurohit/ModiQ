"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { UserResource } from "@clerk/types"

type UserRole = "admin" | "customer"

type MockCredential = {
  role: UserRole
  email: string
  password: string
  displayName: string
  helper: string
}

type AuthUser = {
  role: UserRole
  email: string
  displayName: string
}

type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; reason: "invalid-credentials" }

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
  credentials: ReadonlyArray<MockCredential>
}

export const MOCK_CREDENTIALS: ReadonlyArray<MockCredential> = [
  {
    role: "admin",
    email: "admin@modiqhardware.com",
    password: "admin123",
    displayName: "Aarav Admin",
    helper: "Full catalog controls & showroom approvals",
  },
  {
    role: "customer",
    email: "customer@modiqhardware.com",
    password: "guest123",
    displayName: "Meera Studio",
    helper: "Browse collections with saved carts",
  },
]

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const mapClerkUser = (clerkUser: UserResource): AuthUser => {
  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0]

  const email = primaryEmail?.emailAddress?.toLowerCase() ?? ""
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    (typeof clerkUser.unsafeMetadata?.fullName === "string" ? clerkUser.unsafeMetadata.fullName : "") ||
    email

  return {
    role: clerkUser.publicMetadata?.role === "admin" ? "admin" : "customer",
    email,
    displayName,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        setUser(null)
        return null
      }

      const data = (await response.json()) as { user?: AuthUser | null }
      const nextUser = data.user ?? null
      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      return null
    }
  }, [])

  const login = useCallback(async (): Promise<LoginResult> => {
    return { success: false, reason: "invalid-credentials" }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    await signOut()
  }, [signOut])

  const resolvedUser = useMemo(() => {
    if (user) {
      return user
    }

    if (clerkUser) {
      return mapClerkUser(clerkUser)
    }

    return null
  }, [clerkUser, user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: resolvedUser,
      login,
      logout,
      refreshUser,
      credentials: MOCK_CREDENTIALS,
    }),
    [login, logout, refreshUser, resolvedUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
