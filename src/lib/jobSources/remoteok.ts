import type { ExternalJobListing } from "@/lib/types";

export function normalizeRemoteok(jobs: any[], fetchedAt: string): ExternalJobListing[] {
  const validJobs: ExternalJobListing[] = [];
  
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (i === 0 && job.legal) continue;

    if (!job.id || !job.company || !job.position || !job.url) {
      console.warn("RemoteOK: Missing expected fields", job);
      continue;
    }

    let salaryText = undefined;
    if (job.salary_min && job.salary_max) {
      salaryText = `$${job.salary_min} - $${job.salary_max}`;
    }

    validJobs.push({
      id: `remoteok-${job.id}`,
      source: "remoteok",
      company: job.company,
      role: job.position,
      location: job.location || "Remote",
      url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
      postedDate: job.date,
      salaryText,
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
