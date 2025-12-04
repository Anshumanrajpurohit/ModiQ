"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import type { Appearance } from "@clerk/types";

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

const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#6F9A1A",
    colorText: "#2E2E2E",
    borderRadius: "1.75rem",
  },
  elements: {
    card: "shadow-none border-0 bg-transparent p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "rounded-2xl border border-[#E0E0E0] bg-white text-[#2E2E2E] font-semibold text-sm py-3",
    socialButtonsProviderIcon: "text-[#6F6F6F]",
    formFieldLabel: "text-sm font-semibold text-[#2E2E2E]",
    formFieldInput: "rounded-2xl border border-[#E0E0E0] bg-white px-4 py-3 text-[#2E2E2E] placeholder:text-[#B9B9BB] focus:border-[#9BC120]",
    footer: "hidden",
    footerAction: "hidden",
    formButtonPrimary: "rounded-2xl bg-[#6F9A1A] py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-[#4E6F11]",
    identityPreviewEditButton: "text-[#6F9A1A]",
  },
};

export function AuthCard({ initialVariant = "login" }: AuthCardProps) {
  const [activeVariant, setActiveVariant] = useState<AuthVariant>(initialVariant);

  useEffect(() => {
    setActiveVariant(initialVariant);
  }, [initialVariant]);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeVariant),
    [activeVariant]
  );
  const content = copy[activeVariant];

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
            <SignIn
              appearance={clerkAppearance}
              routing="hash"
              signUpUrl="#register"
              afterSignInUrl="/auth/complete"
              redirectUrl="/auth/complete"
            />
          ) : (
            <SignUp
              appearance={clerkAppearance}
              routing="hash"
              signInUrl="#login"
              afterSignUpUrl="/auth/complete"
              redirectUrl="/auth/complete"
            />
          )}
        </div>

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
}
