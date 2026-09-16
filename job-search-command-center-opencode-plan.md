# Job Search Command Center — Reboot Plan (for OpenCode)

> ملخص سريع بالعربية: النسخة اللي طلعت من Lovable كانت مجرد CRUD محلي ببيانات ديمو — تنفع كـ demo بصري بس ما تعطي قيمة حقيقية لأي مستخدم فعلي. هالخطة تعيد التصميم حول فكرة أساسية: التطبيق يسحب وظائف حقيقية ومعلومات رواتب حقيقية من APIs مجانية عامة، ويخليها قابلة للحفظ داخل الـ pipeline بضغطة واحدة، بدل ما يكون مجرد جدول فاضي ينتظر منك تعبيه يدويًا. الخطة موجهة لـ **OpenCode** مو Lovable، وتشرح متى نستخدم Next.js ومتى لا، وكيف نستخدم الـ skills المتوفرة بدل ما نبني كل شي من الصفر يدويًا.

---

## 1. What was wrong with the Lovable v1

- 100% local, 100% manual entry → the app has zero value until the user has already typed in 20+ applications by hand. No reason to open it on day one.
- "Demo data" was the only thing making the deployed link look alive — cosmetic, not functional.
- No connection to the actual job market: no real listings, no real salary reference, nothing that makes the tool *do work for the user*.
- Correct choices that should be **kept**: Zod validation, Dexie/IndexedDB for the user's own pipeline data, no-auth, Vercel deploy, accessibility and empty-state discipline. These were not the problem — the missing value proposition was.

## 2. New value proposition

The app becomes a **hybrid**: a personal pipeline tracker (unchanged core) **plus** a live **Job Discovery** surface that pulls real, current listings and real salary data from public job APIs, so the tool is useful *before* the user has typed anything in.

Two pillars:

1. **My Pipeline** (as before): Kanban + table + detail view + interview prep + contacts, stored locally in IndexedDB, private to the browser.
2. **Discover** (new): search live job listings across multiple free aggregators, see a salary benchmark for the role/location, and convert any listing into a pipeline `Application` with one click (pre-filled — company, role, location, URL, source).

This is the actual "قيمة للمستخدم" that was missing: on day one, before adding a single manual entry, the user can search "React developer, remote", see real open roles + a real salary range, and start tracking with one tap.

## 3. Real data sources (no scraping, only public/documented APIs)

