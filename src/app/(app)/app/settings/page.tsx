"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLiveQuery } from "dexie-react-hooks";
import { userSettings } from "@/lib/db";
import {
  Bell,
  Shield,
  Palette,
  Info,
  CheckCircle2,
  Globe,
} from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function saveSetting<K extends keyof typeof defaultPrefs>(
  key: K,
  value: (typeof defaultPrefs)[K]
) {
  const existing = await userSettings.get(1);
  await userSettings.put({
    id: 1,
    pipelineStages: existing?.pipelineStages ?? defaultPrefs.pipelineStages,
    defaultFollowUpDays: existing?.defaultFollowUpDays ?? defaultPrefs.defaultFollowUpDays,
    theme: existing?.theme ?? defaultPrefs.theme,
    [key]: value,
  });
}

const defaultPrefs = {
  pipelineStages: [
    "wishlist",
    "applied",
    "phone_screen",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
  ] as ApplicationStatus[],
  defaultFollowUpDays: 7,
  theme: "system" as "light" | "dark" | "system",
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
      }}
      aria-labelledby={`section-${title.replace(/\s/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--accent-50)" }}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" style={{ color: "var(--accent-600)" }} />
        </div>
        <h2
          id={`section-${title.replace(/\s/g, "-").toLowerCase()}`}
          className="text-base font-semibold"
          style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b last:border-b-0" style={{ borderColor: "var(--bg-border)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────


export default function SettingsPage() {
  const settings = useLiveQuery(() => userSettings.get(1));
  const [saved, setSaved] = useState(false);

  const followUpDays = settings?.defaultFollowUpDays ?? defaultPrefs.defaultFollowUpDays;
  const theme = settings?.theme ?? defaultPrefs.theme;

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFollowUpChange = async (value: number) => {
    await saveSetting("defaultFollowUpDays", value);
    flashSaved();
  };

  const handleThemeChange = async (value: "light" | "dark" | "system") => {
    await saveSetting("theme", value);
    flashSaved();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Preferences
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Adjust how the app works for you.
          </p>
        </div>

        {/* Saved confirmation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: saved ? 1 : 0, scale: saved ? 1 : 0.9 }}
          aria-live="polite"
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "var(--success)" }}
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          Saved
        </motion.div>
      </div>

      <div className="space-y-4">
        {/* ── Follow-up reminders ── */}
        <Section icon={Bell} title="Follow-up Reminders">
          <Row
            label="Default reminder window"
            description="How many days after applying before a follow-up is suggested."
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                value={followUpDays}
                onChange={(e) => handleFollowUpChange(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-lg text-sm text-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
                style={{
                  backgroundColor: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  color: "var(--text-primary)",
                }}
                aria-label="Default follow-up days"
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                days
              </span>
            </div>
          </Row>
        </Section>

        {/* ── Appearance ── */}
        <Section icon={Palette} title="Appearance">
          <Row
            label="Color theme"
            description="Choose how the app looks. 'System' follows your device setting."
          >
            <div
              className="flex rounded-lg p-0.5"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--bg-border)",
              }}
              role="group"
              aria-label="Color theme"
            >
              {(["light", "system", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
                  style={{
                    backgroundColor: theme === t ? "var(--bg-surface)" : "transparent",
                    color: theme === t ? "var(--accent-700)" : "var(--text-muted)",
                    boxShadow: theme === t ? "var(--shadow-sm)" : "none",
                  }}
                  aria-pressed={theme === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
          <Row
            label="Font size"
            description="Controlled by your browser/OS accessibility settings."
          >
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Use browser zoom (Ctrl + / Ctrl -)
            </span>
          </Row>
        </Section>

        {/* ── Job sources ── */}
        <Section icon={Globe} title="Job Sources">
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
            The Discover page always searches all available sources simultaneously. These are the live feeds used:
          </p>
          {[
            { name: "Remotive", url: "https://remotive.com", type: "Remote jobs" },
            { name: "RemoteOK", url: "https://remoteok.com", type: "Remote jobs" },
            { name: "Arbeitnow", url: "https://www.arbeitnow.com", type: "EU & remote jobs" },
            { name: "Jobicy", url: "https://jobicy.com", type: "Remote jobs" },
          ].map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
              style={{ borderColor: "var(--bg-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {source.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {source.type}
                </p>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded"
                style={{ color: "var(--accent-600)" }}
              >
                Visit site ↗
              </a>
            </div>
          ))}
        </Section>

        {/* ── Privacy ── */}
        <Section icon={Shield} title="Privacy &amp; Your Data">
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} aria-hidden="true" />
              <p>
                <strong style={{ color: "var(--text-primary)" }}>All your data is stored on your device only.</strong>{" "}
                Applications, notes, contacts — everything lives in your browser&apos;s local storage (IndexedDB). Nothing is uploaded to any server.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} aria-hidden="true" />
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Job searches happen directly in your browser.</strong>{" "}
                When you search for jobs, your browser fetches results directly from external APIs. No search terms are logged or stored on any intermediate server.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} aria-hidden="true" />
              <p>
                <strong style={{ color: "var(--text-primary)" }}>No account required.</strong>{" "}
                There is no sign-up, no login, no email. You are not tracked.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} aria-hidden="true" />
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Company logos are loaded from Clearbit.</strong>{" "}
                These are small image requests. Clearbit may log the company name. No personal data is involved.
              </p>
            </div>
          </div>
        </Section>

        {/* ── About ── */}
        <Section icon={Info} title="About">
          <div className="text-sm space-y-1.5" style={{ color: "var(--text-muted)" }}>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>Job Search Command Center</strong>
              {" "}— a personal job pipeline tracker with live job discovery.
            </p>
            <p>Job data is sourced from Remotive, RemoteOK, Arbeitnow, and Jobicy via their free public APIs.</p>
            <p>Company summaries are fetched from Wikipedia&apos;s free REST API.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
