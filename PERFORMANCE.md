# Performance System

This repo uses free, production-grade performance controls:

- Browser RUM through `PerformanceObserver`.
- A sampled Netlify Function endpoint at `/api/perf-vitals`.
- Build-time gzip/Brotli compression.
- CI-friendly bundle budgets in `performance-budget.json`.
- Intent-based route prefetching.
- Route-level code splitting.
- Lazy legal-document loading.
- Save-data/reduced-motion aware landing media.

## Build Budgets

`npm run build` runs TypeScript, Vite, and `scripts/performance-budget.mjs`.

Current enforced gzip budgets:

- Entry JS static graph: 70 KB
- Entry CSS: 70 KB
- Largest JS chunk: 150 KB
- Largest CSS chunk: 60 KB
- Total JS: 1100 KB
- Total CSS: 130 KB

If a build fails here, either reduce the payload or intentionally update
`performance-budget.json` with a clear reason.

## Real User Metrics

`src/utils/performanceVitals.ts` records:

- LCP
- INP
- CLS
- FCP
- TTFB
- Long tasks

In production it samples 10% of sessions by default and posts to
`/api/perf-vitals`. Override with:

```bash
VITE_PERF_SAMPLE_RATE=0.05
VITE_PERF_ENDPOINT=/api/perf-vitals
```

The Netlify function logs compact JSON records with `type: "web-vitals"`.

## Rules Of Thumb

- Do not import auth, dashboard, chart, markdown, or analytics vendors from the app root.
- Keep cookie consent, analytics, monitoring, and heavy media off the first render path.
- Lazy-load route content, then lazy-load expensive panels inside those routes.
- Prefer static assets or fetched content for huge text documents instead of bundling them into JS.
- Keep Sentry-like SDKs out unless they are proven worth the payload cost.
- Treat new large chunks as intentional architecture decisions, not incidental build output.
