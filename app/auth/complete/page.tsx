import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

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

  const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ?? user.emailAddresses[0];

  const payload = {
    clerkUserId: user.id,
    email: primaryEmail?.emailAddress ?? null,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    imageUrl: user.imageUrl ?? null,
    phoneNumber: user.phoneNumbers[0]?.phoneNumber ?? null,
    role: "partner",
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
}

export default async function AuthCompletePage() {
  await upsertUser();
  redirect("/");
}
