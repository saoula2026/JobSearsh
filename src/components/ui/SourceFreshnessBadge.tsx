import { Clock } from "lucide-react";

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
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: "var(--accent-50)",
        color: "var(--accent-700)",
        border: "1px solid var(--accent-200)",
      }}
      title={`Fetched from ${label} at ${new Date(fetchedAt).toLocaleString()}`}
    >
      <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      <span>Live from {label}</span>
      <span style={{ color: "var(--text-muted)" }}>·</span>
      <span style={{ color: "var(--text-muted)" }}>{relativeTime}</span>
    </span>
  );
}
