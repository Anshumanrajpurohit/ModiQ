"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

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
  login: (email: string, password: string) => LoginResult
  logout: () => void
  credentials: ReadonlyArray<MockCredential>
}

const STORAGE_KEY = "modiq-auth-user"

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

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const readyRef = useRef(false)

  useEffect(() => {
    if (readyRef.current) return
    readyRef.current = true
    const stored = readStoredUser()
    if (stored) {
      setUser(stored)
    }
  }, [])

  const login = useCallback((email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase()
    const credential = MOCK_CREDENTIALS.find(
      (candidate) => candidate.email === normalizedEmail && candidate.password === password
    )

    if (!credential) {
      return { success: false, reason: "invalid-credentials" }
    }

    const authUser: AuthUser = {
      role: credential.role,
      email: credential.email,
      displayName: credential.displayName,
    }

    setUser(authUser)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    }

    return { success: true, user: authUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      credentials: MOCK_CREDENTIALS,
    }),
    [login, logout, user]
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
