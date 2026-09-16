import type { ExternalJobListing } from "@/lib/types";

export function normalizeArbeitnow(
  jobs: any[],
  fetchedAt: string
): ExternalJobListing[] {
  const validJobs: ExternalJobListing[] = [];
  
  for (const job of jobs) {
    if (!job.slug || !job.company_name || !job.title || !job.url) {
      console.warn("Arbeitnow: Missing expected fields", job);
      continue;
    }

    validJobs.push({
      id: `arbeitnow-${job.slug}`,
      source: "arbeitnow",
      company: job.company_name,
      role: job.title,
      location: job.location || "Not specified",
      url: job.url,
      postedDate: job.created_at ? new Date(job.created_at * 1000).toISOString() : undefined,
      tags: Array.isArray(job.tags) ? job.tags : [],
      descriptionSnippet: stripHtml(job.description || "").slice(0, 300),
      fetchedAt,
    });
  }

  return validJobs;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
