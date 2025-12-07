import { redirect } from "next/navigation"

type LoginPageProps = {
  searchParams?: {
    next?: string
    returnTo?: string
  }
}

const sanitizeNext = (value?: string) => {
  if (!value) return "/"
  return value.startsWith("/") ? value : "/"
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const safeNext = sanitizeNext(searchParams?.next || searchParams?.returnTo)
  const params = new URLSearchParams({ next: safeNext })
  redirect(`/sgp?${params.toString()}`)
}
