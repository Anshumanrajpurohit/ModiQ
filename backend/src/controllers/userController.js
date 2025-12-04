import { User } from "../models/User.js";

function assertValidToken(req) {
  const provided = req.headers["x-backend-token"];
  if (!provided || provided !== process.env.BACKEND_SYNC_TOKEN) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function syncUser(req, res, next) {
  try {
    assertValidToken(req);

    const payload = req.body;

    if (!payload?.clerkUserId) {
      return res.status(400).json({ message: "clerkUserId is required" });
    }

    await User.updateOne(
      { clerkUserId: payload.clerkUserId },
      {
        $set: {
          email: payload.email ?? null,
          firstName: payload.firstName ?? "",
          lastName: payload.lastName ?? "",
          fullName: payload.fullName ?? "",
          imageUrl: payload.imageUrl ?? null,
          phoneNumber: payload.phoneNumber ?? null,
          role: payload.role ?? "partner",
          studio: payload.studio ?? "",
          lastLoginAt: payload.lastLoginAt ? new Date(payload.lastLoginAt) : new Date(),
          deletedAt: payload.deletedAt ? new Date(payload.deletedAt) : null,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ message: "User synced" });
  } catch (error) {
    next(error);
  }
}
