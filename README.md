<div align="center">

# ModiQ Hardware Experience

Modern marketing, catalog, cart, and partner-auth experience for a luxury architectural hardware brand.

</div>

## ✨ Highlights

- **Luxury-first UI:** bespoke palette, floating glow accents, and Reveal-powered transitions across landing, promo slider, category grid, and storytelling sections.
- **Product discovery:** data-driven categories (`data/categories.ts`) and catalog (`data/products.ts`) rendered via reusable cards, grids, and animated spec/highlight modals.
- **Interactive product detail:** hero image, specification modal, quick-order card with cart preview, and contextual CTA routing.
- **Cart + order tracking:** `CartContext` centralizes selections, quantity updates, orders history, and powers the `/cart` dashboard plus local ProductPurchasePanel state.
- **Auth journey:** dedicated `/login` and `/register` routes mirror the reference design, including social sign-on buttons, contextual helper text, and full registration fields.
- **Timed engagement popup:** after ~6 seconds a login card appears globally (`SiteAnnouncement`), giving partners a gentle nudge without needing a close icon.
- **Support surface:** floating WhatsApp CTAs, request quote cards, and animated hero actions keep sales channels prominent.

## 🧱 Architecture

| Layer | Tech | Notes |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router) + React 19 | Routes live under `app/`, leveraging server components where possible and client components for interactive sections. |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | Palette customized to brand colors; gradients and glassmorphism handled via utility compositions. |
| Animation | Framer Motion | `Reveal` component manages scroll-triggered motions, while sliders/panels rely on simple hooks. |
| State | React Context (`context/CartContext.tsx`) | Manages cart items, totals, synthetic order history, and provides helper functions to UI modules. |
| Data | Local TypeScript modules (`data/`) | Currently seeds categories and products; drop-in replacement with API calls when backend is connected. |
| Backend | Express + Mongo (see `backend/`) | Stores Clerk user profiles, exposes `/api/users` + `/api/webhooks/clerk`, and syncs data for future cart/order APIs. |
| Popup | `SiteAnnouncement` | Globally mounted in `app/layout.tsx` to show a login card overlay after a timed delay. |

### Backend Overview

`backend/` now ships with an Express server (ES modules) that connects to MongoDB via Mongoose, verifies Clerk webhooks, and exposes helper endpoints:

1. `POST /api/users/sync` (protected by `x-backend-token`) – used by the Next.js handoff page to upsert partners after login/registration.
2. `GET /api/users` – inspect synced partners (extendable for dashboards).
3. `POST /api/webhooks/clerk` – add this URL to a Clerk Webhook so native events keep MongoDB updated.

From there you can bolt on catalogue, orders, or analytics routes and point the frontend data hooks at them.

## 🚀 Getting Started

```bash
# install dependencies
npm install

# run dev server (http://localhost:3000)
npm run dev


# lint using the Next.js + Tailwind config
npm run lint

# create a production build
npm run build && npm start

# ---- backend ----
cd backend
npm install
npm run dev # http://localhost:4000
```

### Environment Variables

Frontend (`.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
BACKEND_URL=http://localhost:4000
BACKEND_SYNC_TOKEN=modiq-sync-token
```

Backend (`backend/.env`, copy from `.env.example`):

```
PORT=4000
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=modiq
BACKEND_SYNC_TOKEN=modiq-sync-token
CLERK_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

## 📁 Key Directories

- `app/` – App Router pages and layouts (`/`, `/products`, `/login`, `/register`, `/cart`, etc.).
- `components/` – Reusable UI (Hero, PromoBanner, ProductPurchasePanel, AuthCard, SiteAnnouncement, Reveal, etc.).
- `context/CartContext.tsx` – Cart and orders state management plus helper actions.
- `data/` – Static catalog/category data objects; ideal touchpoint for backend integration.
- `backend/` – Express + Mongo service for Clerk webhooks and future catalogue/order APIs.
- `public/images` + `public/icons` – Marketing imagery and vector assets.

## 🧪 Testing Checklist

- ✅ Visual regression via manual review (desktop + mobile breakpoints).
- 🔜 Hook up unit/UI testing (e.g., Vitest + Testing Library) once backend endpoints stabilize.

## 📌 Roadmap Ideas

- Persist cart/order data via API or browser storage.
- Replace static datasets with remote CMS/ERP feeds.
- Add dashboard analytics widgets for partner accounts.
- Introduce product comparison + downloadables (CAD/PDF).
- Harden auth flow with OTP/email verification when backend is ready.

## 🤝 Contributing

1. Fork, branch (`git checkout -b feature/amazing`), and make your changes.
2. Run `npm run lint` to keep things tidy.
3. Open a PR describing UI/UX impact plus any backend touchpoints.

## 📄 License

This project is private to the ModiQ team. Coordinate with the maintainers before sharing assets or code outside the organization.
