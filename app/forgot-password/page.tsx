"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import { FormEvent, useEffect, useState } from "react"

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors)
  ) {
    const first = (error as { errors: Array<{ longMessage?: string; message?: string }> }).errors[0]
    return first?.longMessage || first?.message || "We could not complete the request."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong. Please try again."
}

type Stage = "request" | "reset" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [stage, setStage] = useState<Stage>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (stage !== "success") return

    const timer = setTimeout(() => router.replace("/auth/complete"), 1800)
    return () => clearTimeout(timer)
  }, [stage, router])

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })

      setStage("reset")
      setInfo(`We sent a six-digit code to ${email}. Enter it below along with your new password.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded) return

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })

      const result = await signIn.resetPassword({
        password,
        signOutOfOtherSessions: true,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        setStage("success")
        setInfo("Password updated. Redirecting you now...")
        return
      }

      setError("We could not finalize the reset. Please try again.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !email) return
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      setInfo("We just sent you a fresh code. Check your inbox.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const resetFormState = () => {
    setStage("request")
    setCode("")
    setPassword("")
    setConfirmPassword("")
    setError(null)
    setInfo(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#111] to-[#1b1b1b] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-[#c4d677]">Modiq</p>
        <h1 className="mt-4 text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter the email you use for Studio Gateway access. We&apos;ll send a one-time code to help you
          set a fresh password instantly.
        </p>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">
            {error}
          </p>
        )}

        {info && !error && (
          <p className="mt-4 rounded-2xl border border-[#c4d677]/30 bg-[#c4d677]/10 px-4 py-3 text-sm text-[#dce78b]">
            {info}
          </p>
        )}

        {stage === "request" && (
          <form className="mt-8 space-y-5" onSubmit={handleRequest}>
            <label className="block text-sm font-medium text-white/80">
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-[#c4d677] focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading || email.trim().length < 3}
              className="w-full rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#131313] shadow-lg transition hover:shadow-[#c4d677]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset code..." : "Send reset code"}
            </button>
          </form>
        )}

        {stage === "reset" && (
          <form className="mt-8 space-y-5" onSubmit={handleReset}>
            <p className="text-sm text-white/70">
              Code sent to <span className="font-semibold text-white">{email}</span>
            </p>

            <label className="block text-sm font-medium text-white/80">
              Verification code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                maxLength={6}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base tracking-[0.3em] text-white placeholder:text-white/40 focus:border-[#c4d677] focus:outline-none"
                required
              />
            </label>

            <label className="block text-sm font-medium text-white/80">
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-[#c4d677] focus:outline-none"
                required
              />
            </label>

            <label className="block text-sm font-medium text-white/80">
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-[#c4d677] focus:outline-none"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading || !code.trim() || password.length < 8}
              className="w-full rounded-2xl bg-gradient-to-r from-[#a8b965] to-[#c4d677] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-[#131313] shadow-lg transition hover:shadow-[#c4d677]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
              <button type="button" className="underline-offset-2 hover:underline" onClick={resetFormState}>
                Use a different email
              </button>
              <button type="button" className="underline-offset-2 hover:underline" onClick={handleResendCode} disabled={loading}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {stage === "success" && (
          <div className="mt-8 space-y-3 rounded-3xl border border-[#c4d677]/40 bg-[#c4d677]/10 p-6 text-center text-white">
            <p className="text-2xl font-semibold">All set</p>
            <p className="text-sm text-white/80">
              Your password has been refreshed. We&apos;re taking you back to the showroom.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
          <Link href="/sgp" className="underline-offset-2 hover:underline">
            Return to login
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Modiq Studio Gateway</p>
        </div>
      </div>
    </main>
  )
}
