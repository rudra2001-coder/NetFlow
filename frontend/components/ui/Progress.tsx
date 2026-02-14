"use client";

import React from "react";

export type ProgressVariant = "primary" | "success" | "warning" | "danger" | "info";

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

const variantStyles: Record<ProgressVariant, string> = {
  primary: "bg-blue-600",
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  info: "bg-cyan-500",
};

const sizeStyles: Record<"sm" | "md" | "lg", { track: string; bar: string }> = {
  sm: { track: "h-1", bar: "h-1" },
  md: { track: "h-2", bar: "h-2" },
  lg: { track: "h-3", bar: "h-3" },
};

export const Progress = ({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  label,
  striped = false,
  animated = false,
  className = "",
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-slate-700">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-slate-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full bg-slate-200 overflow-hidden ${sizeStyles[size].track}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`
            ${variantStyles[variant]}
            ${sizeStyles[size].bar}
            rounded-full
            ${striped ? "bg-stripes" : ""}
            ${animated ? "animate-stripes" : ""}
            transition-all duration-300 ease-out
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

Progress.displayName = "Progress";
