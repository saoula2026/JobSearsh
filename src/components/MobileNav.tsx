"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  List,
  Compass,
} from "lucide-react";

const navItems = [
  { href: "/app", label: "Today", icon: LayoutDashboard },
  { href: "/app/board", label: "Board", icon: Columns3 },
  { href: "/app/applications", label: "List", icon: List },
  { href: "/app/discover", label: "Find", icon: Compass },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe pt-2 px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]"
      style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--bg-border)" }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center w-16 h-12 gap-1"
            style={{ color: isActive ? "var(--accent-600)" : "var(--text-muted)" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
