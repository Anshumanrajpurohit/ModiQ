import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | ModiQ",
  description: "Restricted admin landing page",
};

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sgp");
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  const normalizedEmail = primaryEmail?.emailAddress?.toLowerCase() ?? "";

  if (!getAdminEmails().includes(normalizedEmail)) {
    redirect("/");
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin";

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center text-[#2E2E2E]">
      <p className="text-xs uppercase tracking-[0.5em] text-[#D4AF37]">Admin Portal</p>
      <h1 className="text-4xl font-semibold">Welcome, {fullName}</h1>
      <p className="max-w-2xl text-sm text-[#6F6F6F]">
        You are signed in with admin privileges. A dedicated management console will surface here once the
        remaining tooling ships; for now this page simply confirms that elevated access is active.
      </p>
    </section>
  );
}
