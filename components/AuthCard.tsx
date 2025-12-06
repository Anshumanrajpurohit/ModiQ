"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";

type AuthVariant = "login" | "register";

type AuthCardProps = {
  initialVariant?: AuthVariant;
};

const tabs = [
  { label: "Login", id: "login" as AuthVariant },
  { label: "Register", id: "register" as AuthVariant },
];

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Access the ModiQ partner console to manage orders and specs.",
    helper: "Need assistance? Our team replies in under 1 hour.",
    bottomLabel: "Don’t have an account?",
    bottomCta: "Register for free",
    bottomHref: "/register",
  },
  register: {
    title: "Create account",
    subtitle: "Unlock curated product lists, price sheets, and project tracking.",
    helper: "Completing your profile helps us personalise launches and stock alerts.",
    bottomLabel: "Already have access?",
    bottomCta: "Back to login",
    bottomHref: "/login",
  },
};

type StatusMessage = { tone: "error" | "success"; message: string } | null;

type RegisterFormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  phone: string;
};

type LoginFormState = {
  email: string;
  password: string;
};

const initialRegisterState: RegisterFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  company: "",
  phone: "",
};

const initialLoginState: LoginFormState = {
  email: "",
  password: "",
};

function formatError(error: unknown) {
  if (error && typeof error === "object" && "errors" in error) {
    const first = (error as { errors?: Array<{ message?: string }> }).errors?.[0];
    if (first?.message) return first.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}

export function AuthCard({ initialVariant = "login" }: AuthCardProps) {
  const router = useRouter();
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  const [activeVariant, setActiveVariant] = useState<AuthVariant>(initialVariant);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterState);
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginState);

  useEffect(() => {
    setActiveVariant(initialVariant);
    resetTransientState();
  }, [initialVariant]);

  useEffect(() => {
    resetTransientState();
  }, [activeVariant]);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeVariant),
    [activeVariant]
  );
  const content = copy[activeVariant];

  function resetTransientState() {
    setStatus(null);
    setPendingVerification(false);
    setVerificationCode("");
    setRegisterForm(initialRegisterState);
    setLoginForm(initialLoginState);
  }

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-[#E0E0E0] bg-[#FFFFFF] p-8 text-[#2E2E2E] shadow-[0_30px_60px_rgba(47,47,47,0.08)] sm:p-12">
      <div className="pointer-events-none absolute -top-20 right-6 h-52 w-52 rounded-full bg-[#9BC120]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-4 h-64 w-64 rounded-full bg-[#B9B9BB]/25 blur-3xl" />

      <div className="relative space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-[#D4AF37]">Partner access</p>
          <h1 className="text-3xl font-semibold text-[#2E2E2E]">{content.title}</h1>
          <p className="text-sm text-[#6F6F6F]">{content.subtitle}</p>
        </div>

        <div className="relative grid grid-cols-2 rounded-full border border-[#E0E0E0] bg-[#F4F4F4] p-1 text-sm font-semibold uppercase tracking-wide text-[#6F6F6F]">
          <motion.span
            className="absolute inset-y-1 w-1/2 rounded-full bg-[#9BC120]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`relative z-10 rounded-full py-2 text-center transition ${
                tab.id === activeVariant ? "text-[#2E2E2E]" : "text-[#6F6F6F]"
              }`}
              onClick={() => setActiveVariant(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-[28px] border border-[#F0F0F0] bg-white/80 p-4 shadow-inner">
          {activeVariant === "login" ? (
            <LoginForm
              values={loginForm}
              onChange={setLoginForm}
              onSubmit={(event) => handleLoginSubmit(event)}
              isSubmitting={isSubmitting}
              onForgotPassword={() => router.push("/register")}
              onOAuthRequest={handleOAuth}
            />
          ) : (
            <RegisterForm
              values={registerForm}
              onChange={setRegisterForm}
              onSubmit={(event) => handleRegisterSubmit(event)}
              isSubmitting={isSubmitting}
              pendingVerification={pendingVerification}
              verificationCode={verificationCode}
              onVerificationCodeChange={setVerificationCode}
              onOAuthRequest={handleOAuth}
            />
          )}
        </div>

        {status && (
          <p className={`text-sm ${status.tone === "error" ? "text-[#D53F3F]" : "text-[#2F8A1C]"}`}>
            {status.message}
          </p>
        )}

        <p className="text-xs text-[#6F6F6F]">{content.helper}</p>

        <div className="flex flex-wrap items-center justify-between text-sm text-[#6F6F6F]">
          <span>{content.bottomLabel}</span>
          <button
            type="button"
            onClick={() => setActiveVariant(content.bottomHref === "/register" ? "register" : "login")}
            className="font-semibold text-[#9BC120]"
          >
            {content.bottomCta}
          </button>
        </div>
      </div>
    </div>
  );

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signInLoaded || !signIn || !setActiveSignIn) {
      setStatus({ tone: "error", message: "Auth still loading" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: loginForm.email,
        password: loginForm.password,
      });
      if (result.status === "complete" && result.createdSessionId) {
        await setActiveSignIn({ session: result.createdSessionId });
        router.push("/auth/complete");
      } else {
        setStatus({ tone: "error", message: "Unable to sign in. Please try again." });
      }
    } catch (error) {
      setStatus({ tone: "error", message: formatError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signUpLoaded || !signUp || !setActiveSignUp) {
      setStatus({ tone: "error", message: "Auth still loading" });
      return;
    }

    if (pendingVerification) {
      if (!verificationCode) {
        setStatus({ tone: "error", message: "Enter the 6-digit code from your inbox." });
        return;
      }
      setIsSubmitting(true);
      try {
        const attempt = await signUp.attemptEmailAddressVerification({ code: verificationCode });
        if (attempt?.status === "complete" && attempt.createdSessionId) {
          await setActiveSignUp({ session: attempt.createdSessionId });
          router.push("/auth/complete");
        } else {
          setStatus({ tone: "error", message: "Verification failed. Try again." });
        }
      } catch (error) {
        setStatus({ tone: "error", message: formatError(error) });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setStatus({ tone: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    try {
      const [firstName, ...rest] = registerForm.fullName.trim().split(/\s+/);
      const lastName = rest.join(" ");

      await signUp.create({
        emailAddress: registerForm.email,
        password: registerForm.password,
        firstName: firstName || registerForm.email.split("@")[0],
        lastName,
        phoneNumber: registerForm.phone || undefined,
        unsafeMetadata: {
          company: registerForm.company,
          phoneNumber: registerForm.phone,
          fullName: registerForm.fullName,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      setStatus({ tone: "success", message: "Enter the 6-digit code we emailed you." });
    } catch (error) {
      setStatus({ tone: "error", message: formatError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuth(provider: "oauth_google" | "oauth_facebook") {
    if (!signInLoaded || !signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/auth/complete",
        redirectUrlComplete: "/auth/complete",
      });
    } catch (error) {
      setStatus({ tone: "error", message: formatError(error) });
    }
  }
}

type LoginFormProps = {
  values: LoginFormState;
  onChange: (values: LoginFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting: boolean;
  onForgotPassword: () => void;
  onOAuthRequest: (provider: "oauth_google" | "oauth_facebook") => void;
};

function LoginForm({ values, onChange, onSubmit, isSubmitting, onForgotPassword, onOAuthRequest }: LoginFormProps) {
  return (
    <form className="space-y-4 text-[#2E2E2E]" onSubmit={onSubmit}>
      <label className="block text-sm font-semibold">
        Email
        <input
          type="email"
          required
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
          placeholder="username@gmail.com"
          className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
        />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input
          type="password"
          required
          value={values.password}
          onChange={(event) => onChange({ ...values, password: event.target.value })}
          placeholder="••••••••"
          className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="self-start text-sm font-semibold text-[#6F6F6F] transition hover:text-[#2E2E2E]"
          onClick={onForgotPassword}
        >
          Forgot password?
        </button>
        <button
          type="submit"
          className="rounded-2xl bg-[#6F9A1A] px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#4E6F11] disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <SocialButtons onOAuthRequest={onOAuthRequest} />
    </form>
  );
}

type RegisterFormProps = {
  values: RegisterFormState;
  onChange: (values: RegisterFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting: boolean;
  pendingVerification: boolean;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  onOAuthRequest: (provider: "oauth_google" | "oauth_facebook") => void;
};

function RegisterForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
  pendingVerification,
  verificationCode,
  onVerificationCodeChange,
  onOAuthRequest,
}: RegisterFormProps) {
  return (
    <form className="space-y-4 text-[#2E2E2E]" onSubmit={onSubmit}>
      {!pendingVerification ? (
        <>
          <label className="block text-sm font-semibold">
            Full Name
            <input
              type="text"
              required
              value={values.fullName}
              onChange={(event) => onChange({ ...values, fullName: event.target.value })}
              placeholder="Alex Designer"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              required
              value={values.email}
              onChange={(event) => onChange({ ...values, email: event.target.value })}
              placeholder="studio@example.com"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Phone Number
            <input
              type="tel"
              value={values.phone}
              onChange={(event) => onChange({ ...values, phone: event.target.value })}
              placeholder="+91 98765 43210"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Studio / Company
            <input
              type="text"
              value={values.company}
              onChange={(event) => onChange({ ...values, company: event.target.value })}
              placeholder="ModiQ Kitchens"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              value={values.password}
              onChange={(event) => onChange({ ...values, password: event.target.value })}
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Confirm Password
            <input
              type="password"
              required
              value={values.confirmPassword}
              onChange={(event) => onChange({ ...values, confirmPassword: event.target.value })}
              placeholder="Repeat your password"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
        </>
      ) : (
        <label className="block text-sm font-semibold">
          Verification code
          <input
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(event) =>
              onVerificationCodeChange(event.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter 6-digit code"
            className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
          />
          <span className="mt-2 block text-xs text-[#6F6F6F]">
            We sent a code to your inbox. Enter it to activate your account.
          </span>
        </label>
      )}

      <button
        type="submit"
        className="w-full rounded-2xl bg-[#6F9A1A] px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#4E6F11] disabled:opacity-60"
        disabled={isSubmitting || (pendingVerification && verificationCode.length < 4)}
      >
        {pendingVerification
          ? isSubmitting
            ? "Verifying..."
            : "Verify & Continue"
          : isSubmitting
          ? "Creating..."
          : "Create account"}
      </button>

      {!pendingVerification && <SocialButtons onOAuthRequest={onOAuthRequest} />}
    </form>
  );
}

function SocialButtons({
  onOAuthRequest,
}: {
  onOAuthRequest: (provider: "oauth_google" | "oauth_facebook") => void;
}) {
  const social = [
    {
      label: "Google",
      emoji: "G",
      baseClass: "bg-white text-[#2E2E2E] border-[#E0E0E0]",
      provider: "oauth_google" as const,
    },
    {
      label: "Facebook",
      emoji: "f",
      baseClass: "bg-[#1877F2] text-white border-[#0F5AC6]",
      provider: "oauth_facebook" as const,
    },
  ];

  return (
    <div className="space-y-3 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-[#B9B9BB]">or continue with</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {social.map((provider) => (
          <button
            key={provider.label}
            type="button"
            className={`group relative flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 ${provider.baseClass}`}
            onClick={() => onOAuthRequest(provider.provider)}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-xs font-bold text-[#6F6F6F]">
              {provider.emoji}
            </span>
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}
