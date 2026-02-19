"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { DropdownItem } from "../ui/Dropdown";
import { QuickSettingsDrawer, QuickSettingsToggle } from "./QuickSettingsDrawer";
import { RightSidebar } from "./RightSidebar";

export interface HeaderProps {
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  sidebarCollapsed?: boolean;
  sidebarWidth?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read?: boolean;
  }>;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

const defaultNotifications = [
  { id: "1", title: "Router Offline", message: "Router BRAS-01 is now offline", time: "5 minutes ago", read: false },
  { id: "2", title: "New PPP User", message: "User john.doe@isp.com registered", time: "1 hour ago", read: false },
  { id: "3", title: "Bandwidth Alert", message: "Traffic threshold reached", time: "2 hours ago", read: true },
];

export const Header = ({
  user,
  sidebarCollapsed = false,
  sidebarWidth = "w-64",
  darkMode = false,
  onToggleDarkMode,
  notifications = defaultNotifications,
  isSidebarOpen = false,
  onToggleSidebar,
  className = "",
}: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowQuickSettings(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 right-0 z-30 h-16
          bg-white dark:bg-slate-800
          border-b border-slate-200 dark:border-slate-700
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "left-20" : sidebarWidth}
          ${className}
        `}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Mobile menu & Search */}
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Search */}
            <div className="hidden md:block w-80">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search routers, users, settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5
                    bg-slate-100 dark:bg-slate-700/50
                    border border-transparent
                    rounded-xl text-sm
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                  aria-label="Search"
                />
                <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-slate-400 bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Right Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`
                p-2.5 rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${showRightSidebar
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50"
                }
              `}
              aria-label={showRightSidebar ? "Close quick settings panel" : "Open quick settings panel"}
              aria-expanded={showRightSidebar}
            >
              <ChevronRight
                size={20}
                className={`transition-transform duration-300 ${showRightSidebar ? "rotate-180" : ""}`}
              />
            </button>

            {/* Quick Settings Toggle */}
            <QuickSettingsToggle
              isOpen={showQuickSettings}
              onClick={() => setShowQuickSettings(!showQuickSettings)}
            />

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="
                p-2.5 rounded-xl
                text-slate-600 hover:text-slate-900 hover:bg-slate-100
                dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative">
                <Sun
                  size={20}
                  className={`
                    transition-all duration-300
                    ${darkMode ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"}
                  `}
                />
                <Moon
                  size={20}
                  className={`
                    absolute inset-0
                    transition-all duration-300
                    ${darkMode ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"}
                  `}
                />
              </div>
            </button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`
                  relative p-2.5 rounded-xl
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    showNotifications
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50"
                  }
                `}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-slideIn"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`
                            px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50
                            transition-colors cursor-pointer
                            ${!n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}
                          `}
                          role="menuitem"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                                w-2 h-2 mt-2 rounded-full flex-shrink-0
                                ${!n.read ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}
                              `}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {n.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                    <Link
                      href="/notifications"
                      className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* User Menu */}
            {user && (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`
                    flex items-center gap-3 p-1.5 pr-3 rounded-xl
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${
                      showUserMenu
                        ? "bg-slate-100 dark:bg-slate-700"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }
                  `}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.role || "Admin"}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`
                      text-slate-400 transition-transform duration-200
                      ${showUserMenu ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-slideIn"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        role="menuitem"
                      >
                        <User size={16} />
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        role="menuitem"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 py-2">
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        role="menuitem"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Settings Drawer */}
      <QuickSettingsDrawer
        isOpen={showQuickSettings}
        onToggle={() => setShowQuickSettings(!showQuickSettings)}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={showRightSidebar}
        onToggle={() => setShowRightSidebar(!showRightSidebar)}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        notifications={true}
      />
    </>
  );
};

Header.displayName = "Header";
