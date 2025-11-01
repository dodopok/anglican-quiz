<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1upWegry6AdafJmYOK6UOTZQXZ2PHNyoW

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install` or `pnpm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set the `STRIPE_SECRET_KEY` in [.env.local](.env.local) to your Stripe secret key
4. Run the app:
   `npm run dev` or `pnpm run dev`

## Deploy to Vercel

When deploying to Vercel, make sure to add the following environment variables in your Vercel project settings:

- `GEMINI_API_KEY`: Your Gemini API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_live_...`)

Go to your Vercel project → Settings → Environment Variables to add these.
