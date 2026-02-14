"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type DensityLevel = 'compact' | 'normal' | 'comfortable';

interface DataDensityToggleProps {
  value: DensityLevel;
  onChange: (value: DensityLevel) => void;
}

export const DataDensityToggle = ({ value, onChange }: DataDensityToggleProps) => {
  const levels: DensityLevel[] = ['compact', 'normal', 'comfortable'];

  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg" role="group" aria-label="Data density">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={cn(
            "flex items-center justify-center px-3 py-1 text-sm font-medium rounded-md transition-all duration-200",
            value === level
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          )}
          aria-pressed={value === level}
        >
          {level === 'compact' && <Minus className="w-3 h-3" />}
          {level === 'normal' && <div className="w-3 h-3 bg-current rounded-sm" />}
          {level === 'comfortable' && (
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-current rounded-sm" />
              <div className="w-0.5 h-3 bg-current rounded-sm" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default DataDensityToggle;
