"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Grid3X3, List } from "lucide-react";

type ViewToggleValue = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewToggleValue;
  onChange: (value: ViewToggleValue) => void;
  options?: { value: ViewToggleValue; label: string; icon?: React.ReactNode }[];
}

export const ViewToggle = ({ value, onChange, options }: ViewToggleProps) => {
  const defaultOptions: { value: ViewToggleValue; label: string; icon: React.ReactNode }[] = [
    { value: "grid", label: "Grid", icon: <Grid3X3 className="w-4 h-4" /> },
    { value: "list", label: "List", icon: <List className="w-4 h-4" /> },
  ];

  const items = options || defaultOptions;

  return (
    <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg" role="group" aria-label="View mode toggle">
      {items.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            value === option.value
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          )}
          aria-pressed={value === option.value}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;
