# Frontend Guide

- Next.js App Router, locale-prefixed routes (`/rw`, `/en`, `/fr`), Server Components by default.
- State: server state with TanStack Query; local UI state with React state; no global store unless justified by ADR.
- Forms: react-hook-form + zod schemas from `common/types`.
- Styling: Tailwind tokens; shadcn/ui primitives; dark mode via CSS variables.
- PWA: manifest, service worker for shell caching, offline fallback page; never cache authenticated money responses.
- Performance budgets: first load JS < 150 KB gzip on game routes, LCP < 2.5 s on 3G.
- Game screen: countdown is cosmetic; show server `expiresAt`; submit answer with `questionId` and `optionId` only.
- Never store tokens in localStorage; use httpOnly secure cookies.
- Accessibility checks in CI (axe) for critical flows.
