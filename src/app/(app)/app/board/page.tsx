"use client";

import { useState } from "react";
import { useApplications, changeStatus } from "@/lib/hooks";
import { GripVertical, Plus, ExternalLink, Compass } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS: { status: ApplicationStatus; label: string; accent: string; bg: string }[] = [
  { status: "wishlist",     label: "Wishlist",      accent: "var(--text-muted)",    bg: "var(--bg-raised)" },
  { status: "applied",      label: "Applied",       accent: "var(--info)",          bg: "var(--info-bg)" },
  { status: "phone_screen", label: "Phone Screen",  accent: "var(--accent-600)",    bg: "var(--accent-50)" },
  { status: "interview",    label: "Interview",     accent: "var(--warning)",       bg: "var(--warning-bg)" },
  { status: "offer",        label: "Offer",         accent: "var(--success)",       bg: "var(--success-bg)" },
];

const cardVariants: Variants = {
  hidden:   { opacity: 0, scale: 0.95 },
  visible:  { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function BoardPage() {
  const { applications, isLoading } = useApplications();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading board…">
        <div className="h-8 w-40 rounded-lg shimmer" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[260px] h-80 rounded-xl shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const activeApplications = applications.filter((a) => !a.archived);

  if (activeApplications.length === 0) {
    return (
      <EmptyState
        title="Start tracking your job search"
        description="Your kanban board is empty. Browse live openings or add a job you already applied to."
        illustration="kanban"
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

  const handleDragStart = (event: DragStartEvent) => {
    const app = activeApplications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    const app = activeApplications.find((a) => a.id === activeId);
    const overApp = activeApplications.find((a) => a.id === overId);
    if (app && overApp && app.status !== overApp.status) {
      await changeStatus(activeId, overApp.status);
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
          >
            Pipeline Board
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {activeApplications.length} active application{activeApplications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/app/discover">
          <Button>
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Job
          </Button>
        </Link>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Kanban pipeline columns">
          {COLUMNS.map((col) => {
            const colApps = activeApplications.filter((a) => a.status === col.status);
            return (
              <div
                key={col.status}
                className="min-w-[260px] flex-shrink-0 rounded-xl flex flex-col"
                style={{ backgroundColor: col.bg, border: "1px solid var(--bg-border)" }}
                role="listitem"
                aria-label={`${col.label} column, ${colApps.length} items`}
              >
                {/* Column header */}
                <div
                  className="px-3 py-2.5 flex items-center justify-between border-b"
                  style={{ borderColor: "var(--bg-border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col.accent }}
                    />
                    <h2
                      className="text-xs font-semibold"
                      style={{ fontFamily: "var(--font-jakarta), sans-serif", color: "var(--text-primary)" }}
                    >
                      {col.label}
                    </h2>
                  </div>
                  <span
                    className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--bg-border)",
                      fontSize: "10px",
                    }}
                    aria-label={`${colApps.length} items`}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Cards */}
                <SortableContext
                  items={colApps.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <motion.div
                    className="p-2 space-y-2 flex-1 min-h-[180px]"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                  >
                    {colApps.map((app) => (
                      <motion.div key={app.id} variants={cardVariants}>
                        <KanbanCard app={app} />
                      </motion.div>
                    ))}
                  </motion.div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        {/* Drag overlay — the ghost card that follows the cursor */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeApp && (
            <div
              className="rounded-lg p-3 shadow-xl rotate-2"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "2px solid var(--accent-400)",
                boxShadow: "var(--shadow-lg)",
                opacity: 0.95,
              }}
            >
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {activeApp.company}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {activeApp.role}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({
  app,
}: {
  app: Application;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.18,0.67,0.6,1.22)",
    opacity: isDragging ? 0 : 1, // hide source card — the overlay shows instead
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg p-3 group"
    >
      <div
        className="rounded-lg p-3 group"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-start gap-2">
          <button
            className="mt-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] cursor-grab active:cursor-grabbing"
            style={{ color: "var(--text-muted)" }}
            aria-label={`Drag ${app.company} — ${app.role}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex-1 min-w-0">
            <Link
              href={`/app/applications/edit?id=${app.id}`}
              className="block text-sm font-semibold truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] rounded"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              {app.company}
            </Link>
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {app.role}
            </p>
            {app.location && (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {app.location}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {app.salaryRange && <Badge variant="success">{app.salaryRange}</Badge>}
              {app.nextActionDate && (
                <Badge variant="warning">
                  Due: {new Date(app.nextActionDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>

          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]"
              style={{ color: "var(--text-muted)" }}
              aria-label={`View job posting for ${app.company}`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
