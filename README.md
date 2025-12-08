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
- **Timed engagement popup:** after ~5 seconds a Clerk-aware overlay (`LoginPrompt`) invites signed-out visitors to `/sgp` while letting them dismiss and keep browsing.
- **Support surface:** floating WhatsApp CTAs, request quote cards, and animated hero actions keep sales channels prominent.

## 🧱 Architecture

| Layer | Tech | Notes |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router) + React 19 | Routes live under `app/`, leveraging server components where possible and client components for interactive sections. |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | Palette customized to brand colors; gradients and glassmorphism handled via utility compositions. |
| Animation | Framer Motion | `Reveal` component manages scroll-triggered motions, while sliders/panels rely on simple hooks. |
| State | React Context (`context/CartContext.tsx`) | Manages cart items, totals, synthetic order history, and provides helper functions to UI modules. |
| Data | Local TypeScript modules (`data/`) | Currently seeds categories and products; ready to swap once a remote data service is available. |
| Popup | `LoginPrompt` | Globally mounted in `app/layout.tsx` to nudge signed-out visitors after a timed delay. |

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
```

### Environment Variables

Frontend (`.env.local`):

```

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_API_URL=your_clerk_api_url_here
ADMIN_EMAILS=admin@example.com

```

### Test Login Profiles

Create the following users inside the Clerk dashboard (Email & Password exactly as listed) to exercise both admin and partner flows. Manage their roles straight from Clerk or via its APIs.

| Role | Email | Password | Display name |
| --- | --- | --- | --- |
| Admin | `admin@modiq.test` | `Admin#2024!` | `Aanya Admin` |
| Customer | `customer@modiq.test` | `Partner#2024!` | `Caleb Customer` |

> Clerk owns password storage; manage user roles directly from the Clerk dashboard or via its APIs.

## 📁 Key Directories

- `app/` – App Router pages and layouts (`/`, `/products`, `/login`, `/register`, `/cart`, etc.).
- `components/` – Reusable UI (Hero, PromoBanner, ProductPurchasePanel, AuthCard, SiteAnnouncement, Reveal, etc.).
- `context/CartContext.tsx` – Cart and orders state management plus helper actions.
- `data/` – Static catalog/category data objects; ideal touchpoint for future integrations.
- `public/images` + `public/icons` – Marketing imagery and vector assets.

## 🧪 Testing Checklist

- ✅ Visual regression via manual review (desktop + mobile breakpoints).
- 🔜 Hook up unit/UI testing (e.g., Vitest + Testing Library) once the UI flows stabilize.

## 📌 Roadmap Ideas

- Persist cart/order data via API or browser storage.
- Replace static datasets with remote CMS/ERP feeds.
- Add dashboard analytics widgets for partner accounts.
- Introduce product comparison + downloadables (CAD/PDF).
- Harden auth flow with OTP/email verification.

## 🤝 Contributing

1. Fork, branch (`git checkout -b feature/amazing`), and make your changes.
2. Run `npm run lint` to keep things tidy.
3. Open a PR describing UI/UX impact plus any integration touchpoints.

## 📄 License

This project is private to the ModiQ team. Coordinate with the maintainers before sharing assets or code outside the organization.
