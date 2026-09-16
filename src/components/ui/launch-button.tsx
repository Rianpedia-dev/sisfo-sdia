"use client";

import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LaunchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: "amber" | "emerald" | "rose" | "dark" | "crimson" | "steel";
  size?: "sm" | "default" | "lg";
}

const variantStyles = {
  crimson: {
    glow: "bg-primary/40",
    surface:
      "bg-gradient-to-b from-red-400 via-red-600 to-red-800 text-white shadow-[0_0_0_1px_rgba(239,83,80,0.5),0_4px_0_#7f0000,0_10px_15px_-3px_rgba(0,0,0,0.5)] active:shadow-[0_0_0_1px_rgba(239,83,80,0.5),0_2px_0_#7f0000]",
    defaultIconColor: "fill-white/20 stroke-[1.5]",
  },
  steel: {
    glow: "bg-accent/40",
    surface:
      "bg-gradient-to-b from-sky-400 via-sky-600 to-blue-800 text-white shadow-[0_0_0_1px_rgba(100,181,246,0.5),0_4px_0_#1e3a8a,0_10px_15px_-3px_rgba(0,0,0,0.5)] active:shadow-[0_0_0_1px_rgba(100,181,246,0.5),0_2px_0_#1e3a8a]",
    defaultIconColor: "fill-white/20 stroke-[1.5]",
  },
  amber: {
    glow: "bg-amber-500/40",
    surface:
      "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-amber-950 shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_4px_0_#b45309,0_10px_15px_-3px_rgba(0,0,0,0.5)] active:shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_2px_0_#b45309]",
    defaultIconColor: "fill-amber-950/20 stroke-[1.5]",
  },
  emerald: {
    glow: "bg-emerald-500/40",
    surface:
      "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.5),0_4px_0_#065f46,0_10px_15px_-3px_rgba(0,0,0,0.5)] active:shadow-[0_0_0_1px_rgba(52,211,153,0.5),0_2px_0_#065f46]",
    defaultIconColor: "fill-white/20 stroke-[1.5]",
  },
  rose: {
    glow: "bg-rose-500/40",
    surface:
      "bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 text-white shadow-[0_0_0_1px_rgba(251,113,133,0.5),0_4px_0_#9f1239,0_10px_15px_-3px_rgba(0,0,0,0.5)] active:shadow-[0_0_0_1px_rgba(251,113,133,0.5),0_2px_0_#9f1239]",
    defaultIconColor: "fill-white/20 stroke-[1.5]",
  },
  dark: {
    glow: "bg-slate-500/30",
    surface:
      "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_0_#0f172a,0_10px_15px_-3px_rgba(0,0,0,0.6)] active:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_2px_0_#0f172a]",
    defaultIconColor: "fill-white/20 stroke-[1.5]",
  },
};

const sizeStyles = {
  sm: {
    surface: "px-4 py-2 text-sm gap-2 rounded-[var(--radius)]",
    glow: "rounded-[var(--radius)]",
    iconSize: "w-4 h-4",
  },
  default: {
    surface: "px-8 py-4 text-lg gap-3 rounded-[var(--radius)]",
    glow: "rounded-[var(--radius)]",
    iconSize: "w-5 h-5",
  },
  lg: {
    surface: "px-10 py-5 text-xl gap-3.5 rounded-[var(--radius)]",
    glow: "rounded-[var(--radius)]",
    iconSize: "w-6 h-6",
  },
};

export function LaunchButton({
  children,
  icon,
  variant = "amber",
  size = "default",
  className,
  disabled,
  ...props
}: LaunchButtonProps) {
  const selectedVariant = variantStyles[variant] || variantStyles.amber;
  const selectedSize = sizeStyles[size] || sizeStyles.default;

  const hasDefaultChildren = children === undefined;
  const showDefaultIcon = icon === undefined && hasDefaultChildren;

  return (
    <button
      className={cn(
        "group/btn relative inline-flex items-center justify-center select-none cursor-pointer outline-none transition-transform disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Ambient Glow */}
      <div
        className={cn(
          "-inset-1 group-hover/btn:opacity-75 transition duration-500 opacity-40 absolute blur pointer-events-none",
          selectedVariant.glow,
          selectedSize.glow
        )}
      />

      {/* 3D Tactile Surface */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-150 active:translate-y-[2px]",
          selectedVariant.surface,
          selectedSize.surface
        )}
      >
        {hasDefaultChildren ? (
          <span className="font-medium tracking-tight">
            Initialize Launch
          </span>
        ) : (
          <span className="font-medium tracking-tight flex items-center gap-2">
            {children}
          </span>
        )}

        {showDefaultIcon ? (
          <Zap
            className={cn(
              selectedSize.iconSize,
              selectedVariant.defaultIconColor
            )}
          />
        ) : (
          icon
        )}
      </div>
    </button>
  );
}

export default LaunchButton;

// --- Demo ---
export function LaunchButtonDemo() {
  return (
    <div className="flex min-h-[300px] w-full flex-col sm:flex-row items-center justify-center gap-6 bg-background text-foreground p-10">
      <LaunchButton />
      <LaunchButton variant="emerald">
        Mulai Belajar Sekarang
      </LaunchButton>
    </div>
  );
}
