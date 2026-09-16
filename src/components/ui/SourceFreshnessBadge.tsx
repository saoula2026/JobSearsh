"use client";

import { Clock, Info } from "lucide-react";

interface SourceFreshnessBadgeProps {
  source: string;
  fetchedAt: string; // ISO 8601
  className?: string;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SOURCE_LABELS: Record<string, string> = {
  remotive:   "Remotive",
  arbeitnow:  "Arbeitnow",
  remoteok:   "RemoteOK",
  jobicy:     "Jobicy",
};

export default function SourceFreshnessBadge({
  source,
  fetchedAt,
  className = "",
}: SourceFreshnessBadgeProps) {
  const label = SOURCE_LABELS[source] ?? source;
  const relativeTime = formatRelativeTime(fetchedAt);

  return (
    <div className={`relative group inline-block ${className}`}>
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium cursor-help"
        style={{
          backgroundColor: "var(--accent-50)",
          color: "var(--accent-700)",
          border: "1px solid var(--accent-200)",
        }}
      >
        <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{relativeTime}</span>
      </span>

      {/* Hover tooltip */}
      <div 
        className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none z-10 w-max"
      >
        <div 
          className="px-2.5 py-1.5 rounded-md text-xs font-medium shadow-lg"
          style={{
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--bg-border)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3" style={{ color: "var(--accent-600)" }} />
            <span>Live from {label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
