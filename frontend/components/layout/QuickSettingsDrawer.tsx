"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  X,
  Minus,
  Moon,
  Sun,
  Bell,
  BellOff,
  Layout,
  Maximize,
  Volume2,
  VolumeX,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export interface QuickSettingsProps {
  isOpen?: boolean;
  onToggle?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  notifications?: boolean;
  onToggleNotifications?: () => void;
  onMinimize?: () => void;
  className?: string;
}

const settingsGroups = [
  {
    title: "Appearance",
    items: [
      {
        id: "darkMode",
        label: "Dark Mode",
        description: "Switch between light and dark theme",
        icon: Moon,
        altIcon: Sun,
        type: "toggle",
      },
      {
        id: "compactMode",
        label: "Compact Mode",
        description: "Reduce spacing for more content",
        icon: Layout,
        type: "toggle",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        id: "notifications",
        label: "Push Notifications",
        description: "Receive browser notifications",
        icon: Bell,
        altIcon: BellOff,
        type: "toggle",
        defaultValue: true,
      },
      {
        id: "sound",
        label: "Sound Effects",
        description: "Play sounds for events",
        icon: Volume2,
        altIcon: VolumeX,
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
  {
    title: "Display",
    items: [
      {
        id: "fullscreen",
        label: "Fullscreen",
        description: "Enter fullscreen mode",
        icon: Maximize,
        type: "action",
      },
      {
        id: "language",
        label: "Language",
        description: "Change interface language",
        icon: Globe,
        type: "select",
        options: [
          { value: "en", label: "English" },
          { value: "es", label: "Español" },
          { value: "fr", label: "Français" },
          { value: "de", label: "Deutsch" },
        ],
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        id: "autoLock",
        label: "Auto-lock",
        description: "Automatically lock after inactivity",
        icon: Lock,
        type: "select",
        options: [
          { value: "never", label: "Never" },
          { value: "1", label: "1 minute" },
          { value: "5", label: "5 minutes" },
          { value: "15", label: "15 minutes" },
        ],
      },
      {
        id: "activityLog",
        label: "Activity Log",
        description: "Track user activity",
        icon: Eye,
        altIcon: EyeOff,
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
];

export const QuickSettingsDrawer = ({
  isOpen = false,
  onToggle,
  darkMode = false,
  onToggleDarkMode,
  notifications = true,
  onToggleNotifications,
  className = "",
}: QuickSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({
    compactMode: false,
    sound: true,
    activityLog: true,
  });
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  const toggleSetting = (settingId: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const renderToggleItem = (
    item: (typeof settingsGroups[0]["items"])[0],
    value: boolean
  ) => {
    const Icon = value && (item as any).altIcon ? (item as any).altIcon : item.icon;
    const isActive = item.id === "darkMode" ? darkMode : value;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          if (item.id === "darkMode") {
            onToggleDarkMode?.();
          } else if (item.id === "notifications") {
            onToggleNotifications?.();
          } else {
            toggleSetting(item.id);
          }
        }}
        className={`
          w-full flex items-center gap-4 p-3 rounded-xl
          transition-all duration-200
          hover:bg-slate-100 dark:hover:bg-slate-700/50
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          text-left group
        `}
        aria-pressed={isActive}
        aria-label={item.label}
      >
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg
            transition-all duration-200
            ${isActive
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
            }
          `}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {item.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {item.description}
          </p>
        </div>
        <div
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isActive
              ? "bg-blue-600"
              : "bg-slate-200 dark:bg-slate-600"
            }
          `}
          role="switch"
          aria-checked={isActive}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-all duration-200 shadow-sm
              ${isActive ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </div>
      </button>
    );
  };

  const renderActionItem = (
    item: (typeof settingsGroups[0]["items"])[0]
  ) => (
    <button
      key={item.id}
      type="button"
      className={`
        w-full flex items-center gap-4 p-3 rounded-xl
        transition-all duration-200
        hover:bg-slate-100 dark:hover:bg-slate-700/50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        text-left group
      `}
      aria-label={item.label}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-all duration-200">
        <item.icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {item.label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {item.description}
        </p>
      </div>
    </button>
  );

  const renderSelectItem = (
    item: (typeof settingsGroups[0]["items"])[0]
  ) => (
    <div
      key={item.id}
      className="flex items-center gap-4 p-3 rounded-xl"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
        <item.icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {item.label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {item.description}
        </p>
      </div>
      <select
        className="
          px-3 py-1.5 text-sm
          bg-slate-100 dark:bg-slate-700
          border-0 rounded-lg
          text-slate-700 dark:text-slate-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          cursor-pointer
        "
        aria-label={item.label}
        defaultValue={(item as any).options?.[0]?.value}
      >
        {(item as any).options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        ref={drawerRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          fixed right-0 top-0 h-screen z-50
          w-80 max-w-[calc(100vw-2rem)]
          bg-white dark:bg-slate-800
          border-l border-slate-200 dark:border-slate-700
          shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${className}
        `}
        role="dialog"
        aria-label="Quick Settings"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Quick Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMinimize?.()}
              className="
                p-2 rounded-lg
                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              aria-label="Minimize settings"
            >
              <Minus size={18} />
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="
                p-2 rounded-lg
                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  switch (item.type) {
                    case "toggle":
                      return renderToggleItem(
                        item,
                        item.id === "darkMode"
                          ? darkMode
                          : item.id === "notifications"
                            ? notifications
                            : localSettings[item.id] ?? (item as any).defaultValue ?? false
                      );
                    case "action":
                      return renderActionItem(item);
                    case "select":
                      return renderSelectItem(item);
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>NetFlow v2.1.0</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Help
              </button>
              <button
                type="button"
                className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Privacy
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

QuickSettingsDrawer.displayName = "QuickSettingsDrawer";

// Quick Settings Toggle Button Component
export interface QuickSettingsToggleProps {
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

export const QuickSettingsToggle = ({
  isOpen,
  onClick,
  className = "",
}: QuickSettingsToggleProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative p-2 rounded-lg
      transition-all duration-200
      text-slate-600 hover:bg-slate-100 hover:text-slate-900
      dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${className}
    `}
    aria-label={isOpen ? "Close quick settings" : "Open quick settings"}
    aria-expanded={isOpen}
  >
    <Settings
      size={20}
      className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
    />
    {isOpen && (
      <span className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800" />
    )}
  </button>
);

QuickSettingsToggle.displayName = "QuickSettingsToggle";
