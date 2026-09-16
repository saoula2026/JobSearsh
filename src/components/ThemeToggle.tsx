"use client";

import { Moon, Sun } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { userSettings } from "@/lib/db";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const settings = useLiveQuery(() => userSettings.get(1));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = settings?.theme || "system";
  
  // Resolve actual display theme for icon
  let isDark = false;
  if (mounted) {
    if (theme === "dark") isDark = true;
    if (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) isDark = true;
  }

  const toggleTheme = async () => {
    const existing = await userSettings.get(1);
    const newTheme = isDark ? "light" : "dark";
    await userSettings.put({
      id: 1,
      pipelineStages: existing?.pipelineStages ?? ["wishlist", "applied", "interview", "offer", "rejected"],
      defaultFollowUpDays: existing?.defaultFollowUpDays ?? 7,
      theme: newTheme,
    });
  };

  if (!mounted) return <div className="w-9 h-9" />; // Placeholder

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      style={{ color: "var(--text-secondary)" }}
      aria-label="Toggle Dark Mode"
      title="Toggle Dark Mode"
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
