"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs = ({
  tabs,
  defaultTab,
  variant = "default",
  fullWidth = false,
  onChange,
  className = "",
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div
        className={`
          flex ${fullWidth ? "w-full" : ""}
          ${
            variant === "default" || variant === "underline"
              ? "border-b border-slate-200"
              : "gap-2"
          }
        `}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          const baseTabStyles = `
            flex items-center gap-2 px-4 py-3 text-sm font-medium
            transition-all duration-200
            ${fullWidth ? "flex-1 justify-center" : ""}
            ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `;

          let variantStyles = "";
          if (variant === "default") {
            variantStyles = isActive
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50";
          } else if (variant === "pills") {
            variantStyles = isActive
              ? "bg-blue-600 text-white rounded-lg"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg";
          } else {
            variantStyles = isActive
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900";
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`${baseTabStyles} ${variantStyles}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={tab.disabled}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4" role="tabpanel" id={`panel-${activeTab}`}>
        {activeContent}
      </div>
    </div>
  );
};

Tabs.displayName = "Tabs";
