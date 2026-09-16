export { normalizeRemotive } from "./remotive";
export { normalizeArbeitnow } from "./arbeitnow";
export { normalizeRemoteok } from "./remoteok";
export { normalizeJobicy } from "./jobicy";

import type { ExternalJobListing } from "@/lib/types";
import { normalizeRemotive } from "./remotive";
import { normalizeArbeitnow } from "./arbeitnow";
import { normalizeRemoteok } from "./remoteok";
import { normalizeJobicy } from "./jobicy";

export function dedupeListings(
  listings: ExternalJobListing[]
): ExternalJobListing[] {
  const seen = new Map<string, ExternalJobListing>();

  for (const listing of listings) {
    const key = `${listing.company.toLowerCase()}:${listing.role.toLowerCase()}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, listing);
    } else {
      if (listing.url && !existing.url) {
        seen.set(key, listing);
      }
    }
  }

  return Array.from(seen.values());
}

export async function fetchAllJobs(role: string, location: string): Promise<{ jobs: ExternalJobListing[], errors: string[] }> {
  const roleQuery = role ? encodeURIComponent(role.toLowerCase()) : "";
  const locationQuery = location ? encodeURIComponent(location.toLowerCase()) : "";
  
  const sources = [
    {
      name: "remotive",
      url: roleQuery ? `https://remotive.com/api/remote-jobs?search=${roleQuery}` : `https://remotive.com/api/remote-jobs`,
      normalize: normalizeRemotive
    },
    {
      name: "arbeitnow",
      url: "https://www.arbeitnow.com/api/job-board-api", 
      normalize: normalizeArbeitnow
    },
    {
      name: "remoteok",
      url: roleQuery || locationQuery ? `https://remoteok.com/api?tags=${[roleQuery, locationQuery].filter(Boolean).join(",")}` : `https://remoteok.com/api`,
      normalize: normalizeRemoteok
    },
    {
      name: "jobicy",
      url: `https://jobicy.com/api/v2/remote-jobs?count=50`, 
      normalize: normalizeJobicy
    }
  ];

  const results = await Promise.allSettled(
    sources.map(async (s) => {
      try {
        const res = await fetch(s.url);
        if (!res.ok) throw new Error(`${s.name} returned ${res.status}`);
        const data = await res.json();
        return { name: s.name, data, normalize: s.normalize };
      } catch (err) {
        throw new Error(s.name);
      }
    })
  );

  let allJobs: ExternalJobListing[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  for (const result of results) {
    if (result.status === "fulfilled") {
      try {
        let normalized = result.value.normalize(
          result.value.name === "remotive" ? result.value.data.jobs || [] :
          result.value.name === "arbeitnow" ? result.value.data.data || [] :
          result.value.name === "jobicy" ? result.value.data.jobs || [] :
          result.value.data || [],
          now
        );
        
        // Always apply client-side filtering as a fallback since APIs are inconsistent
        if (role) {
          const roleLower = role.toLowerCase();
          normalized = normalized.filter((j: ExternalJobListing) => 
            j.role.toLowerCase().includes(roleLower) || 
            j.company.toLowerCase().includes(roleLower) ||
            j.tags.some((t: string) => t.toLowerCase().includes(roleLower))
          );
        }
        
        if (location && location.toLowerCase() !== "remote") {
          const locLower = location.toLowerCase();
          normalized = normalized.filter((j: ExternalJobListing) => j.location.toLowerCase().includes(locLower));
        }

        allJobs = allJobs.concat(normalized);
      } catch (err) {
        console.error(`Error normalizing ${result.value.name}:`, err);
        errors.push(result.value.name);
      }
    } else {
      errors.push(result.reason.message);
    }
  }
  
  return { jobs: dedupeListings(allJobs), errors };
}
