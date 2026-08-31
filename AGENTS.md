# Agent Instructions for F3 RVA Website

This file provides high-level development guidelines for AI agents and human developers working on the `f3rva-website` repository.

> [!NOTE]
> For the exhaustive architectural blueprint, OWASP client-side security standards, custom hooks patterns, directory tree, and CI/CD pipelines, see **[`GEMINI.md`](./GEMINI.md)**.

---

## 1. Project Summary

`f3rva-website` is the React 19+ Single Page Application (SPA) for F3 RVA (`f3rva.org`). It serves static brochureware, workout schedules, historical backblast archives, and the **Big Data Analytics Hub** interfacing with [`f3rva-api`](../f3rva-api) REST endpoints (`/v2/`).

## 2. Tech Stack

- **Framework:** React 19.x (Functional components, React Hooks)
- **Language:** TypeScript 5.9+ (Strict typing, no `any`)
- **Build Tool:** Vite 7+
- **Routing:** React Router 7.x (Code-split with `React.lazy` & `Suspense`)
- **Data Visualization:** Recharts 3.x
- **Sanitization:** DOMPurify 3.x
- **Testing:** Vitest 3.x, `@vitest/coverage-v8`, React Testing Library 16+
- **Code Quality:** ESLint 9+

## 3. Core Development Guardrails

1. **Client-Side Security:**
   - Always sanitize raw HTML using `sanitizeHtml()` from `src/utils/sanitizer.ts`. Never use unsanitized `dangerouslySetInnerHTML`.
   - Ensure all external `target="_blank"` links include `rel="noopener noreferrer"`.
   - Escape JSON-LD data with `sanitizeJSON()` in `src/utils/sanitizer.ts`.
2. **Custom Hooks Pattern:**
   - Keep UI components thin and presentation-focused.
   - Encapsulate data fetching, timeouts, and `AbortController` cancellation in custom hooks (`useFetch`, `useAuth`, `useWorkoutSchedule`).
3. **No Magic Literals:**
   - Centralize domain constants, pagination defaults, and status enums in `src/config/constants.ts`.
4. **Testing Standards:**
   - Maintain **80%+ test coverage** (`npm run test:coverage`).
   - Use RTL `screen` queries prioritized by accessibility (`getByRole`, `getByText`). Mock network requests in `global.fetch`.
5. **Robots.txt Policy:**
   - **NEVER** edit `public/robots.txt` directly. Edit `public/robots-dev.txt` for dev or `public/robots-prod.txt` for production.

## 4. Key Commands

- `npm run dev`: Start development server (Node 24).
- `npm test`: Run Vitest test suite.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:coverage`: Run tests with v8 code coverage.
- `npm run build:dev`: Build development bundle with dev robots.txt.
- `npm run build:prod`: Build production bundle with prod robots.txt.
- `npm run lint`: Lint TypeScript and JSX.

