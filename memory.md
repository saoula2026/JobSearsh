# Job Search Command Center — Project Memory

> Quick-reference guide. Read this before diving into any file to understand context without reading every line.

---

## 🎯 Project Goal

Hybrid app: **Personal pipeline tracker** (IndexedDB) + **Live job discovery** (4 free APIs). Useful on day one before manual entry. Fully client-side, zero backend.

---

## 📁 Folder Structure (Actual)

```
src/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx                      # App layout with sidebar
│   │   └── app/                            # ← All app pages now under /app prefix
│   │       ├── page.tsx                    # Dashboard/Today  (URL: /app)
│   │       ├── board/page.tsx              # Kanban pipeline  (URL: /app/board)
│   │       ├── applications/page.tsx       # Table/list view  (URL: /app/applications)
│   │       ├── applications/[id]/page.tsx  # Detail/edit      (URL: /app/applications/[id])
│   │       ├── discover/page.tsx           # Live search (URL: /app/discover)
│   │       └── settings/page.tsx           # Config, import/export (URL: /app/settings)
│   ├── layout.tsx                     # Root layout (Plus Jakarta Sans + Inter + providers)
│   ├── page.tsx                       # PUBLIC landing page — no DB/network calls
│   ├── providers.tsx                  # TanStack Query provider
│   └── globals.css                    # Design tokens (violet palette), shimmer, fonts
├── components/
│   ├── Sidebar.tsx                    # Navigation sidebar
│   └── ui/                            # Shared components
│       ├── Badge.tsx
│       ├── Button.tsx                 # Framer Motion whileHover/whileTap
│       ├── CompanyLogo.tsx            # Clearbit logo + ui-avatars fallback
│       ├── EmptyState.tsx             # Custom SVG illustrations per context
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       ├── Skeleton.tsx               # Shimmer gradient animation
│       └── SourceFreshnessBadge.tsx   # "Live from Remotive · 4 min ago"
└── lib/
    ├── db.ts                          # Dexie schema (pipeline only)
    ├── hooks.ts                       # CRUD hooks + seed data
    ├── types.ts                       # TypeScript interfaces
    ├── validation/
    │   └── application.ts             # Zod schemas
    └── jobSources/                    # API normalizers (1 per source)
        ├── index.ts                   # Dedupe logic + exports
        ├── remotive.ts
        ├── arbeitnow.ts
        ├── remoteok.ts
        └── jobicy.ts
```

---

## 🗃️ Data Models

### Persisted (Dexie/IndexedDB)

```ts
Application {
  id: string                    # crypto.randomUUID()
  company: string               # REQUIRED
  role: string                  # REQUIRED
  source: string                # "manual" | "remotive" | etc.
  location: string
  jobUrl?: string               # validated http/https only
  status: ApplicationStatus     # "wishlist"|"applied"|"phone_screen"|"interview"|"offer"|"rejected"|"withdrawn"
  appliedDate?: string
  lastActivityDate: string      # DERIVED — never set directly in forms
  nextActionDate?: string
  nextActionNote?: string
  salaryRange?: string
  notes: string                 # markdown, sanitized
  contacts: Contact[]
  interviewPrep: InterviewPrepEntry[]
  tags: string[]
  createdAt: string
  archived: boolean
}

Contact {
  id: string
  name: string
  role?: string
  email?: string
  linkedinUrl?: string          # validated http/https only
}

InterviewPrepEntry {
  id: string
  stage: string
  date?: string
  notes: string                 # markdown, sanitized
  outcome?: "pending"|"passed"|"failed"
}

UserSettings {
  id: number                    # always 1
  pipelineStages: ApplicationStatus[]
  defaultFollowUpDays: number
  theme: "light"|"dark"|"system"
}
```

### Ephemeral (TanStack Query cache only — never persisted)

```ts
ExternalJobListing {
  id: string                    # "source-prefix-id"
  source: "remotive"|"arbeitnow"|"remoteok"|"jobicy"
  company: string
  role: string
  location: string
  url: string
  postedDate?: string
  salaryText?: string
  tags: string[]
  descriptionSnippet: string    # sanitized
  fetchedAt: string             # ISO 8601 — generated client-side
}
```

