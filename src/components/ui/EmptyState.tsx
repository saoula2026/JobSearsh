"use client";

import { motion } from "framer-motion";
import Button from "./Button";

// Custom SVG illustrations for each empty state context
export const illustrations = {
  applications: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="20" y="30" width="80" height="60" rx="8" fill="var(--accent-100)" stroke="var(--accent-300)" strokeWidth="2"/>
      <rect x="30" y="45" width="40" height="4" rx="2" fill="var(--accent-300)"/>
      <rect x="30" y="55" width="60" height="3" rx="1.5" fill="var(--bg-border)"/>
      <rect x="30" y="63" width="50" height="3" rx="1.5" fill="var(--bg-border)"/>
      <rect x="30" y="71" width="35" height="3" rx="1.5" fill="var(--bg-border)"/>
      <circle cx="86" cy="44" r="14" fill="var(--accent-500)" opacity="0.15"/>
      <path d="M80 44 L84 48 L92 40" stroke="var(--accent-600)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  kanban: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="30" width="28" height="60" rx="6" fill="var(--bg-raised)" stroke="var(--bg-border)" strokeWidth="1.5"/>
      <rect x="16" y="36" width="20" height="12" rx="3" fill="var(--accent-200)"/>
      <rect x="16" y="52" width="20" height="12" rx="3" fill="var(--accent-100)"/>
      <rect x="46" y="30" width="28" height="60" rx="6" fill="var(--bg-raised)" stroke="var(--bg-border)" strokeWidth="1.5"/>
      <rect x="50" y="36" width="20" height="12" rx="3" fill="var(--accent-300)"/>
      <rect x="80" y="30" width="28" height="60" rx="6" fill="var(--bg-raised)" stroke="var(--bg-border)" strokeWidth="1.5"/>
      <circle cx="94" cy="60" r="10" fill="var(--accent-500)" opacity="0.2"/>
      <path d="M91 60 h6 M94 57 v6" stroke="var(--accent-600)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  discover: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="52" cy="52" r="26" fill="var(--accent-100)" stroke="var(--accent-300)" strokeWidth="2"/>
      <circle cx="52" cy="52" r="16" fill="var(--accent-50)" stroke="var(--accent-200)" strokeWidth="1.5"/>
      <path d="M52 40 L55 49 L64 49 L57 55 L60 64 L52 58 L44 64 L47 55 L40 49 L49 49 Z" fill="var(--accent-400)" opacity="0.6"/>
      <path d="M72 72 L86 86" stroke="var(--accent-500)" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="86" cy="86" r="5" fill="var(--accent-500)" opacity="0.4"/>
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="50" r="28" fill="var(--bg-raised)" stroke="var(--bg-border)" strokeWidth="2"/>
      <path d="M72 72 L88 88" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M40 50 h20 M50 40 v20" stroke="var(--accent-400)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  generic: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="30" y="25" width="60" height="70" rx="8" fill="var(--bg-raised)" stroke="var(--bg-border)" strokeWidth="2"/>
      <rect x="42" y="42" width="36" height="4" rx="2" fill="var(--accent-300)"/>
      <rect x="42" y="52" width="28" height="3" rx="1.5" fill="var(--bg-border)"/>
      <rect x="42" y="60" width="32" height="3" rx="1.5" fill="var(--bg-border)"/>
      <circle cx="60" cy="80" r="8" fill="var(--accent-100)" stroke="var(--accent-300)" strokeWidth="1.5"/>
      <path d="M57 80 h6 M60 77 v6" stroke="var(--accent-600)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Use a key from `illustrations` or pass a custom React node */
  illustration?: keyof typeof illustrations | React.ReactNode;
  /** @deprecated Use illustration instead */
  icon?: React.ReactNode;
  /** Custom actions element (e.g. multiple buttons) */
  actions?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustration = "generic",
  icon,
  actions,
}: EmptyStateProps) {
  const illu =
    typeof illustration === "string"
      ? illustrations[illustration as keyof typeof illustrations] ?? illustrations.generic
      : illustration ?? (icon ? <div className="w-16 h-16 rounded-full bg-[var(--bg-raised)] flex items-center justify-center border border-[var(--bg-border)]">{icon}</div> : illustrations.generic);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-6">{illu}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif", color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-xs mb-6" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
      {actions ? (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions}
        </div>
      ) : actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </motion.div>
  );
}
