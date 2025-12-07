"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import { useSignUp } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "errors" in error) {
    const typed = error as { errors?: Array<{ longMessage?: string; message?: string }> }
    if (typed.errors?.length) {
      return typed.errors[0].longMessage || typed.errors[0].message || "Something went wrong."
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong. Please try again."
}

const sanitizeNextParam = (value?: string | null) => {
  if (!value) return "/"
  return value.startsWith("/") ? value : "/"
}

type Step = "collect" | "verify"

type PartnerSignUpProps = {
  searchParams?: {
    next?: string
  }
}

export default function PartnerSignUpPage({ searchParams }: PartnerSignUpProps) {
  const router = useRouter()
  const { isLoaded, signUp, setActive } = useSignUp()

  const nextDestination = useMemo(() => sanitizeNextParam(searchParams?.next), [searchParams?.next])

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<Step>("collect")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })

      setStep("verify")
      setInfo("We just emailed you a 6-digit verification code.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId })
        router.replace(`/redirect?next=${encodeURIComponent(nextDestination)}`)
        return
      }

      setError("We could not verify that code. Please try again.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError(null)

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })
      setInfo("A fresh code is on its way to your inbox.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return

    setOauthLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sgp",
        redirectUrlComplete: `/redirect?next=${encodeURIComponent(nextDestination)}`,
      })
    } catch (err) {
      setOauthLoading(false)
      setError(getErrorMessage(err))
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading sign up&hellip;</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div>
            <CardTitle>Create a partner account</CardTitle>
            <CardDescription>
              Use your work email to invite new members or manage agencies. We just need to confirm it is
              really you.
            </CardDescription>
          </div>
          <CardAction>
            <Button asChild variant="link" size="sm">
              <Link href="/sgn">Back to sign in</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {step === "collect" ? (
            <form className="flex flex-col gap-6" onSubmit={handleCreateAccount}>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  disabled={loading || oauthLoading}
                >
                  {oauthLoading ? "Connecting to Google..." : "Continue with Google"}
                </Button>
                <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="h-px flex-1 bg-border" aria-hidden />
                  <span>or use email</span>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {info && !error && <p className="text-sm text-muted-foreground">{info}</p>}
              <div
                id="clerk-captcha"
                data-clerk-captcha
                className="text-xs text-muted-foreground"
                aria-hidden
              />
              <Button type="submit" className="w-full" disabled={loading || oauthLoading}>
                {loading ? "Creating account..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleVerifyCode}>
              <div className="grid gap-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {info && !error && <p className="text-sm text-muted-foreground">{info}</p>}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify and continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend code
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>
            By creating an account you agree to our {""}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms of Service
            </Link>{" "}
            and {""}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
