"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Columns3,
  List,
  Compass,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/board", label: "Board", icon: Columns3 },
  { href: "/app/applications", label: "Applications", icon: List },
  { href: "/app/discover", label: "Discover", icon: Compass },
  { href: "/app/settings", label: "Settings", icon: Settings },
];


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 min-h-screen p-4 hidden md:flex flex-col flex-shrink-0"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
      }}
    >
      {/* App brand */}
      <div className="mb-8 px-2">
        <Link href="/app" className="block group">
          <h1
            className="text-lg font-bold leading-tight"
            style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Job Command
            <span style={{ color: "var(--accent-600)" }}> Center</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Your career pipeline
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/app" ? pathname === "/app" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
              style={{
                color: isActive ? "var(--accent-700)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--accent-100)" : "transparent",
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: "var(--accent-100)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className="w-4 h-4 relative z-10 flex-shrink-0"
                aria-hidden="true"
                style={{ color: isActive ? "var(--accent-600)" : "var(--text-muted)" }}
              />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                  style={{ backgroundColor: "var(--accent-500)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
