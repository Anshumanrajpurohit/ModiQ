# MongoDB Setup Guide

Use this guide when you are ready to persist user/session metadata alongside Clerk-authenticated partners.

## 1. Provision MongoDB

1. Create a free MongoDB Atlas cluster (or run `mongod` locally) and spin up a database named `modiq`.
2. Add a database user with `readWrite` permissions for the `modiq` database.
3. Grab the connection string and replace the password placeholder, e.g.
   ```
   mongodb+srv://modiq-admin:<PASSWORD>@cluster0.mongodb.net/modiq?retryWrites=true&w=majority&appName=modiq
   ```

## 2. Backend Environment Variables

Add your connection details to `backend/.env` (there is a `.env.example` to copy from):

```
PORT=4000
MONGODB_URI="mongodb+srv://modiq-admin:yourStrongPassword@cluster0.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME=modiq
BACKEND_SYNC_TOKEN=change-me
CLERK_WEBHOOK_SECRET=whsec_xxx_from_clerk
FRONTEND_URL=http://localhost:3000
```

- `BACKEND_SYNC_TOKEN` is a shared secret used by the Next.js app when it calls the backend `POST /api/users/sync` endpoint during login.
- `CLERK_WEBHOOK_SECRET` comes from the Clerk dashboard when you create a webhook endpoint (used to verify events).

Restart the backend (`npm run dev` inside `backend/`) whenever environment variables change.

## 3. Backend Server

The `backend/` folder hosts an Express + MongoDB service. Key files:

- `src/server.js` – boots Express, applies CORS, and registers routes.
- `src/config/db.js` – handles the single Mongo connection via Mongoose.
- `src/models/User.js` – schema for partner accounts.
- `src/routes/userRoutes.js` – exposes `GET /api/users` and `POST /api/users/sync`.
- `src/routes/webhookRoutes.js` – exposes `POST /api/webhooks/clerk` for Clerk events.

Run it locally:

```bash
cd backend
npm install
npm run dev
```

The Next.js app expects the backend to be available at `http://localhost:4000`. Update `BACKEND_URL` in `.env.local` if you change the port or deploy it elsewhere.

## 4. Linking Clerk Users to MongoDB

- Clerk securely stores email/password. Do **not** duplicate passwords in MongoDB.
- Store only the Clerk `user.id`, profile details, roles, and any partner metadata you need.
- Recommended collections:
  - `users` – stores partner profile details, studio info, preferences.
  - `admins` – elevated users allowed to manage catalog/orders.

### Example document structure

```json
{
  "clerkUserId": "user_2aBcDeFgHiJkLm",
  "email": "anya.menon@modiqhardware.com",
  "fullName": "Anya Menon",
  "role": "super-admin",
  "studio": "ModiQ Experience Center",
  "phone": "+91 99880 11223",
  "permissions": ["catalog:write", "orders:approve", "reports:view"],
  "status": "active",
  "createdAt": { "$date": "2024-08-01T09:00:00Z" },
  "lastLoginAt": { "$date": "2024-12-03T05:40:00Z" }
}
```

## 5. Sample Admin Seed Data

Use the following array with `mongoimport` or a simple seed script to pre-populate admins:

```json
[
  {
    "clerkUserId": "user_admin_01",
    "email": "admin@modiqhardware.com",
    "fullName": "Rahul Verma",
    "role": "super-admin",
    "studio": "HQ Operations",
    "permissions": ["catalog:write", "orders:approve", "reports:view"],
    "status": "active"
  },
  {
    "clerkUserId": "user_admin_02",
    "email": "sara@modiqhardware.com",
    "fullName": "Sara Kapoor",
    "role": "ops-manager",
    "studio": "Mumbai Flagship",
    "permissions": ["orders:approve", "customers:read"],
    "status": "active"
  },
  {
    "clerkUserId": "user_admin_03",
    "email": "leena@modiqhardware.com",
    "fullName": "Leena Mathews",
    "role": "content-editor",
    "studio": "Bengaluru Studio",
    "permissions": ["catalog:write"],
    "status": "suspended"
  }
]
```

Import example:

```
mongoimport --uri "$MONGODB_URI" \
  --collection admins \
  --file seed/admins.json \
  --jsonArray
```

## 6. Persisting New Users

You now have **two** paths to keep MongoDB in sync:

1. **Server-to-server sync (already wired):** When a visitor signs in or registers, Next.js calls `POST /api/users/sync` with their Clerk profile. The backend verifies the shared `x-backend-token` header and upserts the document.
2. **Webhooks (recommended for long term):**
  - In Clerk dashboard create a webhook targeting `https://<backend-domain>/api/webhooks/clerk` and copy the signing secret into `backend/.env`.
  - The backend verifies the signature with Svix and reacts to `user.created`, `user.updated`, and `user.deleted` automatically.

When partners update their profile data inside your app, call a backend route (e.g., `PATCH /api/users/:id`) that modifies Mongo and, if necessary, invokes Clerk’s Admin API to keep both systems aligned.
