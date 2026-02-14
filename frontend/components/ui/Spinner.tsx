"use client";

import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
  className?: string;
}

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

const colorStyles: Record<"primary" | "white" | "gray", string> = {
  primary: "border-blue-600 border-t-transparent",
  white: "border-white border-t-transparent",
  gray: "border-slate-400 border-t-transparent",
};

export const Spinner = ({
  size = "md",
  color = "primary",
  className = "",
}: SpinnerProps) => {
  return (
    <div
      className={`
        inline-block rounded-full
        animate-spin
        ${sizeStyles[size]}
        ${colorStyles[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Spinner.displayName = "Spinner";

export interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({
  message = "Loading...",
  className = "",
}: LoadingOverlayProps) => {
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        bg-white/80 backdrop-blur-sm
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" color="primary" />
      {message && (
        <p className="mt-4 text-slate-600 font-medium">{message}</p>
      )}
    </div>
  );
};

LoadingOverlay.displayName = "LoadingOverlay";

export interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots = ({ className = "" }: LoadingDotsProps) => {
  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }}
        />
      ))}
    </div>
  );
};

LoadingDots.displayName = "LoadingDots";
