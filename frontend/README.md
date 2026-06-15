<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="Payravel" />
</p>

<h1 align="center">Payravel — Frontend</h1>
<p align="center">Nuxt 4 SPA for the Payravel expense reimbursement platform.</p>

**Production:** https://payravel-frontend.vercel.app

---

## Stack

| | |
|---|---|
| Framework | Nuxt 4 / Vue 3 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State | Pinia |
| HTTP | Axios |
| Charts | Chart.js + vue-chartjs |
| Icons | Lucide Vue |
| Flags | flag-icons |
| Testing | Vitest + Playwright |

## Setup

```bash
pnpm install
```

## Dev server

```bash
pnpm dev
# http://localhost:3000
```

## Build

```bash
pnpm build
pnpm preview
```

## Tests

```bash
# Unit
pnpm vitest

# E2E
pnpm playwright test
```

## Structure

```
app/
├── assets/css/       # Global styles + design tokens
├── components/
│   ├── brand/        # AppLogo
│   ├── layout/       # AppTopbar
│   ├── mobile/       # Mobile-specific views
│   └── ui/           # Reusable UI components
├── composables/      # Feature controllers + shared logic
├── layouts/          # auth, default
├── pages/            # File-based routing
├── services/         # API layer (httpClient + per-resource)
└── stores/           # Pinia stores (auth, locale)
```

## Environment

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```
