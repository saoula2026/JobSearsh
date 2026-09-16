"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

// Framer Motion won't fire when prefers-reduced-motion is set — CSS handles it
const MotionButton = motion.button;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500 active:bg-violet-800",
      secondary:
        "bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--bg-border)] hover:border-[var(--accent-300)] hover:bg-[var(--accent-50)] focus-visible:ring-[var(--accent-500)]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--accent-500)]",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[44px]",
      md: "px-4 py-2 text-sm gap-2 min-h-[44px]",
      lg: "px-6 py-3 text-base gap-2 min-h-[48px]",
    };

    return (
      <MotionButton
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...(props as React.ComponentPropsWithoutRef<typeof MotionButton>)}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