---

## 🔌 API Routes

**Zero Backend.**
All APIs are called directly from the client via standard `fetch()`. No backend proxies. No server-side secrets. 

| External API | Usage | Auth | Caching |
|-------|--------|------|---------|
| `https://remotive.com/api/remote-jobs` | Remotive jobs | None | Client query cache |
| `https://www.arbeitnow.com/api/job-board-api` | Arbeitnow jobs | None | Client query cache |
| `https://remoteok.com/api` | RemoteOK jobs | None | Client query cache |
| `https://jobicy.com/api/v2/remote-jobs` | Jobicy jobs | None | Client query cache |
| `https://en.wikipedia.org/w/api.php?action=query&list=search` | Wikipedia Search API for company disambiguation | None | Client query cache |
| `https://en.wikipedia.org/api/rest_v1/page/summary` | Wikipedia Summary API | None | Client query cache |

**Environment Variables:**
- ZERO environment variables required.

---

## 🔑 Key Flows

### Discover → Save to Pipeline
```
User searches role + location
  → Client fetches 4 sources directly → normalizes → dedupes
  → Displays results as enriched cards (logo, freshness badge, salary if provided)
  → Wikipedia blurb fetched on demand per company using a search-and-verify logic to avoid wrong company matches.
  → User clicks "Save to Pipeline"
    → Check: does company+role exist in Dexie?
      → YES: Show confirm dialog
      → NO: Create Application
    → Redirect to /app/applications
```

---

## 🛡️ Security Rules

Since the application has ZERO backend, all security is strictly client-side:

1. **DOMPurify** — sanitize ALL rendered external content (notes, interviewPrep notes, descriptionSnippet, Wikipedia blurb) after markdown/HTML conversion, no exceptions.
2. **URL validation** — Zod schema validation (http/https only) for jobUrl, linkedinUrl, and external job urls before rendering as links or fetching.
3. **CSP** — Enforced via `vercel.json` headers to restrict origins: `default-src 'self'; img-src 'self' data: logo.clearbit.com ui-avatars.com; connect-src 'self' remotive.com *.remotive.com arbeitnow.com www.arbeitnow.com remoteok.com jobicy.com en.wikipedia.org; script-src 'self'`.
4. **CSV injection guarding** — Prefix cells starting with `=,+,-,@`, tab, CR with apostrophe on export.
5. **JSON import validation** — Validated completely with Zod before writing to Dexie.
6. **No `eval`/`new Function`/dynamic `import()`** — of any string derived from user input or external API.
7. **Throttling/Debouncing** — Client-side debouncing on search inputs (Discover page) to prevent rate limiting from free APIs.
8. **Pin dependencies** — DOMPurify and marked versions must be pinned.
9. **Zero Environment Variables** — The app requires absolutely no configured environment variables to build or run.
10. **No analytics/tracking scripts**.
11. **Metadata Consistency Rule** — Whenever a feature/integration is removed, grep for and update all references to it in metadata, README, and UI copy in the same pass so false claims are never shipped.

---

## 📋 Build Order

| # | Phase | Status |
|---|-------|--------|
| 1 | Dexie schema + CRUD hooks (no seed data) | ✅ Done |
| 2 | jobSources/ normalizers + API routes | ✅ Done (Client-side) |
| 3 | Table/List view | ✅ Done |
| 4 | Application detail form | ✅ Done |
| 5 | Kanban board | ✅ Done |
| 6 | Dashboard/Today view | ✅ Done |
| 7 | Discover page | ✅ Done |
| 8 | Import/Export | ✅ Done (Settings page) |
| 9 | Polish (empty states, dark mode, a11y, responsive) | ✅ Done |
| 10 | Landing page + routing restructure | ✅ Done |
| 11 | Data enrichment (logos, blurbs, freshness badges) | ✅ Done |
| 12 | Design system (violet palette, fonts, motion) | ✅ Done |
| 13 | Backend Removal & Correct Data Fetching | ✅ Done |
| 14 | Remove seed data, fix devtools in prod | ✅ Done |
| 15 | New SaaS Landing Page & UX Polish | ✅ Done |

