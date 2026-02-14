"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  trend,
  className = "",
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (trend === "up" || (change && change > 0)) {
      return <TrendingUp size={16} className="text-emerald-500" />;
    }
    if (trend === "down" || (change && change < 0)) {
      return <TrendingDown size={16} className="text-red-500" />;
    }
    return <Minus size={16} className="text-slate-400" />;
  };

  const getTrendColor = () => {
    if (trend === "up" || (change && change > 0)) {
      return "text-emerald-600";
    }
    if (trend === "down" || (change && change < 0)) {
      return "text-red-600";
    }
    return "text-slate-600";
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200 p-6
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`flex items-center gap-0.5 text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${iconBgColor}`}
          >
            <span className={iconColor}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.displayName = "StatCard";

export interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export const MiniStat = ({
  label,
  value,
  icon,
  className = "",
}: MiniStatProps) => {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 bg-slate-50 rounded-lg
        ${className}
      `}
    >
      {icon && (
        <div className="p-2 bg-white rounded-md shadow-sm">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

MiniStat.displayName = "MiniStat";