| API | What it gives | Key needed? | Use for |
|---|---|---|---|
| [Remotive](https://remotive.com/api/remote-jobs) | Remote job listings, categories | No | Discovery feed |
| [Arbeitnow](https://www.arbeitnow.com/api/job-board-api) | Job board listings (EU-heavy, tech) | No | Discovery feed |
| [RemoteOK](https://remoteok.com/api) | Remote listings, tags, sometimes salary | No | Discovery feed |
| [Jobicy](https://jobicy.com/api/v2/remote-jobs) | Remote listings by category/region | No | Discovery feed |
| [Adzuna](https://developer.adzuna.com/) | Listings **+ salary histograms/stats** by title & location | Yes (free tier, `app_id`+`app_key`) | Salary benchmarking, "what's this role paying right now" |

None of these require scraping or violate ToS — all have documented public endpoints. Adzuna is the only one needing a free registered key, and it's the one that actually answers "وتسعيرتها" (real market pricing) via its salary-stats endpoint.

Do **not** add LinkedIn/Indeed scraping — both explicitly forbid it and it would break the "portfolio-safe, no legal risk" requirement.

## 4. Tech stack — what changes and why

Keep almost everything from the original spec. The **one** real decision point is Next.js vs. plain Vite:

- **Use Next.js (App Router, TypeScript) instead of plain Vite** — but *only* because we now need a thin server layer for exactly two things:
  1. Proxying calls to Adzuna so the `app_key` is never exposed in client JS.
  2. Avoiding CORS failures on the free aggregator APIs when called directly from the browser (some don't send permissive CORS headers).
- These become a handful of **Next.js Route Handlers** (`app/api/jobs/route.ts`, `app/api/salary/route.ts`) — thin fetch-and-cache proxies, no database, no auth, no server-rendered pages needed beyond that. Everything else stays a client component, still deployable on Vercel with zero configured secrets beyond the one Adzuna key (set as a Vercel env var, never committed).
- If you strip Discovery/Adzuder out entirely and only want the original offline tracker, stay on plain Vite — but that reintroduces the "no real value" problem, so this plan assumes Next.js.

Everything else unchanged:

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Local persistence | Dexie.js (IndexedDB) — pipeline data only, never the Discovery cache |
| Drag & drop | @dnd-kit/core |
| Forms & validation | React Hook Form + Zod |
| Charts | Recharts |
| Markdown (notes) | `marked`/`markdown-it` + `DOMPurify`, sanitize always |
| Icons | lucide-react |
| Remote data fetching/caching | TanStack Query (new — needed now that we have real network calls with loading/error/stale states) |

No MUI/Chakra, same as before — Tailwind-only, custom design system.

## 5. Data model changes

Keep `Application`, `Contact`, `InterviewPrepEntry`, `UserSettings` exactly as in the original spec. Add:

```ts
interface ExternalJobListing {
  id: string;            // source-prefixed id, e.g. "remotive-123"
  source: "remotive" | "arbeitnow" | "remoteok" | "jobicy" | "adzuna";
  company: string;
  role: string;
  location: string;
  url: string;
  postedDate?: string;
  salaryText?: string;     // raw string from source, if any
  tags: string[];
  descriptionSnippet: string; // truncated + sanitized
}

interface SalaryBenchmark {
  role: string;
  location: string;
  min: number;
  max: number;
  median: number;
  currency: string;
  sampleSize: number;
  source: "adzuna";
  fetchedAt: string;
}
```

`ExternalJobListing[]` and `SalaryBenchmark` are **never** written to Dexie — they're ephemeral, fetched live via TanStack Query and cached in memory/query-cache only. Only the moment a user clicks "Save to Pipeline" does data cross into a real `Application` row in IndexedDB (with a fresh `id`, `status: "wishlist"`, `source` set to the origin API name).

## 6. Feature scope additions

- **`/discover` route**: search box (role + location), source filter chips, results grid of `ExternalJobListing` cards, each with "Save to Pipeline" (creates a prefilled `Application`, no page leave) and "View posting" (opens `url` in new tab, `rel="noopener noreferrer"`).
- **Salary insight panel**: on the same page, once role+location is searched, show the Adzuna benchmark (min/median/max) as a small Recharts bar, with a note "based on N listings via Adzuna" — this is the concrete answer to "تسعيرتها."
- **Dedup on save**: if `company+role` already exists in the pipeline (open, not archived), warn before creating a duplicate — reuse the existing conflict-resolution pattern from Import.
- Everything from the original spec (Kanban, Table, Dashboard/Today, Import/Export, Settings) stays as-is.

## 7. Using OpenCode's skills — do this before writing code

Before generating any UI code, OpenCode should:

1. Check its skills directory for a UI/UX design skill (e.g. `ui-ux-pro-max` or equivalent) and load it first — it should govern typography, spacing, color system, and component patterns instead of default Tailwind boilerplate.
2. Check for any Next.js/React scaffolding or component-library skill available and prefer it over hand-rolling primitives from scratch.
3. Check for a data-fetching / API-integration skill if one exists, to standardize how the Route Handlers proxy and cache external calls.
4. If no matching skill exists for a given step, say so explicitly and fall back to the manual guidance in this document — never silently skip design quality because a skill wasn't found.

This should happen for every phase of the build (data layer → API proxies → core UI → Discover page → polish), not just once at the start.

## 8. Architecture / folder structure

```
src/
  app/
    (routes)/
      page.tsx                 # Dashboard/Today
      board/page.tsx
      applications/page.tsx
      applications/[id]/page.tsx
      discover/page.tsx        # NEW
      settings/page.tsx
    api/
      jobs/route.ts            # NEW — proxies Remotive/Arbeitnow/RemoteOK/Jobicy, merges+normalizes
      salary/route.ts          # NEW — proxies Adzuna salary-stats, server-side key
  features/
    applications/  { components/, hooks/, store.ts }
    board/          { components/ }
    dashboard/      { components/ }
    table/          { components/ }
    discover/        { components/, hooks/ }   # NEW
    settings/       { components/ }
  lib/
    db.ts                      # Dexie schema (pipeline data only)
    validation/                # Zod schemas
    csv.ts
    dates.ts
    jobSources/                # NEW — one normalizer per external API → ExternalJobListing
  components/ui/                # Button, Input, Modal, Badge, EmptyState, Skeleton
```

## 9. Security notes (in addition to the original §5 list — all of it still applies)

- Adzuna `app_id`/`app_key` live only in server-side env vars, read only inside `app/api/*` route handlers, never sent to the client.
- Route handlers set a short server-side cache (e.g. 5–10 min) to avoid hammering free-tier rate limits and to keep the app fast.
- `descriptionSnippet` from external sources is untrusted HTML/text — sanitize with DOMPurify exactly like the notes field before any render.
- Outbound "View posting" links: validate the `url` scheme is `http`/`https` before rendering as a link, same rule as `jobUrl`/`linkedinUrl` in the original spec.
- CSP header needs `connect-src` extended to `self` (for the Next.js API routes) — the browser never calls the external job APIs directly, so no third-party origins need to be added to `connect-src`.

## 10. Build order

1. Dexie schema + typed CRUD hooks + seed/demo data generator (unchanged)
2. `jobSources/` normalizers + `/api/jobs` and `/api/salary` route handlers, tested with curl/Postman before any UI touches them
3. Table/List view (proves local data layer)
4. Application detail form (create/edit, full validation)
5. Kanban board (drag & drop, keyboard fallback)
6. Dashboard/Today view
7. **Discover page** (search, results grid, salary panel, Save-to-Pipeline flow, dedup warning)
8. Import/Export (JSON + CSV, injection guarding)
9. Polish pass: empty states, responsive breakpoints, dark mode, a11y audit, loading/error states for all TanStack Query calls

## 11. Definition of done (additions to the original list)

- `/discover` returns real, current listings from at least 3 of the 4 free aggregators, merged and deduped by (company+role+url-domain)
- Salary panel shows real Adzuna numbers for at least role+country granularity (city-level if available)
- Adzuna key is not present anywhere in client bundle (verify via browser devtools → Network/Sources)
- "Save to Pipeline" creates a correct, prefilled `Application` and never crashes if optional fields (salary, posted date) are missing from the source API
- Everything from the original Lovable brief's §13 (Zod at every entry point, sanitized markdown, Lighthouse checks, README case study) still holds

---

## 12. The prompt to paste into OpenCode

Paste everything between the lines below as the task/brief for OpenCode. It assumes OpenCode is pointed at an empty or fresh repo.

```
Build "Job Search Command Center" — a Next.js (App Router, TypeScript) app that is BOTH a personal job-application pipeline tracker AND a live job-discovery tool. Follow this brief literally; where it conflicts with your default patterns, this brief wins. Before writing any code, check your available skills (UI/UX design skill, component/scaffolding skill, data-fetching skill) and use whichever apply — state explicitly which skills you used for which phase, and if none apply for a phase, say so and proceed with the manual guidance below.

HARD CONSTRAINTS
- No database server, no auth provider. Only server-side code allowed: a small number of Next.js Route Handlers under app/api/* that proxy external job APIs (see below) — nothing else runs server-side.
- All user pipeline data (applications, contacts, interview prep, settings) is stored client-side in IndexedDB via Dexie.js. It never touches the server.
- Deployable on Vercel with exactly one required env var: ADZUNA_APP_ID and ADZUNA_APP_KEY (free tier, https://developer.adzuna.com/). All other data sources need no key.
- No scraping. Only the following documented public APIs:
  - Remotive: https://remotive.com/api/remote-jobs
  - Arbeitnow: https://www.arbeitnow.com/api/job-board-api
  - RemoteOK: https://remoteok.com/api
  - Jobicy: https://jobicy.com/api/v2/remote-jobs
  - Adzuna (listings + /v1/api/jobs/{country}/histogram for salary stats): https://developer.adzuna.com/

TECH STACK (do not substitute)
Next.js (App Router) + TypeScript, Tailwind CSS, Zustand, Dexie.js, @dnd-kit/core, React Hook Form + Zod, Recharts, TanStack Query, marked or markdown-it + DOMPurify, lucide-react. No MUI/Chakra/other themed component libraries — build primitives directly in Tailwind.

DATA MODEL
Implement these TypeScript types and mirror the Application/Contact/InterviewPrepEntry/UserSettings shapes in the Dexie schema exactly:

type ApplicationStatus = "wishlist" | "applied" | "phone_screen" | "interview" | "offer" | "rejected" | "withdrawn";

interface Application {
  id: string; company: string; role: string; source: string; location: string;
  jobUrl?: string; status: ApplicationStatus; appliedDate?: string;
  lastActivityDate: string; nextActionDate?: string; nextActionNote?: string;
  salaryRange?: string; notes: string; contacts: Contact[];
  interviewPrep: InterviewPrepEntry[]; tags: string[]; createdAt: string; archived: boolean;
}
interface Contact { id: string; name: string; role?: string; email?: string; linkedinUrl?: string; }
interface InterviewPrepEntry { id: string; stage: string; date?: string; notes: string; outcome?: "pending" | "passed" | "failed"; }
interface UserSettings { pipelineStages: ApplicationStatus[]; defaultFollowUpDays: number; theme: "light" | "dark" | "system"; }

Add (ephemeral, never persisted to Dexie — TanStack Query cache only):
interface ExternalJobListing {
  id: string; source: "remotive" | "arbeitnow" | "remoteok" | "jobicy" | "adzuna";
  company: string; role: string; location: string; url: string; postedDate?: string;
  salaryText?: string; tags: string[]; descriptionSnippet: string;
}
interface SalaryBenchmark {
  role: string; location: string; min: number; max: number; median: number;
  currency: string; sampleSize: number; source: "adzuna"; fetchedAt: string;
}

`lastActivityDate` is derived — never let a form set it directly; recompute it inside the data-layer mutation functions only.

ROUTES
/                  Dashboard ("Today": overdue follow-ups, stale applications, counters)
/board             Kanban pipeline
/applications      Table/list view
/applications/:id  Detail/edit
/discover          NEW — live job search + salary benchmark + "Save to Pipeline"
/settings          Pipeline customization, theme, export/import

DISCOVER PAGE (the core new feature)
- Search by role + location. Query app/api/jobs (merges Remotive+Arbeitnow+RemoteOK+Jobicy, normalized to ExternalJobListing, deduped by company+role+url-domain) and app/api/salary (Adzuna histogram, normalized to SalaryBenchmark).
- Results as cards sharing the same visual language as Kanban cards/table rows (same radius, shadow, badge style).
- Each card: "Save to Pipeline" (creates a prefilled Application with status "wishlist", source set to the origin API; if an existing non-archived Application matches company+role, show a skip/overwrite/keep-both prompt instead of silently duplicating) and "View posting" (opens jobUrl in a new tab with rel="noopener noreferrer", only after validating the URL scheme is http/https).
- Salary benchmark panel: small Recharts bar showing min/median/max with "based on N listings via Adzuna."
- Full loading/empty/error states for every query (TanStack Query — no component may assume data is present on first render).

ROUTE HANDLERS (app/api/*)
- app/api/jobs/route.ts: fetch all four free sources server-side in parallel, normalize, merge, dedupe, return JSON. Cache 5–10 minutes server-side. No client code ever calls these four sources directly (avoids CORS + keeps normalization in one place).
- app/api/salary/route.ts: fetch Adzuna histogram using ADZUNA_APP_ID/ADZUNA_APP_KEY from server env only — these must never reach client bundle. Cache 5–10 minutes.

SECURITY (mandatory, not best-effort)
1. Sanitize all rendered user content (notes, interviewPrep notes, and descriptionSnippet from external listings) via DOMPurify after markdown conversion — every time, no exceptions.
2. Validate URL fields (jobUrl, linkedinUrl, and external listing url) — only http/https schemes, reject javascript:/data:/other schemes, enforced in Zod schema not just UI.
3. CSV import/export: neutralize any cell starting with =, +, -, @, tab, or CR with a leading ' on export; validate same on import.
4. JSON import: JSON.parse in try/catch, full payload through Zod before any Dexie write; reject on shape mismatch.
5. No eval, new Function, or dynamic import() of user-provided strings anywhere.
6. Content-Security-Policy via header/meta: default-src 'self'; connect-src 'self' (browser only talks to our own /api routes, never third parties directly); restrict further as needed for fonts/icons CDN actually used.
7. Pin dependency versions in package.json for anything touching parsing/sanitization.
8. No analytics/tracking scripts.
9. README must note IndexedDB is origin-scoped but unencrypted — don't imply it's safe for secrets.

VALIDATION & ERROR HANDLING
- One Zod schema per entity, shared between React Hook Form and the Dexie write path.
- Required: company, role, status. Block save, show inline errors otherwise.
- Every Dexie write wrapped in try/catch; on failure (including QuotaExceededError) show a non-blocking toast, never fail silently or crash the view.
- Import conflict detection: match company+role+appliedDate; prompt skip/overwrite/keep-both.
- Every list-fetching hook (local or remote) exposes { data, isLoading, error }.

UI/UX
- Before building components, load and apply your UI/UX skill if available (e.g. ui-ux-pro-max) for the design system: palette (with real working dark mode), type scale, spacing units. If unavailable, define these manually and apply consistently — no one-off styling per screen.
- Kanban cards, table rows, dashboard cards, and Discover cards must share the same visual language (radius, shadow, badges).
- Subtle motion only for drag-and-drop, column/status changes, modal open/close.
- Keyboard-only drag-and-drop fallback for Kanban (accessibility requirement, not optional).

STATES TO IMPLEMENT EXPLICITLY
Initial loading (IndexedDB + first Discover query), zero-applications empty state with onboarding CTA (add first application / load demo data / go to Discover), empty state per Kanban column, form validation errors, failed save/quota-exceeded banner, import conflict UI, Discover loading/empty/error/rate-limited states, mobile breakpoint (Kanban → status-switcher + single-column list).

ACCESSIBILITY
Full keyboard operability including drag-and-drop, WCAG AA contrast in both themes, real form labels (not placeholder-only), aria-live announcements for status changes/toasts.

BUILD ORDER
1. Dexie schema + CRUD hooks + seed/demo data
2. jobSources normalizers + /api/jobs + /api/salary route handlers (verify with direct requests before any UI)
3. Table/List view
4. Application detail form
5. Kanban board
6. Dashboard/Today view
7. Discover page (search, results, salary panel, Save-to-Pipeline, dedup)
8. Import/Export
9. Polish: empty states, responsive, dark mode, a11y audit, seed the deployed demo with realistic mock pipeline data so the live link never looks empty even before Discover is used

DEFINITION OF DONE
- vercel deploy succeeds with only ADZUNA_APP_ID/ADZUNA_APP_KEY configured
- Every state above is reachable and visually distinct
- Zod validation blocks bad data at every entry point (form, JSON import, CSV import)
- Sanitized rendering verified by attempting to save `<img src=x onerror=alert(1)>` in a notes field and confirming it renders inert
- Adzuna key confirmed absent from client bundle (check Network/Sources in devtools)
- /discover returns real merged results from at least 3 of the 4 free sources and a real Adzuna salary benchmark
- README: problem statement, why IndexedDB over localStorage, why Next.js API routes instead of pure static (CORS + key-hiding for Discover), what's out of scope (auth, sync, notifications), one case-study paragraph on the hardest UX decision

If anything here is ambiguous or conflicts with something else in this brief, stop and ask rather than guessing — don't silently drop a security, validation, or skill-usage step to move faster.
```
