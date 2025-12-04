import { AuthCard } from "@/components/AuthCard";
import { Reveal } from "@/components/Reveal";

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden bg-[#F4F4F4] py-20 text-[#2E2E2E]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-6 h-60 w-60 rounded-full bg-[#9BC120]/15 blur-3xl" />
        <div className="absolute right-6 top-1/4 h-72 w-72 rounded-[32px] bg-[#FFFFFF] shadow-inner shadow-white/70" />
        <div className="absolute -bottom-14 left-1/4 h-72 w-72 rounded-full bg-[#8B6E53]/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 text-center">
        <Reveal>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.6em] text-[#D4AF37]">Partner Portal</p>
            <h1 className="text-4xl font-semibold text-[#2E2E2E]">Register your workspace</h1>
            <p className="text-sm text-[#6F6F6F]">
              Share a few details to unlock curated launches, samples, and concierge support.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <AuthCard initialVariant="register" />
        </Reveal>
      </div>
    </div>
  );
}
