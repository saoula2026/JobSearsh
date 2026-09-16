"use client";

import { useRef, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useApplications } from "@/lib/hooks";
import { CalendarClock, Briefcase, TrendingUp, CheckCircle, Compass, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";

// ── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = prevValue.current;
    const end = value;
    prevValue.current = end;
    if (start === end) return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(end);
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span ref={ref}>{value}</span>;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

type StatColor = "violet" | "red" | "amber" | "emerald" | "gray";

const colorMap: Record<StatColor, { bg: string; text: string; icon: string }> = {
  violet:  { bg: "var(--accent-50)",   text: "var(--accent-700)", icon: "var(--accent-600)" },
  red:     { bg: "var(--danger-bg)",   text: "var(--danger)",     icon: "var(--danger)" },
  amber:   { bg: "var(--warning-bg)",  text: "var(--warning)",    icon: "var(--warning)" },
  emerald: { bg: "var(--success-bg)",  text: "var(--success)",    icon: "var(--success)" },
  gray:    { bg: "var(--bg-raised)",   text: "var(--text-muted)", icon: "var(--text-muted)" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: StatColor;
  href?: string;
}) {
  const c = colorMap[color];

  const inner = (
    <motion.div
      className="rounded-xl p-5 flex items-center gap-4 card-hover"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        boxShadow: "var(--shadow-sm)",
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: c.bg }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: c.icon }} />
      </div>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p
          className="text-3xl font-bold leading-none"
          style={{ color: c.text, fontFamily: "var(--font-jakarta), sans-serif" }}
          aria-label={`${value} ${label}`}
        >
          <AnimatedCounter value={value} />
        </p>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ── Status helpers ────────────────────────────────────────────────────────────

function getStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    wishlist:     { backgroundColor: "var(--bg-raised)", color: "var(--text-muted)" },
    applied:      { backgroundColor: "var(--info-bg)",    color: "var(--info)" },
    phone_screen: { backgroundColor: "var(--accent-50)",  color: "var(--accent-700)" },
    interview:    { backgroundColor: "var(--warning-bg)", color: "var(--warning)" },
    offer:        { backgroundColor: "var(--success-bg)", color: "var(--success)" },
    rejected:     { backgroundColor: "var(--danger-bg)",  color: "var(--danger)" },
    withdrawn:    { backgroundColor: "var(--bg-raised)",  color: "var(--text-muted)" },
  };
  return map[status] ?? map.wishlist;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// ── Card entrance stagger ─────────────────────────────────────────────────────

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden:   { opacity: 0, x: -12 },
  visible:  { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { applications, isLoading } = useApplications();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6" aria-busy="true" aria-label="Loading dashboard…">
        <div className="h-8 w-40 rounded-lg shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
        <div className="h-48 rounded-xl shimmer" />
      </div>
    );
  }

  const overdueItems = applications.filter(
    (a) => a.nextActionDate && new Date(a.nextActionDate) < new Date() && !a.archived
  );
  const activeApplications = applications.filter(
    (a) => !a.archived && a.status !== "rejected" && a.status !== "withdrawn"
  );
  const interviews = applications.filter((a) => a.status === "interview" && !a.archived);
  const offers = applications.filter((a) => a.status === "offer" && !a.archived);

  const recentActivity = applications
    .filter((a) => !a.archived)
    .sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime())
    .slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Your job search at a glance
        </p>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={Briefcase} label="Active Applications" value={activeApplications.length} color="violet" href="/app/applications" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={CalendarClock} label="Pending Actions" value={overdueItems.length} color={overdueItems.length > 0 ? "red" : "gray"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={TrendingUp} label="Interviews" value={interviews.length} color="amber" href="/app/board" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={CheckCircle} label="Offers" value={offers.length} color="emerald" href="/app/board" />
        </motion.div>
      </motion.div>

      {/* Overdue follow-ups */}
      {overdueItems.length > 0 && (
        <section className="mb-8" aria-labelledby="overdue-heading">
          <div className="flex items-center gap-2 mb-3">
            <h2
              id="overdue-heading"
              className="text-base font-semibold flex items-center gap-2"
              style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
            >
              <AlertTriangle className="w-5 h-5 text-red-500" style={{ color: "var(--danger)" }} />
              Overdue Follow-ups
            </h2>
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}
            >
              {
                overdueItems.filter((item, index, self) => 
                  index === self.findIndex((t) => (
                    t.company === item.company && t.role === item.role && t.nextActionDate === item.nextActionDate
                  ))
                ).length
              }
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueItems
              .filter((item, index, self) => 
                index === self.findIndex((t) => (
                  t.company === item.company && t.role === item.role && t.nextActionDate === item.nextActionDate
                ))
              )
              .map((app) => (
                <Link
                  key={app.id}
                  href={`/app/applications/edit?id=${app.id}`}
                  className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded-xl"
                >
                  <motion.div
                    className="p-4 rounded-xl relative overflow-hidden transition-all"
                    style={{ 
                      backgroundColor: "var(--bg-surface)", 
                      border: "1px solid var(--danger)", 
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.05)"
                    }}
                    whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(239, 68, 68, 0.1)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: "var(--danger)" }} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-semibold text-sm line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {app.company}
                        </h3>
                        <span className="text-xs font-medium whitespace-nowrap px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
                          Due {new Date(app.nextActionDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-1" style={{ color: "var(--text-muted)" }}>
                        {app.role}
                      </p>
                    </div>
                  </motion.div>
                </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section aria-labelledby="activity-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="activity-heading"
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
          >
            Recent Activity
          </h2>
          <Link
            href="/app/applications"
            className="text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded"
            style={{ color: "var(--accent-600)" }}
          >
            View all →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          /* ── Get-started panel: shown when the user has zero applications ── */
          <div className="space-y-4">
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "var(--accent-50)",
                border: "2px dashed var(--accent-200)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-100)" }}
                aria-hidden="true"
              >
                <Compass className="w-7 h-7" style={{ color: "var(--accent-600)" }} />
              </div>
              <h2
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
              >
                Start your job search
              </h2>
              <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
                You don&apos;t have any tracked applications yet. Browse live openings from 4 job boards, or add a job you already applied to.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/app/discover"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
                  style={{ backgroundColor: "var(--accent-600)" }}
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  Browse live jobs
                </Link>
                <Link
                  href="/app/applications"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add manually
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {recentActivity.map((app, idx) => (
              <motion.div
                key={app.id}
                variants={itemVariants}
                className="flex items-center justify-between px-4 py-3 transition-colors"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--bg-border)" : undefined,
                }}
              >
                <div>
                  <Link
                    href={`/app/applications/edit?id=${app.id}`}
                    className="font-medium text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {app.company}
                  </Link>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {app.role}{app.location ? ` · ${app.location}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                    style={getStatusStyle(app.status)}
                  >
                    {formatStatus(app.status)}
                  </span>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {new Date(app.lastActivityDate).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
