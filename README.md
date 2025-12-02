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
| Popup | `SiteAnnouncement` | Globally mounted in `app/layout.tsx` to show a login card overlay after a timed delay. |

### Backend & Integration Plan

The current repo focuses on the front-of-house experience. Backend integration is intentionally decoupled so that you can:

1. **Plug in REST/GraphQL APIs** – swap the `data/` utilities for fetchers hitting your Node/Express, NestJS, or Strapi endpoints.
2. **Wire cart/order persistence** – replace `CartContext`’s in-memory arrays with API mutations (e.g., `/api/cart`, `/api/orders`).
3. **Handle authentication** – hook the login/register forms to your auth provider (NextAuth, Cognito, custom JWT). The form structure already includes all partner data fields.
4. **Serve assets** – host product imagery in S3, Cloudinary, or your existing CMS and update the `image` paths in `data/products.ts` accordingly.

Add your backend inside the repo (e.g., `/api` or `/server`) or keep it as a separate service—the frontend only depends on typed helpers, so touching `data/` and context hooks is enough to bridge the systems.

## 🚀 Getting Started

```bash
# install dependencies
npm install

# run dev server (http://localhost:3000)


# lint using the Next.js + Tailwind config
npm run lint

# create a production build
npm run build && npm start
```

### Environment Variables

No secrets are required for the static data version. When you connect real services, create a `.env.local` file (already covered by `.gitignore`) with entries such as:

```
API_BASE_URL=https://api.example.com
NEXT_PUBLIC_WHATSAPP=+919988011223
```

## 📁 Key Directories

- `app/` – App Router pages and layouts (`/`, `/products`, `/login`, `/register`, `/cart`, etc.).
- `components/` – Reusable UI (Hero, PromoBanner, ProductPurchasePanel, AuthCard, SiteAnnouncement, Reveal, etc.).
- `context/CartContext.tsx` – Cart and orders state management plus helper actions.
- `data/` – Static catalog/category data objects; ideal touchpoint for backend integration.
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
