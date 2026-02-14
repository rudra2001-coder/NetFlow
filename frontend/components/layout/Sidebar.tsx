"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Users,
  Wifi,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Network,
  Shield,
  Activity,
  Menu,
  X,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useUIStore, hasPermission as checkPermission, isRouteAllowed as checkRouteAllowed, defaultRolePermissions, UserSession, UserRole, PermissionAction } from "../../lib/store/uiStore";

// Convert prop user to UserSession type
const toUserSession = (user?: { name: string; email?: string; avatar?: string; role?: string }): UserSession | null => {
  if (!user) return null;

  // Map legacy/prop roles to system UserRole
  let role: UserRole = 'user';
  const propRole = user.role?.toLowerCase();

  if (propRole === 'admin' || propRole === 'super_admin' || propRole === 'org_admin') {
    role = propRole === 'super_admin' ? 'super_admin' : 'org_admin';
  } else if (propRole === 'operator' || propRole === 'technician') {
    role = 'technician';
  } else if (propRole === 'reseller') {
    role = 'reseller';
  } else {
    role = 'user';
  }

  const rolePerms = defaultRolePermissions[role];
  return {
    id: "local-" + user.name.toLowerCase().replace(/\s+/g, "-"),
    name: user.name,
    email: user.email || "",
    avatar: user.avatar,
    role,
    permissions: rolePerms.permissions,
    lastActive: Date.now(),
  };
};

// Permission check wrapper
const hasPermission = (user: UserSession | null, action: "view" | "edit" | "delete" | "create" | "manage", resource: string) => {
  if (!user) return true;

  const actionMap: Record<string, PermissionAction> = {
    view: 'read',
    edit: 'update',
    create: 'create',
    delete: 'delete',
    manage: '*',
  };

  return checkPermission(user, actionMap[action] || 'read', resource);
};

// Route check wrapper
const isRouteAllowed = (user: UserSession | null, route: string) => {
  if (!user) return true;
  const rolePerms = defaultRolePermissions[user.role];
  return (
    rolePerms.allowedRoutes.some((r) => route.startsWith(r)) &&
    !rolePerms.deniedRoutes.some((r) => route.startsWith(r))
  );
};

export interface SidebarProps {
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onToggleMobile?: () => void;
  isMobileOpen?: boolean;
  className?: string;
}

// Navigation items with required permissions
const navigationConfig: {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    label: string;
    href: string;
    icon: React.ReactNode;
    requiredPermission?: { action: "view" | "edit"; resource: string };
  }[];
  requiredPermission?: { action: "view" | "edit"; resource: string };
  badge?: { count: number; color: string };
}[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      requiredPermission: { action: "view", resource: "dashboard" },
    },
    {
      label: "Routers",
      href: "/routers",
      icon: <Server size={20} />,
      requiredPermission: { action: "view", resource: "routers" },
      badge: { count: 12, color: "blue" },
    },
    {
      label: "PPP Users",
      href: "/ppp",
      icon: <Users size={20} />,
      requiredPermission: { action: "view", resource: "ppp" },
      badge: { count: 248, color: "green" },
    },
    {
      label: "Hotspot",
      href: "/hotspot",
      icon: <Wifi size={20} />,
      requiredPermission: { action: "view", resource: "hotspot" },
      children: [
        { label: "Users", href: "/hotspot/users", icon: <Users size={18} /> },
        { label: "Profiles", href: "/hotspot/profiles", icon: <Shield size={18} /> },
        { label: "Activity", href: "/hotspot/activity", icon: <Activity size={18} /> },
      ],
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 size={20} />,
      requiredPermission: { action: "view", resource: "analytics" },
    },
    {
      label: "Network",
      href: "/network",
      icon: <Network size={20} />,
      requiredPermission: { action: "view", resource: "network" },
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
      requiredPermission: { action: "view", resource: "settings" },
    },
    {
      label: "Users",
      href: "/users",
      icon: <Users size={20} />,
      requiredPermission: { action: "view", resource: "users" },
    },
  ];

