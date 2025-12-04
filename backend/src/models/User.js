import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    imageUrl: { type: String },
    phoneNumber: { type: String },
    role: { type: String, default: "partner" },
    studio: { type: String },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
