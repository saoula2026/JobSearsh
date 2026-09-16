import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Search, LayoutTemplate } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0a18] text-[#0f0a1e] dark:text-[#f0ecff] font-sans selection:bg-violet-200 dark:selection:bg-violet-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-[#2d2650] bg-white/80 dark:bg-[#0d0a18]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">Job Command Center</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm font-medium hover:text-violet-600 transition-colors hidden sm:block">
              Open Dashboard
            </Link>
            <Link
              href="/app"
              className="text-sm font-semibold bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-100 dark:border-violet-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Now syncing with 4 global job boards
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
            The professional operating system for your job search.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-[#c4bce0] max-w-2xl mx-auto mb-10 leading-relaxed">
            Search live remote roles across multiple boards instantly, and track every application in a secure, local-first Kanban pipeline. No accounts, no subscriptions, zero data tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-violet-600 text-white transition-all hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20 active:scale-95"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="bg-gray-50 dark:bg-[#13102a] border-y border-gray-100 dark:border-[#2d2650] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1630] border border-gray-100 dark:border-[#2d2650] flex items-center justify-center mb-6 shadow-sm">
                  <Search className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Live Aggregation</h3>
                <p className="text-gray-600 dark:text-[#9b92b3] leading-relaxed">
                  Stop checking ten different websites. We query Remotive, RemoteOK, Arbeitnow, and Jobicy simultaneously to bring you live roles in one unified feed.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1630] border border-gray-100 dark:border-[#2d2650] flex items-center justify-center mb-6 shadow-sm">
                  <LayoutTemplate className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Visual Pipeline</h3>
                <p className="text-gray-600 dark:text-[#9b92b3] leading-relaxed">
                  Manage your applications with a professional Kanban board. Drag and drop from "Applied" to "Interviewing" to "Offer" with complete clarity.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1630] border border-gray-100 dark:border-[#2d2650] flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Absolute Privacy</h3>
                <p className="text-gray-600 dark:text-[#9b92b3] leading-relaxed">
                  We don't want your data. Job Command Center is a strict local-first application. Everything lives in your browser's IndexedDB. Zero backend tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-24 max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ fontFamily: "var(--font-jakarta)" }}>
            Everything you need. Nothing you don't.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
            {[
              "Instant search without registration",
              "Drag-and-drop Kanban interface",
              "Automated company Wikipedia summaries",
              "Follow-up reminder tracking",
              "Dark mode and Light mode support",
              "100% free and open-source architecture",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-[#c4bce0] font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-[#2d2650] py-12 bg-white dark:bg-[#0d0a18]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500 dark:text-[#9b92b3]">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-violet-600" />
            <span className="font-semibold text-gray-900 dark:text-white">Job Command Center</span>
          </div>
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} All rights reserved. A local-first utility.</p>
            <p className="mt-1 text-xs">Developed by a.y.saoula</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
