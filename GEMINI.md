# Gemini Agent Instructions for `f3rva-website`

This document provides comprehensive instructions, architectural context, coding conventions, client-side security guardrails, and DevOps best practices for developing and maintaining the **`f3rva-website`** repository.

---

## 1. Project Overview

**`f3rva-website`** is the centralized, modern React 19+ Single Page Application (SPA) for the F3 RVA community (`f3rva.org`). 

It serves as the community's primary public portal, providing:
1. **Brochureware & Regional Schedule:** Static marketing, new member guides ("New Guy"), AO directories, and dynamic workout schedules.
2. **Historical Backblast Archives:** Searchable and navigable archives organized by Year, Month, Day, and AO slug.
3. **Big Data Analytics Hub:** Fully replaces the legacy PHP frontend (`f3rva-bigdata`), integrating with [`f3rva-api`](file:///Users/bbischoff/dev/f3/f3rva-api) REST endpoints (`/v2/`) to provide attendance leaderboards, AO trend analytics, PAX profiles, activity heatmaps, and momentum charts.
4. **Self-Service & Admin Mutations:** PAX alias claiming workflows, alias approval/rejection dashboards, and PAX profile merger tools secured via JWT authentication.
5. **Legacy URL Compatibility Engine:** Comprehensive redirect matrix supporting legacy PHP query parameters (`/member/detail.php?id=...`, `/ao/detail.php?id=...`, etc.) to prevent broken backlinks.

---

## 2. Technology Stack & Modern Tooling

- **Core Framework:** React 19.x (Functional components, React Hooks)
- **Language:** TypeScript 5.9+ (Strict static typing enforced, zero `any`)
- **Build Tool:** Vite 7+
- **Routing:** React Router 7.x (Code-split with `React.lazy`, `Suspense`, and `ErrorBoundary`)
- **Data Visualization:** Recharts 3.x (`ResponsiveContainer`, `LineChart`, `PieChart`, custom SVG heatmaps)
- **Sanitization & Security:** DOMPurify 3.x (Strict HTML sanitization & reverse tabnabbing defense)
- **Icons:** React Icons 5.x
- **Testing:** Vitest 3.x, `@vitest/coverage-v8`, React Testing Library 16+, `@testing-library/jest-dom`, and `jsdom`
- **Analytics & Telemetry:** Google Analytics 4 (consent-aware via custom cookie banner) and Core Web Vitals
- **Code Quality:** ESLint 9+ (flat config), `@typescript-eslint`, React Hooks plugins
- **Runtime Environment:** Node.js 24 LTS

---

## 3. Directory & Package Structure

AI agents must preserve and respect the following structure:

```text
src/
├── App.tsx                     # Central routing container, lazy routes, & legacy redirects
├── App.css                     # App-level base styling
├── index.tsx                   # React root mount point
├── index.css                   # Global CSS variables & reset styles
├── config.ts                   # Environment variable loader & API config
├── vite-env.d.ts               # Vite environment type declarations
├── config/                     # Application configurations & constants
│   ├── constants.ts            # Centralized business constants (no magic literals)
│   └── analytics.js            # GA4 configuration & measurement ID sanitizer
├── context/                    # React Context providers
│   ├── AuthContext.tsx         # JWT token management, login/logout, & expiry checks
│   └── AuthContext.test.tsx    # AuthContext unit tests
├── hooks/                      # Custom business logic & data-fetching hooks
│   ├── useAuth.ts              # Authentication context consumer
│   ├── useFetch.ts             # Generic AbortController-enabled data fetching
│   └── useWorkoutSchedule.ts   # Workout schedule data loader
├── types/                      # TypeScript type definitions
│   ├── bigdata.ts              # API DTOs (Pax, AO, Workout, Attendance, Alias, Admin)
│   ├── WorkoutPost.ts          # Legacy & archive workout post definitions
│   └── index.ts                # Shared common types
├── utils/                      # Reusable pure utility functions
│   ├── sanitizer.ts            # DOMPurify HTML sanitizer & JSON-LD escaper
│   ├── validation.ts           # Input validation & search query sanitization
│   ├── structuredData.ts       # Schema.org JSON-LD structured data generators
│   ├── cookieConsent.ts        # Cookie consent storage & state manager
│   ├── dateUtils.ts            # Date formatting, YTD calculations & ISO parsers
│   └── postUtils.ts            # Archive slug parsing & post extraction
├── components/                 # Reusable UI components (Co-located pattern)
│   ├── AdminRoute/             # Protected route guard for authenticated admin views
│   ├── ArchivePostCard/        # Backblast archive preview card
│   ├── BigDataPageHeader/      # Standardized header & breadcrumbs for Big Data views
│   ├── BigDataSearch/          # Global PAX & AO search bar with debounce
│   ├── CookieConsent.tsx       # GDPR/CCPA cookie consent notification banner
│   ├── ErrorBoundary/          # Catch-all component crash barrier
│   ├── GoogleAnalytics.tsx     # GA4 script injector (consent-aware)
│   ├── Header.tsx              # Primary site navigation bar & mobile drawer
│   ├── Footer.tsx              # Site footer & regional links
│   ├── Layout.tsx              # Main shell layout container
│   ├── LegacyRedirects/        # URL query-param parser & redirect engine
│   ├── LoadingSpinner/         # Accessible loading animation fallback
│   ├── Pagination/             # Reusable pagination controls
│   └── SEO.tsx                 # Dynamic title, OpenGraph, & canonical meta tags
├── pages/                      # Page components (Route endpoints)
│   ├── Home/                   # Landing page
│   ├── About/                  # About F3 RVA & core principles
│   ├── Schedule/               # Weekly workout schedule & AO map/matrix
│   ├── NewGuy/                 # First-timer FAQ & onboarding guide
│   ├── NotFound/               # Custom 404 error page
│   ├── Archives/               # Historical WordPress backblast archive views
│   │   ├── Archives.tsx        # Archive landing (year index)
│   │   ├── YearArchives.tsx    # Posts filtered by Year
│   │   ├── MonthArchives.tsx   # Posts filtered by Month
│   │   ├── DayArchives.tsx     # Posts filtered by Day
│   │   ├── AOArchives.tsx      # Posts filtered by AO slug
│   │   └── ArchivePost.tsx     # Single post reader with sanitized HTML
│   └── BigData/                # Big Data Analytics Hub (Lazy-loaded)
│       ├── BigDataHub.tsx      # Analytics dashboard landing & recent activity
│       ├── Attendance/         # Attendance leaderboard & streakers report
│       ├── Reports/            # Day-of-week & region-wide aggregate reports
│       ├── AO/                 # AO directory, details, & attendance trend charts
│       ├── Pax/                # Member directory, profiles, heatmaps, & charts
│       ├── Workouts/           # Workout details & backblast inspector
│       ├── SelfService/        # PAX alias claim request forms & autocomplete
│       └── Admin/              # Admin login, alias request moderation, & PAX merge
├── data/                       # Static backup data & fallback schemas
└── scripts/                    # Build, SEO, and deployment utility scripts
    ├── setup-robots.js         # Environment-aware robots.txt swapper (dev vs. prod)
    └── generate-sitemap.js     # Automated XML sitemap generator
```

---

## 4. Client-Side Security & Web Guardrails

AI agents MUST adhere unconditionally to client-side security standards across all components and hooks:

### A. Cross-Site Scripting (XSS) Prevention & HTML Sanitization
* **Mandatory DOMPurify Usage:** Backblasts, WordPress archives, and user-generated text contain raw HTML. **NEVER** use raw `dangerouslySetInnerHTML` without passing the content through [`sanitizeHtml()`](file:///Users/bbischoff/dev/f3/f3rva-website/src/utils/sanitizer.ts).
* **Safe Attribute Whitelisting:** Sanitization must explicitly enforce secure attribute lists while allowing safe formatting (`ADD_ATTR: ['target']`).

### B. Reverse Tabnabbing Protection
* External links opening in new tabs (`target="_blank"`) can be hijacked if `rel="noopener noreferrer"` is missing.
* Our DOMPurify hook automatically injects `rel="noopener noreferrer"` on all sanitized anchor tags ([`src/utils/sanitizer.ts`](file:///Users/bbischoff/dev/f3/f3rva-website/src/utils/sanitizer.ts#L7-L13)).
* All manual JSX anchor tags targeting `_blank` **MUST** explicitly specify `rel="noopener noreferrer"`.

### C. JSON-LD / Script Injection Defense
* When injecting Schema.org JSON-LD scripts via [`SEO.tsx`](file:///Users/bbischoff/dev/f3/f3rva-website/src/components/SEO.tsx), always encode via [`sanitizeJSON()`](file:///Users/bbischoff/dev/f3/f3rva-website/src/utils/sanitizer.ts#L40-L42) to escape `<` characters (`\u003c`), preventing script breakout exploits.

### D. JWT Authentication & Admin Token Security
* **Storage Isolation:** Tokens are stored in browser storage and managed exclusively through [`AuthContext`](file:///Users/bbischoff/dev/f3/f3rva-website/src/context/AuthContext.tsx).
* **Expiration Sentinel:** The application validates token expiration timestamps periodically and on window focus (`visibilitychange`). Expired tokens are immediately cleared.
* **Header Authorization:** Admin API mutations (`f3rva-api`) must use `Authorization: Bearer <token>` supplied via `getAuthHeaders()`. Never expose tokens in query parameters.
* **Route Protection:** All administrative views must be wrapped inside [`AdminRoute`](file:///Users/bbischoff/dev/f3/f3rva-website/src/components/AdminRoute/AdminRoute.tsx) to redirect unauthenticated users to `/bigdata/admin/login`.

### E. Input Sanitization & Autocomplete Safety
* User inputs in self-service claim forms and search bars must be stripped of leading/trailing whitespace and validated against length/character constraints via [`src/utils/validation.ts`](file:///Users/bbischoff/dev/f3/f3rva-website/src/utils/validation.ts) prior to API submission.

---

## 5. Architectural Conventions & Design Patterns

### A. The "Thin Components, Fat Custom Hooks" Rule
* UI components in `src/components/` and `src/pages/` must focus strictly on layout, user interaction, and presentation.
* All external data fetching, pagination state, sorting logic, and side-effects must be encapsulated in custom hooks (e.g., [`useFetch`](file:///Users/bbischoff/dev/f3/f3rva-website/src/hooks/useFetch.ts), [`useAuth`](file:///Users/bbischoff/dev/f3/f3rva-website/src/hooks/useAuth.ts), [`useWorkoutSchedule`](file:///Users/bbischoff/dev/f3/f3rva-website/src/hooks/useWorkoutSchedule.ts)).

### B. Elimination of Magic Constants
* **Zero Hardcoded Domain Literals:** Never hardcode member IDs, default page sizes, timeframe strings, or status values directly in components.
* Import domain constants from [`src/config/constants.ts`](file:///Users/bbischoff/dev/f3/f3rva-website/src/config/constants.ts):
  - `F3_INCEPTION_DATE`: Regional inception date for all-time aggregations (`2014-01-01`).
  - `ALL_PAX_MEMBER_ID`: Special ID (`123`) reserved for anonymous/all PAX aggregations.
  - `DEFAULT_PAGE_SIZE`, `DEFAULT_PAGE_SIZE_OPTIONS`: Pagination bounds.
  - `ALIAS_STATUS`, `TIMEFRAME_PRESETS`, `SORT_METRICS`: Strongly typed enum dictionaries.

### C. Component Folder Co-Location
Every reusable or page-level component with custom styling or testing must follow the co-located directory structure:
```text
src/components/MyComponent/
├── MyComponent.tsx         # Pure functional component
├── MyComponent.css         # Scoped component styles
├── MyComponent.test.tsx    # Vitest + React Testing Library suite
└── index.ts                # Clean barrel export
```

### D. Code Splitting & Performance Boundaries
* Heavy analytical views (Recharts graphs, Admin mutation panels, Big Data dashboards) **MUST** be loaded dynamically using `React.lazy()` in [`src/App.tsx`](file:///Users/bbischoff/dev/f3/f3rva-website/src/App.tsx#L24-L35).
* Wrap lazy routes within `<Suspense fallback={<LoadingSpinner />}>` and `<ErrorBoundary>` to isolate network or render exceptions.

### E. Backward Compatibility & Legacy URL Redirects
* Maintain all legacy redirect rules in [`src/components/LegacyRedirects/LegacyRedirects.tsx`](file:///Users/bbischoff/dev/f3/f3rva-website/src/components/LegacyRedirects/LegacyRedirects.tsx) and [`src/App.tsx`](file:///Users/bbischoff/dev/f3/f3rva-website/src/App.tsx#L91-L182).
* Any legacy PHP URL pattern (`/member/detail.php?id=123`, `/ao/detail.php?id=...`, `/report/*.php`) must automatically translate into clean SPA routes (`/bigdata/pax/123`, `/bigdata/ao/45`, etc.).

---

## 6. Data Fetching, State Management & Telemetry

### A. The `useFetch<T>` Standard
When querying REST endpoints, use [`useFetch<T>`](file:///Users/bbischoff/dev/f3/f3rva-website/src/hooks/useFetch.ts) which guarantees:
1. **`AbortController` Lifecycle:** Automatically cancels in-flight network requests when the component unmounts or query parameters change.
2. **Strict Mode Double-Mount Safety:** Prevents state tearing during React 19 development mode re-mounts.
3. **Timeout Sentinel:** Aborts hanging requests after `config.apiTimeoutMs` (10 seconds) with user-friendly error state.

### B. Telemetry & Google Analytics 4
* Google Analytics (`gtag.js`) is initialized conditionally based on user cookie preferences ([`src/utils/cookieConsent.ts`](file:///Users/bbischoff/dev/f3/f3rva-website/src/utils/cookieConsent.ts)).
* The GA measurement ID is validated against format regex (`/^G-[A-Z0-9]+$/`) in [`src/config/analytics.js`](file:///Users/bbischoff/dev/f3/f3rva-website/src/config/analytics.js) before script injection to prevent malicious injection via environment variables.

---

## 7. Deterministic Testing & Quality Guardrails

### A. Mandatory 80%+ Test Coverage Threshold
* All new components, hooks, and utility modules **MUST** maintain at least **80% test coverage** (`npm run test:coverage`).
* The test suite uses **Vitest** with `@vitest/coverage-v8`.

### B. Testing Conventions & Best Practices
1. **User-Centric Queries:** Prefer RTL `screen.getByRole`, `screen.getByText`, and `screen.getByLabelText` over brittle test IDs or class selectors.
2. **Network Isolation:** Never make live HTTP calls during test runs. Always mock `global.fetch` in test files or leverage `setupTests.js`.
3. **Async Hook Testing:** Use RTL's `renderHook` and `waitFor` to assert state transitions in custom hooks.
4. **Mocking Recharts:** When testing components with Recharts `ResponsiveContainer`, ensure width/height mocking is handled to avoid zero-dimension SVG warnings.

---

## 8. Build, SEO & DevOps Workflows

### A. Development & Test Commands
```bash
# Start local dev server (auto-configures dev robots.txt)
npm run dev

# Run Vitest test suite once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with code coverage report
npm run test:coverage

# Build for development/staging
npm run build:dev

# Build for production (type-checks & applies production robots.txt)
npm run build:prod

# Lint TypeScript and JSX
npm run lint

# Generate XML Sitemap
npm run generate-sitemap
```

### B. Robots.txt Management (Critical Rule)
* **NEVER edit `public/robots.txt` directly.** It is auto-generated during build and development.
* **Development/Staging:** Edit `public/robots-dev.txt` (disallows all crawlers: `Disallow: /`).
* **Production:** Edit `public/robots-prod.txt` (allows crawlers and points to `sitemap.xml`).
* The script [`scripts/setup-robots.js`](file:///Users/bbischoff/dev/f3/f3rva-website/scripts/setup-robots.js) automatically copies the appropriate template into `public/robots.txt` based on the target environment.

### C. Git & Branching Conventions
- **Feature Branches:** `feature/<feature-name>` (e.g., `feature/pax-streakers-report`)
- **Bug Fixes:** `bug/<bug-name>` (e.g., `bug/fix-ao-chart-tooltip`)
- **Automated Bot Commits:** `bot/<description>` (e.g., `bot/update-gemini-docs`)

### D. CI/CD Deployment Pipeline (`.github/workflows/`)
* **Development Deployment (`deploy.yml`):**
  - Triggered on push to `main`.
  - Runs on Node 24, builds via `npm run build:dev`, assumes AWS Dev Role via OIDC, syncs to Dev S3 bucket, and triggers CloudFront cache invalidation (`/*`).
* **Production Deployment (`deploy.yml`):**
  - Triggered when a GitHub Release is published.
  - Builds via `npm run build:prod` with production robots.txt, assumes AWS Prod Role via OIDC, syncs to Prod S3 bucket, and triggers CloudFront cache invalidation (`/*`).
* **Release Tagging (`release-tag.yml`):**
  - Dispatched workflow to generate semantic version git tags (`vX.Y.Z`).

