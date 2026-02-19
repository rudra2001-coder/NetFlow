"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, Settings, Zap, Volume2, VolumeX, Moon, Sun, Bell, BellOff, Lock, Eye, EyeOff, HardDrive, Wifi, MessageSquare, LogOut } from "lucide-react";

export interface RightSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  notifications?: boolean;
  onToggleNotifications?: () => void;
  className?: string;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  altIcon?: React.ReactNode;
  type: "toggle" | "action" | "select";
  defaultValue?: boolean;
  options?: { value: string; label: string }[];
}

const settingsGroups = [
  {
    title: "Theme",
    items: [
      {
        id: "darkMode",
        label: "Dark Mode",
        description: "Switch to dark theme",
        icon: <Moon size={18} />,
        altIcon: <Sun size={18} />,
        type: "toggle",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        id: "pushNotifications",
        label: "Push Notifications",
        description: "Browser notifications",
        icon: <Bell size={18} />,
        altIcon: <BellOff size={18} />,
        type: "toggle",
        defaultValue: true,
      },
      {
        id: "sound",
        label: "Sound Effects",
        description: "Audio alerts",
        icon: <Zap size={18} />,
        altIcon: <VolumeX size={18} />,
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "autoLock",
        label: "Auto-Lock",
        description: "Security timeout",
        icon: <Lock size={18} />,
        type: "select",
        options: [
          { value: "never", label: "Never" },
          { value: "5", label: "5 min" },
          { value: "15", label: "15 min" },
          { value: "30", label: "30 min" },
        ],
      },
      {
        id: "activityLog",
        label: "Activity Log",
        description: "Track actions",
        icon: <Eye size={18} />,
        altIcon: <EyeOff size={18} />,
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
];

const quickActions = [
  {
    id: "system-status",
    label: "System Status",
    description: "Check system health",
    icon: <HardDrive size={18} />,
    color: "bg-emerald-500",
  },
  {
    id: "network-stats",
    label: "Network Stats",
    description: "View traffic metrics",
    icon: <Wifi size={18} />,
    color: "bg-blue-500",
  },
  {
    id: "support",
    label: "Get Support",
    description: "Contact support team",
    icon: <MessageSquare size={18} />,
    color: "bg-purple-500",
  },
];

export const RightSidebar = ({
  isOpen = false,
  onToggle,
  darkMode = false,
  onToggleDarkMode,
  notifications = true,
  onToggleNotifications,
  className = "",
}: RightSidebarProps) => {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({
    sound: true,
    activityLog: true,
    autoLock: "15",
  });
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onToggle?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onToggle]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen && window.innerWidth < 1024) {
        onToggle?.();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const toggleSetting = (settingId: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleSelectChange = (settingId: string, value: string) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [settingId]: value,
    }));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Right Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-16 right-0 w-full sm:w-96 max-w-md
          h-[calc(100vh-4rem)] 
          bg-white dark:bg-slate-800
          border-l border-slate-200 dark:border-slate-700
          z-40 lg:z-40
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${className}
        `}
        role="complementary"
        aria-label="Quick settings and actions"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Settings</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {/* Quick Actions */}
          <div className="px-6 py-6">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  aria-label={action.label}
                >
                  <div className={`${action.color} p-3 rounded-lg text-white group-hover:shadow-lg transition-all`}>
                    {action.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Groups */}
          <div className="px-6 py-6 space-y-6">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {(group.items as SettingItem[]).map((item) => {
                    const isActive = item.id === "darkMode" ? darkMode : item.id === "pushNotifications" ? notifications : localSettings[item.id];

                    if (item.type === "toggle") {
                      const Icon = isActive && item.altIcon ? item.altIcon : item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === "darkMode") {
                              onToggleDarkMode?.();
                            } else if (item.id === "pushNotifications") {
                              onToggleNotifications?.();
                            } else {
                              toggleSetting(item.id);
                            }
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div
                            className={`
                              flex items-center justify-center w-9 h-9 rounded-lg transition-colors
                              ${isActive
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                              }
                            `}
                          >
                            {Icon}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                          </div>
                          <div
                            className={`
                              relative inline-flex h-5 w-9 items-center rounded-full transition-all
                              ${isActive ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}
                            `}
                          >
                            <span
                              className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${isActive ? "translate-x-4" : "translate-x-0.5"}
                              `}
                            />
                          </div>
                        </button>
                      );
                    }

                    if (item.type === "select") {
                      return (
                        <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                          <label className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                            </div>
                          </label>
                          <select
                            value={localSettings[item.id] || item.options?.[0]?.value}
                            onChange={(e) => handleSelectChange(item.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {item.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              <MessageSquare size={18} />
              Help & Support
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
              <LogOut size={18} />
              Sign Out
            </button>
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
              NetFlow v2.1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

RightSidebar.displayName = "RightSidebar";
