import { Webhook } from "svix";
import { User } from "../models/User.js";

function upsertFromEvent(data) {
  const email = data.email_addresses?.find((entry) => entry.id === data.primary_email_address_id) ?? data.email_addresses?.[0];
  const metadata = data.unsafe_metadata ?? {};

  return User.updateOne(
    { clerkUserId: data.id },
    {
      $set: {
        email: email?.email_address ?? null,
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        fullName: [data.first_name, data.last_name].filter(Boolean).join(" "),
        imageUrl: data.image_url ?? null,
        phoneNumber: data.phone_numbers?.[0]?.phone_number ?? metadata.phoneNumber ?? null,
        studio: metadata.company ?? metadata.studio ?? "",
        company: metadata.company ?? metadata.studio ?? "",
        lastLoginAt: new Date(),
        deletedAt: null,
      },
      $setOnInsert: {
        createdAt: new Date(),
        role: "partner",
      },
    },
    { upsert: true }
  );
}

export async function handleClerkWebhook(req, res, next) {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("CLERK_WEBHOOK_SECRET missing");
    }

    const payload = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);
    const svixHeaders = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const wh = new Webhook(secret);
    const event = wh.verify(payload, svixHeaders);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await upsertFromEvent(event.data);
        break;
      case "user.deleted":
        await User.updateOne({ clerkUserId: event.data.id }, { $set: { deletedAt: new Date() } });
        break;
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
