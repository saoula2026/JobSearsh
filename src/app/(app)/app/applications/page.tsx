"use client";

import { useApplications } from "@/lib/hooks";
import { useState } from "react";
import { Plus, Search, ExternalLink, Compass, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_FILTERS = [
  "all",
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export default function ApplicationsPage() {
  const { applications, isLoading } = useApplications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = applications
    .filter((a) => !a.archived)
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter(
      (a) =>
        !search ||
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.lastActivityDate).getTime() -
        new Date(a.lastActivityDate).getTime()
    );

  if (applications.length === 0) {
    return (
      <EmptyState
        title="Start tracking your job search"
        description="You don't have any applications yet. Browse live openings or add a job you already applied to."
        illustration="applications"
        actions={
          <>
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
          </>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Applications</h1>
        <Link href="/app/discover">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Application
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === status
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {status === "all" ? "All" : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matches found" description="Try adjusting your search or filter criteria." />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Company</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Last Activity</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/app/applications/edit?id=${app.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {app.company}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{app.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{app.location || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusVariant(app.status)}>{formatStatus(app.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {new Date(app.lastActivityDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "info" {
  const variants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    wishlist: "default", applied: "info", phone_screen: "info", interview: "warning",
    offer: "success", rejected: "danger", withdrawn: "default",
  };
  return variants[status] || "default";
}
