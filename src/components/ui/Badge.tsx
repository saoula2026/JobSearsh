interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  className?: string;
}

const variants: Record<string, string> = {
  default:
    "bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--bg-border)]",
  accent:
    "bg-[var(--accent-100)] text-[var(--accent-700)] border border-[var(--accent-200)]",
  success:
    "bg-[var(--success-bg)] text-[var(--success)] border border-emerald-200",
  warning:
    "bg-[var(--warning-bg)] text-[var(--warning)] border border-amber-200",
  danger:
    "bg-[var(--danger-bg)] text-[var(--danger)] border border-red-200",
  info:
    "bg-[var(--info-bg)] text-[var(--info)] border border-cyan-200",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
