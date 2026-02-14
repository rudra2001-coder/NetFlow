"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  description,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  className,
}: ToggleProps) {
  const [isChecked, setIsChecked] = React.useState(defaultChecked);

  const isControlled = checked !== undefined;
  const toggleValue = isControlled ? checked : isChecked;

  const handleChange = () => {
    if (disabled) return;
    const newValue = !toggleValue;
    if (!isControlled) {
      setIsChecked(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex-1">
        <label className={cn(
          "text-sm font-medium text-neutral-900 dark:text-white cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}>
          {label}
        </label>
        {description && (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={toggleValue}
        onClick={handleChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          toggleValue ? "bg-primary-600" : "bg-neutral-300 dark:bg-neutral-600"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            toggleValue ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
