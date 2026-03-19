import type { ReactNode } from "react"

import { requireAdminPageUser } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPageUser("/admin")
  return children
}
