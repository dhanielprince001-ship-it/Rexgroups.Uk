# Rex Groups website — setup and free hosting

This is a responsive React website for Rex Groups with separate pages for Home, Services, Logistics, Hotel & Restaurant, Vacations, About, Contact, Login, Register and Dashboard.

## Included
- Responsive layout for phones, tablets, laptops and large screens
- Rex Groups branding and service imagery
- Contact details: `rexgroups.uk@gmail.com` and `+2348033564331`
- WhatsApp contact button
- Contact enquiry form (opens an email draft before a database is connected)
- Login/register UI and Supabase authentication integration
- Supabase schema for enquiry storage and admin dashboard
- Payment integration is intentionally not switched on: a payment provider account and server-side verification are needed before accepting real money.

## Fastest way to publish free (GitHub + Vercel)
You can do these steps from a laptop, or use a mobile browser in desktop mode. If you only have an iPhone, a GitHub repository can be created and files uploaded through github.com, though bulk file management is easier on a computer.

1. Create or sign in to a GitHub account at https://github.com.
2. Create a **public or private repository** named `rex-groups-website`.
3. Upload the contents of this project folder to the repository. Do not upload `node_modules` (it is not included).
4. Open https://vercel.com and sign in with GitHub.
5. Choose **Add New → Project**, import `rex-groups-website`, and deploy.
6. Vercel should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.
7. Vercel gives you a public `*.vercel.app` link after a successful deployment. The site is not live until Vercel reports a successful deployment.

## Connect account registration and enquiry storage with Supabase
1. Create a project at https://supabase.com. Use the free plan if available for your account/region.
2. In Supabase, open **SQL Editor**, paste and run `supabase/schema.sql`.
3. In **Project Settings → API**, copy the project URL and publishable/anon key.
4. Copy `.env.example` to `.env.local`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Add those same variables in Vercel: **Project → Settings → Environment Variables**, then redeploy.
6. In Supabase **Authentication → URL Configuration**, add your Vercel deployment URL to the allowed redirect/site URLs.
7. Register using the website. To enable your own admin dashboard, run the admin-promotion SQL at the bottom of `supabase/schema.sql` after replacing/confirming the email. Keep admin rights restricted to trusted people.

The Supabase anon/publishable key is intended for frontend use when Row Level Security is correctly configured. **Never put a Supabase service-role key or any secret/private key in frontend code or Vercel `VITE_` variables.**

## Payments
Payment processing is not active in this starter. Before accepting payments, set up a verified merchant account with a provider such as Paystack, use test mode first, and implement server-side transaction verification. Never trust a browser-only “payment successful” message, and never collect or store card numbers or CVV in this website. A backend/serverless function is needed to verify payments securely. Follow the provider's current official documentation and local requirements.

## Important before launch
- Replace sample stock photos with images Rex Groups has permission to use.
- Confirm the business address, service descriptions, rates, terms, privacy policy and refund/cancellation policy.
- Test all pages on a phone.
- Contact form sends an email draft when Supabase is not connected; it does not silently store messages.
- A free host does not automatically provide a custom domain or guarantee that a database/payment provider remains on a free tier forever.

## Run locally (optional)
Install Node.js, then in this folder:
```bash
npm install
npm run dev
```
Open the local URL Vite prints. To verify a production build:
```bash
npm run build
```
