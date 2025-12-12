# Talepick Frontend (Chronos)

Next.js 16 App Router build of the Chronos interactive fiction experience, ported from `mock/frontend` with the same layout, copy, and styling.

## Quickstart

- Install deps from the repo root: `npm install`
- Start dev server: `npm run dev -w frontend` (http://localhost:3000)
- Lint: `npm run lint -w frontend`
- Tests (Vitest + RTL): `npm test -w frontend`
- Build: `npm run build -w frontend -- --webpack` (Turbopack is disabled here)

## Environment

Create `apps/frontend/.env.local` with:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key
```

## Notes

- Tailwind CSS v4 with custom tokens lives in `app/globals.css` (fonts: Kanit/Inter with Noto Serif Thai/Cinzel for display).
- Shared logic is under `app/lib`; UI building blocks in `app/ui`; routes live in `app/(routes)/*`.
