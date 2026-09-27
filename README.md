# Gaurgram store

Premium D2C store for Gaurgram: bilona ghee, fresh milk, dahi, lassi, kheer, raw honey and cold-pressed oils,
straight from the goshala. Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Prisma + SQLite · Framer Motion.

## Run it locally

The site uses PostgreSQL. Prisma ships a local Postgres, so nothing else needs installing:

```bash
npm install
cp .env.example .env
npx prisma dev --name gaurgram --detach   # prints a postgres:// URL; put it in .env as DATABASE_URL
                                          # (append &pgbouncer=true&connection_limit=1 for this local server)
npx prisma db push
npm run db:seed
npm run dev          # http://localhost:3740
```

After a restart, bring the database back with `npx prisma dev start gaurgram`.

- Store: http://localhost:3740
- Admin: http://localhost:3740/admin: sign in as `admin@gaurgram.in` with the password from `SEED_ADMIN_PASSWORD` in `.env`. Change it in Admin → Site settings.
- Demo customer: phone `9876500001`. While no SMS provider is connected, the OTP is shown on screen.

`npm run db:reset` wipes the database and reseeds demo data.

## Deploying to Vercel

1. Import the GitHub repo in Vercel (framework: Next.js, default settings).
2. **Database:** Project → Storage → Create Database → **Neon** (Postgres, free tier) → connect it to the project.
   This sets `DATABASE_URL` automatically.
3. **Uploads:** Project → Storage → Create → **Blob** → connect it. This sets `BLOB_READ_WRITE_TOKEN`, so admin
   uploads (photos, making videos, lab PDFs) go to Vercel Blob instead of the server's disk.
4. Project → Settings → Environment Variables, add:
   - `SESSION_SECRET`: a long random string
   - `SEED_ADMIN_PASSWORD`: the admin password to create on the first deploy
   - `SITE_URL`: your live address, e.g. `https://gaurgram.in`
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` when you're ready to take real payments
5. Redeploy. The build creates the tables and loads the catalogue, delivery zones, making videos and admin account
   into the empty database (no demo customers or orders). Later deploys never overwrite your data; a schema
   change that would delete data stops the deploy instead.

## What's inside

**Storefront**: home (video hero in the jharokha arch, making films, live pop-ups, floating elements), shop with a
Blinkit-style category rail, product pages, cart drawer and sticky mobile cart bar, pincode check, one-page checkout,
order confirmation, `/subscribe` plan builder, `/account` (delivery calendar, skip/pause/change, wallet, orders),
`/making`, `/goshala`, `/lab-reports`, `/trace/[batch]`, `/delivery`, policies.

**Delivery rules**: fresh items (milk, dahi, lassi, kheer, makhan, paneer) only for pincodes in Admin → Delivery zones
(Chandigarh, Mohali, Panchkula, Zirakpur). Ghee, honey and oils ship anywhere. Nightly cut-off is 10 PM (editable).

**Subscriptions**: daily, alternate-day or per-weekday quantities; customers skip or change any unlocked day, pause
for dates or indefinitely. Deliveries are paid from a prepaid wallet and debited only when marked delivered in
Admin → Delivery manifest.

**Admin**: dashboard, delivery manifest (production sheet + routes by city, mark delivered), orders, subscriptions,
customers & wallet adjustments, products (photos, video, gallery, sizes, subscriber prices, stock), batches & lab
report PDFs, coupons, delivery zones, making videos (upload film, set step timings), live pop-ups, reviews, site
settings (hero video, announcement, fees, FSSAI number, numbers shown on the site).

## Media

- `public/videos`, `public/images`: placeholder footage (Mixkit, free licence) and photos (Unsplash licence).
  Replace them from the admin panel; uploads are stored in `/uploads` and served from `/uploads/...`.
- Products without an uploaded photo show an illustrated glass/clay pack shot (`src/components/PackShot.tsx`).
- For production, move video to a CDN (Cloudinary, Mux or S3 + CloudFront); `public/videos` is about 90 MB.

## Before going live

1. **Razorpay**: add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`. Without them checkout and wallet
   top-ups run in demo mode and no money moves.
2. **SMS OTP**: connect an SMS provider (MSG91, Twilio…) in `sendOtp` in `src/app/actions.ts` and set
   `SMS_PROVIDER`, so codes are sent by SMS instead of shown on screen.
3. **Database**: switch `prisma/schema.prisma` to PostgreSQL for production hosting.
4. **Content**: real FSSAI number, address, WhatsApp, herd names/photos, lab names and report PDFs, prices.
5. **Claims**: only use the word "organic" once you hold NPOP or PGS-India certification.
6. Change the admin password and set `SESSION_SECRET` to a long random value.
