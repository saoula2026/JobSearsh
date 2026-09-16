import type { ExternalJobListing } from "@/lib/types";

export function normalizeJobicy(jobs: any[], fetchedAt: string): ExternalJobListing[] {
  const validJobs: ExternalJobListing[] = [];
  
  for (const job of jobs) {
    if (!job.id || !job.companyName || !job.jobTitle || !job.url) {
      console.warn("Jobicy: Missing expected fields", job);
      continue;
    }

    let salaryText = undefined;
    if (job.salaryMin && job.salaryMax) {
      salaryText = `${job.salaryCurrency || "$"}${job.salaryMin} - ${job.salaryCurrency || "$"}${job.salaryMax}`;
    }

    validJobs.push({
      id: `jobicy-${job.id}`,
      source: "jobicy",
      company: job.companyName,
      role: job.jobTitle,
      location: job.jobGeo || "Remote",
      url: job.url,
      postedDate: job.pubDate,
      salaryText,
      tags: Array.isArray(job.jobIndustry) ? job.jobIndustry : [],
      descriptionSnippet: stripHtml(job.jobDescription || "").slice(0, 300),
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
