"use client";

import { useState, memo } from "react";

interface CompanyLogoProps {
  company: string;
  size?: number;
  className?: string;
}

/**
 * Best-effort company logo via Clearbit public logo API.
 * Falls back to ui-avatars.com initials avatar on 404.
 *
 * Security:
 * - Both URLs are allowlisted in next.config.ts img-src CSP
 * - No API keys required for either service
 * - company name is URL-encoded before embedding in src
 * - onError swaps to a safe fallback — no eval, no innerHTML
 */
function CompanyLogoInner({ company, size = 40, className = "" }: CompanyLogoProps) {
  const [errored, setErrored] = useState(false);

  // Slugify: lowercase, only alphanumeric, then append .com
  // This is a best-effort guess — not guaranteed to be the real domain
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 50); // hard cap to prevent oversized URLs

  const clearbitUrl = `https://logo.clearbit.com/${encodeURIComponent(slug)}.com`;

  // Safe fallback: initials avatar via ui-avatars.com (no keys, no personal data beyond company name)
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.slice(0, 40))}&size=${size * 2}&background=ddd6fe&color=6d28d9&bold=true&length=2&format=png`;

  const src = errored ? fallbackUrl : clearbitUrl;

  return (
    <img
      src={src}
      alt={`${company} logo`}
      width={size}
      height={size}
      className={`rounded-lg object-contain flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        border: "1px solid var(--bg-border)",
        backgroundColor: "var(--bg-raised)",
      }}
      onError={() => {
        if (!errored) setErrored(true);
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

// Memo to avoid re-fetching on every parent re-render
const CompanyLogo = memo(CompanyLogoInner);
export default CompanyLogo;