// Badge color styles
const badgeColorStyles: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export const Sidebar = ({
  user: propUser,
  collapsed = false,
  onCollapse,
  isMobileOpen = false,
  onToggleMobile,
  className = "",
}: SidebarProps) => {
  // Get user from store if not provided
  const storeUser = useUIStore((state) => state.user);
  const user = propUser ? toUserSession(propUser) : storeUser;

  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter navigation based on permissions
  const filteredNavItems = navigationConfig.filter((item) => {
    if (!user) return true; // Show all for unauthenticated
    if (item.requiredPermission) {
      return hasPermission(user, item.requiredPermission.action, item.requiredPermission.resource);
    }
    return true;
  });

  // Auto-expand parent when child is active
  useEffect(() => {
    navigationConfig.forEach((item) => {
      if (item.children) {
        const activeChild = item.children.find(
          (child) => child.href && pathname.startsWith(child.href)
        );
        if (activeChild && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [pathname]);

  // Handle mouse enter/leave for collapsed state tooltip
  const handleMouseEnter = useCallback((label: string) => {
    if (collapsed) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHoveredItem(label);
    }
  }, [collapsed]);

  const handleMouseLeave = useCallback(() => {
    if (collapsed) {
      timeoutRef.current = setTimeout(() => {
        setHoveredItem(null);
      }, 300);
    }
  }, [collapsed]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: typeof navigationConfig[0], level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);
    const itemId = `nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
    const isAllowed = user ? isRouteAllowed(user, item.href || "") : true;

    if (!isAllowed) {
      return null;
    }

    return (
      <div
        key={item.label}
        className="relative"
        onMouseEnter={() => handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {hasChildren ? (
          <button
            type="button"
            id={itemId}
            onClick={() => toggleExpanded(item.label)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium
              transition-all duration-200 ease-out
              ${active
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              }
              ${collapsed ? "justify-center" : ""}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
            `}
            aria-expanded={isExpanded}
            aria-haspopup="true"
          >
            <span
              className={`
                transition-colors duration-200
                ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}
              `}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColorStyles[item.badge.color]}`}>
                    {item.badge.count}
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`
                    transition-transform duration-200 ease-out
                    ${isExpanded ? "rotate-180" : ""}
                    text-slate-400
                  `}
                />
              </>
            )}
          </button>
        ) : (
          <Link
            href={item.href || "#"}
            id={itemId}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium
              transition-all duration-200 ease-out
              ${active
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              }
              ${collapsed ? "justify-center" : ""}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
            `}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={`
                transition-colors duration-200
                ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}
              `}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColorStyles[item.badge.color]}`}>
                    {item.badge.count}
                  </span>
                )}
              </>
            )}
          </Link>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && hoveredItem === item.label && !hasChildren && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn">
            {item.label}
            {item.badge && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-600 rounded text-xs">
                {item.badge.count}
              </span>
            )}
          </div>
        )}

        {/* Tooltip for collapsed expandable items */}
        {collapsed && hoveredItem === item.label && hasChildren && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn">
            {item.label}
            <ChevronRight size={14} className="inline ml-1" />
          </div>
        )}

        {!collapsed && hasChildren && (
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
            role="group"
            aria-labelledby={itemId}
          >
            <div className="ml-8 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-4">
              {item.children!.map((child) => {
                const childAllowed = user
                  ? isRouteAllowed(user, child.href)
                  : true;

                if (!childAllowed) {
                  return (
                    <div
                      key={child.label}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      title="Access denied"
                    >
                      <Lock size={16} />
                      <span className="text-sm">{child.label}</span>
                    </div>
                  );
                }

                const childActive = isActive(child.href);

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm
                      transition-all duration-200
                      ${childActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
                      }
                    `}
                    aria-current={childActive ? "page" : undefined}
                  >
                    <span className="text-slate-400 dark:text-slate-500">
                      {child.icon}
                    </span>
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile sidebar
  const mobileSidebar = (
    <aside
      ref={sidebarRef}
      className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-slate-800
        border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:hidden
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30">
            <Network size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">NetFlow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ISP Management</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role indicator */}
      {user && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavItems.map((item) => renderNavItem(item))}
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email || user.role}
              </p>
            </div>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <aside
      className={`
        hidden lg:flex flex-col
        fixed left-0 top-0 h-screen z-40
        bg-white dark:bg-slate-800
        border-r border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={`
          flex items-center gap-3 h-16 px-4 border-b border-slate-200 dark:border-slate-700
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
          <Network size={24} />
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">NetFlow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ISP Management</p>
          </div>
        )}
      </div>

      {/* Role indicator */}
      {user && !collapsed && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => onCollapse?.(!collapsed)}
        className={`
          absolute -right-3 top-20
          w-6 h-6 rounded-full
          bg-white dark:bg-slate-700
          border border-slate-200 dark:border-slate-600
          shadow-md
          flex items-center justify-center
          text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          hover:scale-110
        `}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          size={14}
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavItems.map((item) => renderNavItem(item))}
      </nav>

      {/* User Section */}
      {user && (
        <div
          className={`
            border-t border-slate-200 dark:border-slate-700 p-4
            ${collapsed ? "flex justify-center" : ""}
          `}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
            <Avatar
              src={user.avatar}
              name={user.name}
              size="md"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fadeIn">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email || user.role}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onToggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Open menu"
        aria-expanded={isMobileOpen}
      >
        <Menu size={20} />
      </button>

      {mobileSidebar}
      {desktopSidebar}
    </>
  );
};

Sidebar.displayName = "Sidebar";
