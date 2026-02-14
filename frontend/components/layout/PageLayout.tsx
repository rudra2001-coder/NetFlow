"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarProps } from "./Sidebar";
import { Header, HeaderProps } from "./Header";

export interface PageLayoutProps {
  children: React.ReactNode;
  sidebarProps?: SidebarProps;
  headerProps?: HeaderProps;
  showSidebar?: boolean;
  showHeader?: boolean;
  className?: string;
}

export const PageLayout = ({
  children,
  sidebarProps,
  headerProps,
  showSidebar = true,
  showHeader = true,
  className = "",
}: PageLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Handle dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {showSidebar && (
        <Sidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          isMobileOpen={isSidebarOpen}
          onToggleMobile={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}

      {showHeader && (
        <Header
          {...headerProps}
          sidebarCollapsed={sidebarCollapsed}
          sidebarWidth={sidebarCollapsed ? "w-20" : "w-64"}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}

      <main
        className={`
          pt-16 min-h-screen transition-all duration-300 ease-in-out
          ${showSidebar ? (sidebarCollapsed ? "lg:pl-20 pl-0" : "lg:pl-64 pl-0") : "pl-0"}
          ${className}
        `}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

PageLayout.displayName = "PageLayout";
