# Content OS

Thinking amplification for technical founders. Discover high-signal topics, generate drafts in your voice, edit inline, and publish on your terms. No auto-posting.

**Live flow:** Landing → Google sign-in → Onboarding → Dashboard → Draft → Mark published

---

## Features

| Area | What it does |
|------|----------------|
| **Discovery** | Manual run only — pulls from Hacker News, Instagram, Reddit, RSS, GitHub, Tavily/Firecrawl (when keys are set). Topics ranked against your knowledge base. |
| **Topic board** | Top picks, full pool table, save/dismiss/remove topics, generate drafts from any row. |
| **Knowledge** | Upload context files (style, narrative, technical) used for ranking and draft generation. |
| **Drafts** | AI-generated long-form drafts with hook/CTA variants, inline edit, revision history. |
| **Analytics** | Published post counts, 14-day chart, manual discovery run stats. |
| **Settings** | Encrypted API keys (Tavily, Firecrawl, OpenRouter, NVIDIA, OpenAI), draft provider, timezone. |

---

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript, React 18
- **UI:** Tailwind CSS, custom Stamped design tokens, GSAP (landing page)
- **Auth:** NextAuth.js (Google OAuth)
- **Database:** PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) via Prisma
- **AI:** OpenAI embeddings (ranking/knowledge); user-chosen provider for drafts (OpenRouter / NVIDIA / OpenAI)

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (or any Postgres 15+ with `vector` extension)
- [Google Cloud OAuth](https://console.cloud.google.com/) credentials (Web application)
- `openssl` (or similar) to generate secrets

---

## Local setup

```bash
cd content-os
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see [Environment variables](#environment-variables) below).

Also copy database URLs into `.env` if you use the Prisma CLI - keep `.env` and `.env.local` in sync for `DATABASE_URL` / `DIRECT_URL`.

```bash
# Apply migrations
npm run db:migrate

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase checklist

1. Create a project.
2. **Database → Extensions →** enable `vector`.
3. **Connect → ORMs →** copy the pooler URL (`6543`, `?pgbouncer=true`) → `DATABASE_URL`.
4. Copy the direct URL (`5432`) → `DIRECT_URL`.
5. Run migrations (`npm run db:migrate`) - includes **RLS hardening** so Supabase Security Advisor stops flagging public tables. Content OS only talks to Postgres via Prisma (server-side); `anon` / `authenticated` API access is blocked.
6. Re-run **Security Advisor** in the Supabase dashboard to confirm lints are cleared.

### Google OAuth checklist

1. Create OAuth 2.0 Client ID (Web application).
2. **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
3. For production, add: `https://your-domain.com/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`.

### Generate secrets

```bash
# NEXTAUTH_SECRET (32+ chars)
openssl rand -base64 32

# ENCRYPTION_KEY (exactly 64 hex chars - used to encrypt user API keys at rest)
openssl rand -hex 32
```

**Important:** Never change `ENCRYPTION_KEY` after users have saved API keys, or existing keys cannot be decrypted.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection (pooled, e.g. Supabase port 6543) |
| `DIRECT_URL` | Yes | Direct Postgres URL for migrations (port 5432) |
| `NEXTAUTH_SECRET` | Yes | Session signing secret (32+ characters) |
| `NEXTAUTH_URL` | Yes | App URL, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `ENCRYPTION_KEY` | Yes | 64-char hex AES key for user API keys |
| `OPENAI_API_KEY` | Recommended | Server embeddings for knowledge chunks and discovery ranking |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL (links in emails/UI) |
| `GITHUB_TOKEN` | Optional | Higher GitHub API rate limits for discovery |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | Optional | Reddit discovery adapter |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional | Reserved for future email features |

Users can also add **Tavily**, **Firecrawl**, and draft provider keys in **Settings** (stored encrypted).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations (`migrate deploy`) |
| `npm run db:push` | Push schema without migration files (dev only) |
| `npm run db:studio` | Open Prisma Studio |

---

## Project structure

```
content-os/
├── app/
│   ├── (auth)/          # Login, onboarding
│   ├── (dashboard)/     # Dashboard, drafts, knowledge, analytics, settings
│   ├── api/             # REST routes (discover, generate, trends, knowledge, …)
│   └── page.tsx         # Landing page
├── components/
│   ├── dashboard/       # Topic cards, pool table, discovery button
│   ├── draft/           # Draft workspace
│   ├── landing/         # Marketing page
│   └── ui/              # Design system primitives
├── lib/
│   ├── discovery/       # Adapters, orchestrator, ranking pipeline
│   ├── generation/      # Draft prompts and schema
│   ├── knowledge/       # File upload, chunking, embeddings
│   └── analytics/       # Analytics summaries
├── prisma/
│   ├── schema.prisma    # User, Trend, Draft, Knowledge, CronLog, …
│   └── migrations/
└── seeds/founder/       # Example knowledge seed files
```

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Set **Root Directory** to `content-os`.
4. Add all required environment variables from `.env.example`.
5. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
6. Run migrations against production once (from your machine or CI):

   ```bash
   DATABASE_URL="..." DIRECT_URL="..." npm run db:migrate
   ```

7. Add the production Google OAuth redirect URI.

### Vercel notes

- **Discovery and draft generation** call external APIs and can run 30–120+ seconds. Use a **Pro** plan (or higher) so serverless functions can exceed the Hobby 10s limit (`maxDuration = 300` on `/api/discover` and `/api/generate`).
- Discovery is **manual only** - there is no scheduled cron. Users click **Run discovery** on the dashboard.
- `.env.local` is not deployed; every secret must be set in the Vercel dashboard.

---

## User workflow

1. **Sign in** with Google.
2. **Onboarding** - optional API keys, seed knowledge files, set interests, first discovery.
3. **Dashboard** - review ranked topics, remove unwanted ones, generate drafts.
4. **Draft editor** - edit body, pick hook/CTA, revise with AI, mark as published.
5. **Analytics** - track published output and manual discovery runs.

---

## API overview (authenticated unless noted)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/discover` | Run discovery for current user |
| `POST` | `/api/generate` | Generate draft from trend or custom topic |
| `DELETE` | `/api/trends/[id]` | Permanently remove a topic |
| `PATCH` | `/api/trends/[id]/feedback` | Save or dismiss topic |
| `GET/POST/PATCH` | `/api/knowledge` | Knowledge file CRUD |
| `PATCH` | `/api/settings` | User settings and encrypted keys |
| `GET` | `/api/health` | Health check (public) |

---

## Security

- User API keys are encrypted at rest with `ENCRYPTION_KEY` (AES-256-GCM).
- Org admins can export decrypted keys via `ADMIN_SECRET` — see [docs/admin_api_keys_export.md](../docs/admin_api_keys_export.md).
- Dashboard routes are protected by NextAuth middleware.
- Never commit `.env`, `.env.local`, or real credentials.
- Rotate Supabase and Google secrets if they were ever exposed.

---

## Related docs

- [docs/admin_api_keys_export.md](../docs/admin_api_keys_export.md) - Org admin key export (API + CLI)
- [DESIGN_v1.md](../DESIGN_v1.md) - Stamped design system reference
- [IMPLEMENTATION-PLAN.md](../IMPLEMENTATION-PLAN.md) - Build phases
- [docs/phases/](../docs/phases/) - Phase reports

---

## License

Private - all rights reserved.
