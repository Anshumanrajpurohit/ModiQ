"use client"

import Link from "next/link"

import { TrendEditor } from "@/components/admin/TrendEditor"

export default function CreateTrendPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#9B9B9B]/40 bg-[#FFFFFF] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A5B867]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#4A4A4A]">Create Trend Campaign</h1>
        <Link href="/admin/trends" className="mt-4 inline-flex text-sm font-semibold text-[#A5B867]">
          Back to campaigns
        </Link>
      </section>
      <TrendEditor mode="create" />
    </div>
  )
}

