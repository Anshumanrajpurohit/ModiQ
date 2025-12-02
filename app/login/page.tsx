import { AuthCard } from "@/components/AuthCard";
import { Reveal } from "@/components/Reveal";

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden bg-[#F4F4F4] py-20 text-[#2E2E2E]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-24 h-48 w-48 rounded-full bg-[#B9B9BB]/40 blur-3xl" />
        <div className="absolute right-6 top-16 h-64 w-64 rounded-[32px] bg-[#FFFFFF] shadow-inner shadow-white/70" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#8B6E53]/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 text-center">
        <Reveal>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.6em] text-[#D4AF37]">Partner Portal</p>
            <h1 className="text-4xl font-semibold text-[#2E2E2E]">Login to continue</h1>
            <p className="text-sm text-[#6F6F6F]">
              Manage RFQs, track orders, and unlock exclusive pricing curated for your studio.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <AuthCard variant="login" />
        </Reveal>
      </div>
    </div>
  );
}
