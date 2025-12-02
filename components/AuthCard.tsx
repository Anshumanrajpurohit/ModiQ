"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";

type AuthVariant = "login" | "register";

type AuthCardProps = {
  variant: AuthVariant;
};

const tabs = [
  { label: "Login", href: "/login", id: "login" as AuthVariant },
  { label: "Register", href: "/register", id: "register" as AuthVariant },
];

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Access the ModiQ partner console to manage orders and specs.",
    button: "Sign in",
    helper: "Forgot password?",
    helperHref: "#",
    info: "Need assistance? Our team replies in under 1 hour.",
    bottomLabel: "Don’t have an account?",
    bottomCta: "Register for free",
    bottomHref: "/register",
  },
  register: {
    title: "Create account",
    subtitle: "Unlock curated product lists, price sheets, and project tracking.",
    button: "Create account",
    helper: "Already onboarded?",
    helperHref: "/login",
    info: "Your details help us personalise launches and stock alerts.",
    bottomLabel: "Already have access?",
    bottomCta: "Back to login",
    bottomHref: "/login",
  },
};

const social = [
  {
    label: "Google",
    emoji: "G",
    baseClass: "bg-white text-[#2E2E2E] border-[#E0E0E0]",
    accent: "linear-gradient(90deg,#4285F4 0%,#34A853 25%,#FBBC05 60%,#EA4335 100%)",
    accentAlwaysVisible: false,
  },
  {
    label: "Facebook",
    emoji: "f",
    baseClass: "bg-[#1877F2] text-white border-[#0F5AC6]",
    accent: "#0F5AC6",
    accentAlwaysVisible: true,
  },
];

export function AuthCard({ variant }: AuthCardProps) {
  const activeIndex = useMemo(() => tabs.findIndex((tab) => tab.id === variant), [variant]);
  const content = copy[variant];

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
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative z-10 rounded-full py-2 text-center transition ${
                tab.id === variant ? "text-[#2E2E2E]" : "text-[#6F6F6F]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form className="space-y-4 text-[#2E2E2E]">
          {variant === "register" && (
            <label className="block text-sm font-semibold">
              Full Name
              <input
                type="text"
                placeholder="Alex Designer"
                className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              placeholder="username@gmail.com"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
            />
          </label>
          {variant === "register" && (
            <label className="block text-sm font-semibold">
              Confirm Password
              <input
                type="password"
                placeholder="Re-enter password"
                className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
              />
            </label>
          )}
          {variant === "register" && (
            <label className="block text-sm font-semibold">
              Company / Studio
              <input
                type="text"
                placeholder="ModiQ Kitchens"
                className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
              />
            </label>
          )}
          {variant === "register" && (
            <label className="block text-sm font-semibold">
              Phone Number
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="mt-2 w-full rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120] focus:outline-none"
              />
            </label>
          )}
        </form>

        <div className="flex flex-col gap-3">
          {variant === "login" ? (
            <Link href={content.helperHref} className="text-sm font-semibold text-[#6F6F6F] transition hover:text-[#2E2E2E]">
              {content.helper}
            </Link>
          ) : (
            <Link href={content.helperHref} className="text-sm font-semibold text-[#6F6F6F] transition hover:text-[#2E2E2E]">
              {content.helper}
            </Link>
          )}
          <button className="rounded-2xl bg-[#6F9A1A] px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#4E6F11]">
            {content.button}
          </button>
          <p className="text-xs text-[#6F6F6F]">{content.info}</p>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#B9B9BB]">or continue with</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {social.map((provider) => (
              <button
                key={provider.label}
                className={`group relative flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 ${provider.baseClass}`}
                type="button"
              >
                <span
                  className={`pointer-events-none absolute inset-x-4 top-2 h-1 rounded-full transition-opacity duration-300 ${
                    provider.accentAlwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                  style={{ background: provider.accent }}
                />
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-xs font-bold text-[#6F6F6F]">
                  {provider.emoji}
                </span>
                {provider.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-sm text-[#6F6F6F]">
          <span>{content.bottomLabel}</span>
          <Link href={content.bottomHref} className="font-semibold text-[#9BC120]">
            {content.bottomCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
