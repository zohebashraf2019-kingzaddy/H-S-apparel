# H&S Apparel — US Storefront

Rebranded US web store for **H&S Apparel** (Karachi, est. 2011): premium menswear priced in USD and shipped to US addresses in 10–15 business days.

## What's inside
- **Storefront**: animated home page, departments (Tees & Polos, Shirts, Pants & Denim, Shoes, Co-ord Sets, Women — coming soon), filters, search, product pages with zoom, size guide and delivery estimates
- **Cart + checkout**: slide-out bag, free-shipping meter, US-only address form, Standard (10–15 days) / Express (6–9 days) shipping, gift notes, **Square** card payments (US and international cards incl. Pakistan)
- **3D Fit Studio** (`/fit-studio`): a mannequin built from the customer's height, chest, waist, hips, shoulders, arm length and inseam. Dress it in any top/bottom/sneaker, change sleeve length (short → long), fit (slim → oversized), rise (low/mid/high), length (5″ shorts → full) and leg shape (skinny → wide), and see fit verdicts and size recommendations. Saved measurements highlight the right size on every product.
- **Contact form** (`/contact`) → email via Resend
- Pages: Our Story, Shipping & Returns + FAQ, Women's waitlist, order confirmation

## Stack
React 19 + Three.js, bundled with esbuild (`build.mjs`). Vercel serverless functions in `/api`.
Catalog lives in `src/data/products.js` (used by the UI **and** the server price check).

```bash
npm install
npm run dev     # http://localhost:5173 (UI only; /api runs on Vercel)
npm run build   # → dist/
```

## Deploy (Vercel)
Import the repo — `vercel.json` already sets the build command and output. Then add environment variables:

| Variable | Where to get it |
|---|---|
| `PUBLIC_SQUARE_APP_ID` | Square Developer → your app → Credentials (Application ID) |
| `PUBLIC_SQUARE_LOCATION_ID` / `SQUARE_LOCATION_ID` | Square Developer → Locations |
| `PUBLIC_SQUARE_ENV` / `SQUARE_ENV` | `sandbox` for testing, `production` to go live |
| `SQUARE_ACCESS_TOKEN` | Square Developer → Credentials (Access token) — **secret** |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `ORDER_NOTIFY_EMAIL`, `RESEND_FROM` | optional, resend.com — contact form + new-order emails |

Without Square keys the site runs in **demo mode** (clearly labelled, no charge) so it can be shown to the client. Redeploy after adding variables — the public Square IDs are baked in at build time.

Sandbox test card: `4111 1111 1111 1111`, any future expiry, CVV `111`, ZIP `94103`.

## Editing products
Add or edit entries in `src/data/products.js`. Local photos go in `public/img/`. `fit3d` controls how the item appears in the 3D Fit Studio (`type`, `color`, `sleeve`, `rise`, `leg`, `texture`).
