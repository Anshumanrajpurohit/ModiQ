import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function upsertUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const backendUrl = process.env.BACKEND_URL;
  const syncToken = process.env.BACKEND_SYNC_TOKEN;

  if (!backendUrl) {
    throw new Error("BACKEND_URL is missing. Update .env.local");
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  const metadata = (user.unsafeMetadata ?? {}) as Record<string, string | undefined>;
  const phoneNumber = metadata.phoneNumber || user.phoneNumbers[0]?.phoneNumber || null;
  const studio = metadata.company || metadata.studio || "";
  const normalizedEmail = primaryEmail?.emailAddress?.toLowerCase() ?? "";
  const isAdmin = getAdminEmails().includes(normalizedEmail);

  const payload = {
    clerkUserId: user.id,
    email: primaryEmail?.emailAddress ?? null,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    imageUrl: user.imageUrl ?? null,
    phoneNumber,
    company: studio,
    studio,
    role: isAdmin ? "admin" : "partner",
    lastLoginAt: new Date().toISOString(),
  };

  const response = await fetch(`${backendUrl}/api/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-backend-token": syncToken ?? "",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to sync user", await response.text());
  }
  return { isAdmin };
}

export default async function AuthCompletePage() {
  const { isAdmin } = await upsertUser();
  redirect(isAdmin ? "/admin" : "/");
}
