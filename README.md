# Job Search Command Center

A strictly local-first, zero-backend job search and application tracking tool. 

**Job Search Command Center** is designed to let you discover remote roles across multiple global job boards and track your application pipeline visually, without ever creating an account or handing over your data to a server.

## Features

- **Live Job Discovery:** Instantly search live listings from **Remotive**, **RemoteOK**, **Arbeitnow**, and **Jobicy** all at once directly from your browser. 
- **Visual Kanban Pipeline:** Manage your applications with a beautiful drag-and-drop board. Move jobs from "Saved" to "Applied" to "Interviewing" effortlessly.
- **Strictly Local-First (Zero Backend):** Everything lives in your browser's IndexedDB. No backend servers, no tracking, no forced logins. Your data is yours.
- **One-Click Pipeline Saves:** Found a job you like? Click "Save to Pipeline" and it instantly becomes a tracked card with the company name, role, and URL pre-filled.
- **Dark Mode Support:** A sleek, fully responsive interface that resizes perfectly on mobile and respects your system's color scheme preferences.

## Tech Stack

- **Framework:** Next.js (App Router, exported as a purely static site)
- **Styling:** Tailwind CSS, Framer Motion for smooth animations, Lucide React for icons
- **State & Data:** Dexie (IndexedDB wrapper) for local persistence, Zustand for global state, TanStack React Query for fetching live APIs.
- **Zero Backend:** There are absolutely no API routes, no server actions, and no secrets in this repository. 

## Getting Started

Because there are no backend dependencies or environment variables, running the app locally is incredibly easy:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

Since the architecture is Zero Backend, you can deploy this completely for free as a Static Site on Vercel, Netlify, or GitHub Pages.

```bash
# Build the static export
npm run build
```

The output will be placed in the `out/` directory, ready to be hosted anywhere.

*(Note: The Content-Security-Policy in `vercel.json` restricts API calls strictly to the 4 approved job boards and Wikipedia for company data, ensuring zero data exfiltration).*

