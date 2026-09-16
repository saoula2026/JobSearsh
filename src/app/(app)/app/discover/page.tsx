"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, ExternalLink, Plus, MapPin, Calendar, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import CompanyLogo from "@/components/ui/CompanyLogo";
import SourceFreshnessBadge from "@/components/ui/SourceFreshnessBadge";
import { createApplication, findByCompanyRole } from "@/lib/hooks";
import type { ExternalJobListing } from "@/lib/types";
import { fetchAllJobs } from "@/lib/jobSources/index";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";

// ── Relative time helper ─────────────────────────────────────────────────────
function relativeTime(isoString?: string): string {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(isoString).toLocaleDateString();
}

// ── Debounce Hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Company blurb hook ────────────────────────────────────────────────────────
function useCompanyBlurb(company: string, enabled: boolean) {
  return useQuery<{ blurb: string | null }>({
    queryKey: ["company-blurb", company],
    queryFn: async () => {
      // 1. Search for company name
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(company)}&format=json&origin=*`);
      if (!searchRes.ok) return { blurb: null };
      const searchData = await searchRes.json();
      
      const results = searchData.query?.search;
      if (!results || results.length === 0) return { blurb: null };

      // 2. Conservative heuristic
      const topResult = results[0];
      const titleLower = topResult.title.toLowerCase();
      const companyLower = company.toLowerCase().trim();
      
      const isExactMatch = titleLower === companyLower;
      // Job board says "Google Inc", Wiki says "Google" -> valid
      const isJobBoardVariant = companyLower.includes(titleLower) && titleLower.length > 2;
      // Wiki says "Apple (company)", Job board says "Apple" -> valid
      const isWikiVariant = titleLower.includes(companyLower) && 
        (titleLower.includes("inc") || titleLower.includes("corp") || titleLower.includes("ltd") || titleLower.includes("company") || titleLower.includes("software"));
      // Snippet mentions it's a company/business
      const snippetLower = topResult.snippet.toLowerCase();
      const hasBusinessSnippet = snippetLower.includes("company") || snippetLower.includes("corporation") || snippetLower.includes("business") || snippetLower.includes("startup") || snippetLower.includes("platform");

      if (!isExactMatch && !isJobBoardVariant && !isWikiVariant && !hasBusinessSnippet) {
        return { blurb: null };
      }

      // 3. Fetch summary
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topResult.title)}`);
      if (!summaryRes.ok) return { blurb: null };
      const summaryData = await summaryRes.json();

      return { blurb: typeof window !== "undefined" ? DOMPurify.sanitize(summaryData.extract, { ALLOWED_TAGS: [] }) : summaryData.extract };
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

// ── Stagger animation variants ────────────────────────────────────────────────
const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// ── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  listing,
  onSave,
  isSaving,
}: {
  listing: ExternalJobListing;
  onSave: () => void;
  isSaving: boolean;
}) {
  const [blurbVisible, setBlurbVisible] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const blurbQuery = useCompanyBlurb(listing.company, blurbVisible);

  const safeSnippet = typeof window !== "undefined"
    ? DOMPurify.sanitize(listing.descriptionSnippet, { ALLOWED_TAGS: [] })
    : listing.descriptionSnippet;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(76,29,149,0.18)" }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CompanyLogo company={listing.company} size={40} />
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg leading-tight truncate"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              {listing.role}
            </h3>
            <p className="text-sm truncate mt-0.5 font-medium" style={{ color: "var(--text-secondary)" }}>
              {listing.company}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <SourceFreshnessBadge source={listing.source} fetchedAt={listing.fetchedAt} />
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {listing.location}
        </span>
        {listing.postedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {relativeTime(listing.postedDate)}
          </span>
        )}
      </div>
      
      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium" style={{ color: listing.salaryText ? "var(--success)" : "var(--text-muted)" }}>
        {listing.salaryText ? listing.salaryText : "Not disclosed"}
      </div>

      {listing.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {listing.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--bg-base)",
                color: "var(--text-muted)",
                border: "1px solid var(--bg-border)",
              }}
            >
              {tag}
            </span>
          ))}
          {listing.tags.length > 4 && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--bg-base)",
                color: "var(--text-muted)",
                border: "1px solid var(--bg-border)",
              }}
            >
              +{listing.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {safeSnippet && (
        <div className="px-4 pb-3">
          <div 
            className={`text-xs leading-relaxed ${descExpanded ? "max-h-[30vh] overflow-y-auto" : "line-clamp-3"}`} 
            style={{ color: "var(--text-muted)" }}
          >
            {safeSnippet}
          </div>
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="mt-1 text-xs font-medium min-h-[44px] flex items-center"
            style={{ color: "var(--accent-600)" }}
          >
            {descExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}

      <div className="px-4 pb-3">
        <button
          onClick={() => setBlurbVisible((v) => !v)}
          className="text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded min-h-[44px] w-full text-left flex items-center"
          style={{ color: "var(--accent-600)" }}
          aria-expanded={blurbVisible}
        >
          {blurbVisible ? "Hide company info ↑" : "About this company ↓"}
        </button>
        <AnimatePresence>
          {blurbVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {blurbQuery.isLoading && (
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Loading…</p>
              )}
              {blurbQuery.data?.blurb && (
                <p className="text-xs leading-relaxed mt-2" style={{ color: "var(--text-muted)" }}>
                  {blurbQuery.data.blurb}
                </p>
              )}
              {blurbQuery.data?.blurb === null && !blurbQuery.isLoading && (
                <p className="text-xs mt-2 italic" style={{ color: "var(--text-muted)" }}>
                  No company summary available.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />

      <div
        className="px-4 py-3 flex items-center gap-2 border-t"
        style={{ borderColor: "var(--bg-border)" }}
      >
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] flex-1 sm:flex-none"
          style={{
            backgroundColor: "var(--bg-raised)",
            color: "var(--text-secondary)",
            border: "1px solid var(--bg-border)",
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          View original
        </a>
        <Button size="sm" onClick={onSave} disabled={isSaving} className="flex-1 sm:flex-none">
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          {isSaving ? "Saving…" : "Save to Pipeline"}
        </Button>
      </div>
    </motion.article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const searchRole = useDebounce(role, 800);
  const searchLocation = useDebounce(location, 800);

  const jobsQuery = useQuery<{ jobs: ExternalJobListing[], errors: string[] }>({
    queryKey: ["jobs", searchRole, searchLocation],
    queryFn: async () => fetchAllJobs(searchRole, searchLocation),
    enabled: !!searchRole || !!searchLocation,
  });

  const handleSaveToPipeline = async (listing: ExternalJobListing) => {
    setSavingId(listing.id);
    try {
      const existing = await findByCompanyRole(listing.company, listing.role);
      if (existing) {
        if (!confirm(`${listing.company} — ${listing.role} already exists. Create a duplicate?`)) {
          return;
        }
      }
      await createApplication({
        id: crypto.randomUUID(),
        company: listing.company,
        role: listing.role,
        source: listing.source,
        location: listing.location,
        jobUrl: listing.url,
        status: "wishlist",
        notes: `Discovered via ${listing.source}.\n\n${typeof window !== "undefined" ? DOMPurify.sanitize(listing.descriptionSnippet, { ALLOWED_TAGS: [] }) : listing.descriptionSnippet}`,
        tags: listing.tags.slice(0, 5),
        archived: false,
      });
      router.push("/app/applications");
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSavingId(null);
    }
  };

  const hasSearched = !!searchRole || !!searchLocation;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
        >
          Discover Jobs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Live results directly from Remotive, RemoteOK, Arbeitnow &amp; Jobicy.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <Input
            placeholder="Role (e.g. React Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <Input
            placeholder="Location (e.g. Remote, Berlin)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {jobsQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading jobs…" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {jobsQuery.isError && (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)", border: "1px solid #fca5a5" }}>
          Failed to load jobs completely. Please check your connection.
        </div>
      )}

      {jobsQuery.data && jobsQuery.data.jobs.length === 0 && (
        <EmptyState
          title="No jobs found"
          description="Try a different role or location, or broaden your search terms."
          illustration="discover"
        />
      )}

      {jobsQuery.data && jobsQuery.data.jobs.length > 0 && (
        <>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            {jobsQuery.data.jobs.length} result{jobsQuery.data.jobs.length !== 1 ? "s" : ""}
          </p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {jobsQuery.data.jobs.map((listing) => (
              <JobCard
                key={listing.id}
                listing={listing}
                onSave={() => handleSaveToPipeline(listing)}
                isSaving={savingId === listing.id}
              />
            ))}
          </motion.div>
        </>
      )}

      {!hasSearched && !jobsQuery.isLoading && (
        <EmptyState
          title="Search for live jobs"
          description="Type to discover openings from 4 job boards directly in your browser."
          illustration="search"
        />
      )}
    </div>
  );
}
