import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [process.env.FRONTEND_URL ?? "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan("dev"));

app.use("/api/webhooks", express.raw({ type: "application/json" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/users", express.json({ limit: "1mb" }), userRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

await connectDatabase(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`🚀 Backend ready on http://localhost:${PORT}`);
});
