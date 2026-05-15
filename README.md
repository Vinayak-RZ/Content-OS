# Content OS

Technical founder content infrastructure — discover topics, generate LinkedIn drafts in your voice, edit, copy to clipboard.

## Development

```bash
npm install
cp .env.example .env.local
# Configure env vars (see .env.example)
npx prisma migrate deploy
npm run dev
```

## Docs

- [IMPLEMENTATION-PLAN.md](../IMPLEMENTATION-PLAN.md)
- [Phase 0 report](../docs/phases/PHASE-0.md)

## Stack

Next.js 14 · TypeScript · Tailwind · shadcn/ui · GSAP · Prisma · PostgreSQL + pgvector
