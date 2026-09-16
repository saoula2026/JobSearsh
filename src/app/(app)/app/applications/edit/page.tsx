"use client";

import { use } from "react";
import { useApplication, updateApplication, deleteApplication } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import CompanyLogo from "@/components/ui/CompanyLogo";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FormData {
  company: string;
  role: string;
  location: string;
  status: string;
  jobUrl: string;
  appliedDate: string;
  salaryRange: string;
  nextActionDate: string;
  nextActionNote: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: "wishlist",     label: "Wishlist" },
  { value: "applied",      label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview",    label: "Interview" },
  { value: "offer",        label: "Offer" },
  { value: "rejected",     label: "Rejected" },
  { value: "withdrawn",    label: "Withdrawn" },
];

const SOURCE_LABELS: Record<string, string> = {
  remotive:  "Remotive",
  arbeitnow: "Arbeitnow",
  remoteok:  "RemoteOK",
  jobicy:    "Jobicy",
};

// ── Company panel for non-manual applications ────────────────────────────────

function CompanyPanel({ company, source, jobUrl }: { company: string; source: string; jobUrl?: string }) {
  // Fetch Wikipedia blurb for discovered jobs — graceful degradation if null
  const blurbQuery = useQuery<{ blurb: string | null }>({
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
      const companyLower = company.toLowerCase();
      
      const isExactMatch = titleLower === companyLower;
      const isCompanyVariant = titleLower.includes(companyLower) && 
        (titleLower.includes("inc") || titleLower.includes("corp") || titleLower.includes("ltd") || titleLower.includes("company") || titleLower.includes("software"));
      const hasBusinessSnippet = topResult.snippet.toLowerCase().includes("company") || topResult.snippet.toLowerCase().includes("corporation");

      if (!isExactMatch && !isCompanyVariant && !hasBusinessSnippet) {
        return { blurb: null };
      }

      // 3. Fetch summary
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topResult.title)}`);
      if (!summaryRes.ok) return { blurb: null };
      const summaryData = await summaryRes.json();
      
      const DOMPurify = (await import('dompurify')).default;
      return { blurb: typeof window !== "undefined" ? DOMPurify.sanitize(summaryData.extract, { ALLOWED_TAGS: [] }) : summaryData.extract };
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const sourceLabel = SOURCE_LABELS[source] ?? source;

  return (
    <div
      className="rounded-xl p-4 mb-6 flex items-start gap-4"
      style={{
        backgroundColor: "var(--accent-50)",
        border: "1px solid var(--accent-100)",
      }}
    >
      <CompanyLogo company={company} size={48} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h2
            className="font-bold text-base"
            style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
          >
            {company}
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "var(--accent-100)",
              color: "var(--accent-700)",
              border: "1px solid var(--accent-200)",
            }}
          >
            via {sourceLabel}
          </span>
        </div>

        {/* Blurb — only rendered if Wikipedia returned something */}
        {!blurbQuery.isLoading && blurbQuery.data?.blurb && (
          <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
            {blurbQuery.data.blurb}
          </p>
        )}

        {jobUrl && (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded"
            style={{ color: "var(--accent-600)" }}
            aria-label={`View original job posting for ${company} (opens in new tab)`}
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            View original job posting →
          </a>
        )}
      </div>
    </div>
  );
}

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ── Page ──────────────────────────────────────────────────────────────────────

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { application, isLoading } = useApplication(id || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    values: application
      ? {
          company:       application.company,
          role:          application.role,
          location:      application.location || "",
          status:        application.status,
          jobUrl:        application.jobUrl || "",
          appliedDate:   application.appliedDate || "",
          salaryRange:   application.salaryRange || "",
          nextActionDate: application.nextActionDate || "",
          nextActionNote: application.nextActionNote || "",
          notes:         application.notes || "",
        }
      : undefined,
  });

  if (!id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p style={{ color: "var(--text-muted)" }}>No application ID provided.</p>
        <Link href="/app/applications">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4" aria-busy="true">
        <div className="h-8 w-32 rounded-lg shimmer" />
        <div className="h-20 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p style={{ color: "var(--text-muted)" }}>Application not found.</p>
        <Link href="/app/applications">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await updateApplication(id, {
        ...data,
        status: data.status as
          | "wishlist" | "applied" | "phone_screen"
          | "interview" | "offer" | "rejected" | "withdrawn",
      });
      router.push("/app/applications");
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this application?")) {
      await deleteApplication(id);
      router.push("/app/applications");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/app/applications">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <Button variant="danger" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      </div>

      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
      >
        Edit Application
      </h1>

      {/* Company panel — only for non-manual sources */}
      {application.source && application.source !== "manual" && (
        <CompanyPanel
          company={application.company}
          source={application.source}
          jobUrl={application.jobUrl}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--bg-border)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company"
              {...register("company", { required: "Company is required" })}
              error={errors.company?.message}
            />
            <Input
              label="Role"
              {...register("role", { required: "Role is required" })}
              error={errors.role?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Location" {...register("location")} error={errors.location?.message} />
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              {...register("status")}
              error={errors.status?.message}
            />
          </div>
          <Input label="Job URL" {...register("jobUrl")} error={errors.jobUrl?.message} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Applied Date"
              type="date"
              {...register("appliedDate")}
              error={errors.appliedDate?.message}
            />
            <Input
              label="Salary Range"
              {...register("salaryRange")}
              placeholder="e.g. $100k – $140k"
              error={errors.salaryRange?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Next Action Date"
              type="date"
              {...register("nextActionDate")}
              error={errors.nextActionDate?.message}
            />
            <Input
              label="Next Action Note"
              {...register("nextActionNote")}
              error={errors.nextActionNote?.message}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/app/applications">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default function ApplicationDetailPage() { return <Suspense fallback={<div>Loading...</div>}><EditForm /></Suspense>; }
