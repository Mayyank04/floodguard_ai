# FloodGuard AI — Frontend Platform

Next.js App Router application providing satellite disaster rescue intelligence, interactive MapLibre GL mapping, and grounded Gemini AI Copilot for emergency operations.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure:
- `GEMINI_API_KEY`: Required for live Google Gemini AI Copilot chat (`/api/copilot`). Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey).
- `NEXT_PUBLIC_API_URL`: Optional. Leave empty to use Next.js built-in serverless App Router API routes (`/api`).

---

## Production Build

```bash
npm run build
npm run start
```

---

## Vercel Deployment

1. When deploying this repository to Vercel, set the **Root Directory** to `frontend`.
2. Add `GEMINI_API_KEY` under Project Settings → Environment Variables.
3. See [../DEPLOYMENT.md](../DEPLOYMENT.md) for complete instructions.
