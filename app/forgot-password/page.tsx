"use client"

import Link from "next/link"

const RECOVERY_TIPS = [
  "Check the inbox linked to your showroom access for the one-time code.",
  "Keep your new password at eight characters or longer for the best security.",
  "Need help from the Modiq concierge? Tap the floating WhatsApp bubble on the homepage.",
]

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#111] to-[#1b1b1b] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Modiq</p>
        <h1 className="mt-4 text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-white/70">
          The interactive reset flow has been switched off for this preview build. Use the mock layout below
          to visualize the experience your customers will see once live.
        </p>

        <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
          {RECOVERY_TIPS.map((tip) => (
            <p key={tip} className="flex gap-2">
              <span className="text-[#c4d677]">•</span>
              <span>{tip}</span>
            </p>
          ))}
        </div>

        <form className="mt-8 space-y-5" aria-disabled>
          <label className="block text-sm font-medium text-white/80">
            Email address
            <input
              type="email"
              placeholder="you@modiqhardware.com"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus-visible:border-[#c4d677] focus-visible:outline-none"
              disabled
            />
          </label>

          <label className="block text-sm font-medium text-white/80">
            Verification code
            <input
              type="text"
              placeholder="123456"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base tracking-[0.3em] text-white placeholder:text-white/40 focus-visible:border-[#c4d677] focus-visible:outline-none"
              disabled
            />
          </label>

          <label className="block text-sm font-medium text-white/80">
            New password
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus-visible:border-[#c4d677] focus-visible:outline-none"
              disabled
            />
          </label>

          <label className="block text-sm font-medium text-white/80">
            Confirm password
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus-visible:border-[#c4d677] focus-visible:outline-none"
              disabled
            />
          </label>

          <button
            type="button"
            disabled
            className="w-full rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#131313] opacity-60"
          >
            Reset temporarily disabled
          </button>

          <p className="text-xs text-white/50">
            This static preview is safe to prerender and ships with zero backend calls.
          </p>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
          <Link href="/login" className="underline-offset-2 hover:underline">
            Return to login
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Modiq Studio Gateway</p>
        </div>
      </div>
    </main>
  )
}
