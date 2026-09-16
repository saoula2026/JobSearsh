export { normalizeRemotive } from "./remotive";
export { normalizeArbeitnow } from "./arbeitnow";
export { normalizeRemoteok } from "./remoteok";
export { normalizeJobicy } from "./jobicy";

import type { ExternalJobListing } from "@/lib/types";
import { normalizeRemotive } from "./remotive";
import { normalizeArbeitnow } from "./arbeitnow";
import { normalizeRemoteok } from "./remoteok";
import { normalizeJobicy } from "./jobicy";
import { REGION_TO_COUNTRIES, COUNTRY_TO_CITIES } from "../locationMapping";

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
  // Normalize spacing for queries
  const roleClean = role ? role.trim().replace(/\s+/g, " ").toLowerCase() : "";
  const locationClean = location ? location.trim().replace(/\s+/g, " ").toLowerCase() : "";

  const roleQuery = roleClean ? encodeURIComponent(roleClean) : "";
  const locationQuery = locationClean ? encodeURIComponent(locationClean) : "";
  
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
        
        // Client-side filtering
        if (roleClean) {
          const roleTokens = roleClean.split(" ");
          // Strip punctuation for matching (e.g. Next.js -> Nextjs)
          const stripPunctuation = (str: string) => str.replace(/[^\w\s]/g, "");
          
          normalized = normalized.filter((j: ExternalJobListing) => {
            const rawSearchableText = `${j.role} ${j.company} ${j.tags.join(" ")}`.toLowerCase();
            const cleanSearchableText = stripPunctuation(rawSearchableText);
            
            return roleTokens.every(token => {
              const cleanToken = stripPunctuation(token);
              // if token has punctuation (like "next.js"), try both exact raw search or stripped search
              return rawSearchableText.includes(token) || (cleanToken && cleanSearchableText.includes(cleanToken));
            });
          });
        }
        
        if (locationClean && locationClean !== "remote") {
          // Build expansion list
          const expandedLocations = [locationClean];
          
          // Region to countries
          if (REGION_TO_COUNTRIES[locationClean]) {
            expandedLocations.push(...REGION_TO_COUNTRIES[locationClean]);
            // Also add all cities in those countries
            REGION_TO_COUNTRIES[locationClean].forEach(country => {
              if (COUNTRY_TO_CITIES[country]) expandedLocations.push(...COUNTRY_TO_CITIES[country]);
            });
          }
          // Country to cities
          else if (COUNTRY_TO_CITIES[locationClean]) {
            expandedLocations.push(...COUNTRY_TO_CITIES[locationClean]);
          }

          normalized = normalized.filter((j: ExternalJobListing) => {
            const listingLoc = j.location.toLowerCase();
            // Match if any of the expanded location terms are a substring or word boundary match in the listing location
            return expandedLocations.some(term => {
              // Word boundary check for short terms like "us" or "uk"
              if (term.length <= 2) {
                const regex = new RegExp(`\\b${term}\\b`);
                return regex.test(listingLoc);
              }
              return listingLoc.includes(term);
            });
          });
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
