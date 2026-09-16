import type { ExternalJobListing } from "@/lib/types";

export function normalizeRemotive(jobs: any[], fetchedAt: string): ExternalJobListing[] {
  const validJobs: ExternalJobListing[] = [];
  
  for (const job of jobs) {
    if (!job.id || !job.company_name || !job.title || !job.url) {
      console.warn("Remotive: Missing expected fields", job);
      continue;
    }

    validJobs.push({
      id: `remotive-${job.id}`,
      source: "remotive",
      company: job.company_name,
      role: job.title,
      location: job.candidate_required_location || "Remote",
      url: job.url,
      postedDate: job.publication_date,
      salaryText: job.salary || undefined,
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
