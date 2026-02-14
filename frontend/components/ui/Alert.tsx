"use client";

import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export type AlertVariant = "success" | "warning" | "danger" | "info";

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle size={20} />,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    iconColor: "text-emerald-500",
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800",
    iconColor: "text-amber-500",
  },
  danger: {
    icon: <AlertCircle size={20} />,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
  },
  info: {
    icon: <Info size={20} />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
  },
};

export const Alert = ({
  variant,
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}: AlertProps) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`
        relative flex gap-3 p-4 rounded-lg border
        ${config.bgColor}
        ${config.borderColor}
        ${config.textColor}
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        {config.icon}
      </div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded
            hover:bg-black/10
            transition-colors
          `}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";
