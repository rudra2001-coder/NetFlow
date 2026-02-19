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
  CreditCard,
  Building2,
  AlertCircle,
  Search,
  TrendingUp,
  Zap,
  Headphones,
  ScrollText,
  Grid2X2,
  Wallet,
  FileText,
  DollarSign,
  Receipt,
  ClipboardList,
  PieChart,
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

// Note: permission checks are centralized in the UI store helpers

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

// Navigation items with sections and categories
interface NavSection {
  title: string;
  category: string;
  items: ({
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
  })[];
}

const navigationSections: NavSection[] = [
  {
    title: "Main",
    category: "core",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} />,
        requiredPermission: { action: "view", resource: "dashboard" },
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: <BarChart3 size={20} />,
        requiredPermission: { action: "view", resource: "analytics" },
      },
    ],
  },
  {
    title: "Network",
    category: "network",
    items: [
      {
        label: "Routers",
        href: "/routers",
        icon: <Server size={20} />,
        requiredPermission: { action: "view", resource: "routers" },
        badge: { count: 24, color: "blue" },
      },
      {
        label: "OLTs",
        href: "/olts",
        icon: <Network size={20} />,
        requiredPermission: { action: "view", resource: "olts" },
        badge: { count: 8, color: "cyan" },
        children: [
          { label: "Management", href: "/olts", icon: <Grid2X2 size={18} /> },
          { label: "Add OLT", href: "/olts/new", icon: <Zap size={18} /> },
          { label: "OLT Users", href: "/olts/users", icon: <Users size={18} /> },
        ],
      },
      {
        label: "Interfaces",
        href: "/interfaces",
        icon: <Wifi size={20} />,
        requiredPermission: { action: "view", resource: "interfaces" },
      },
    ],
  },
  {
    title: "Users & Services",
    category: "users",
    items: [
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
        label: "User Profiles",
        href: "/profiles",
        icon: <ScrollText size={20} />,
        requiredPermission: { action: "view", resource: "profiles" },
      },
    ],
  },
  {
    title: "Business",
    category: "business",
    items: [
      {
        label: "Resellers",
        href: "/resellers",
        icon: <Building2 size={20} />,
        requiredPermission: { action: "view", resource: "resellers" },
        badge: { count: 28, color: "purple" },
        children: [
          { label: "Management", href: "/resellers", icon: <Grid2X2 size={18} /> },
          { label: "Payments", href: "/resellers/payment-history", icon: <CreditCard size={18} /> },
          { label: "Gateways", href: "/resellers/payment-gateway", icon: <Zap size={18} /> },
          { label: "Settlements", href: "/resellers/settlements", icon: <TrendingUp size={18} /> },
        ],
      },
      {
        label: "Billing",
        href: "/billing",
        icon: <CreditCard size={20} />,
        requiredPermission: { action: "view", resource: "billing" },
        badge: { count: 12, color: "green" },
      },
      {
        label: "Support",
        href: "/support",
        icon: <Headphones size={20} />,
        requiredPermission: { action: "view", resource: "support" },
        badge: { count: 3, color: "orange" },
      },
    ],
  },
  {
    title: "Accounting",
    category: "accounting",
    items: [
      {
        label: "Accounting Dashboard",
        href: "/accounting",
        icon: <PieChart size={20} />,
        requiredPermission: { action: "view", resource: "accounting" },
      },
      {
        label: "Invoices",
        href: "/accounting/invoices",
        icon: <Receipt size={20} />,
        requiredPermission: { action: "view", resource: "accounting.invoices" },
      },
      {
        label: "Payments",
        href: "/accounting/payments",
        icon: <CreditCard size={20} />,
        requiredPermission: { action: "view", resource: "accounting.payments" },
      },
      {
        label: "Expenses",
        href: "/accounting/expenses",
        icon: <Wallet size={20} />,
        requiredPermission: { action: "view", resource: "accounting.expenses" },
      },
      {
        label: "Income",
        href: "/accounting/income",
        icon: <DollarSign size={20} />,
        requiredPermission: { action: "view", resource: "accounting.income" },
      },
      {
        label: "Ledger",
        href: "/accounting/ledger",
        icon: <ScrollText size={20} />,
        requiredPermission: { action: "view", resource: "accounting.ledger" },
      },
      {
        label: "Reconciliation",
        href: "/accounting/reconciliation",
        icon: <ClipboardList size={20} />,
        requiredPermission: { action: "view", resource: "accounting.reconciliation" },
      },
      {
        label: "Reports",
        href: "/accounting/reports",
        icon: <FileText size={20} />,
        requiredPermission: { action: "view", resource: "accounting.reports" },
      },
    ],
  },
  {
    title: "Operations",
    category: "operations",
    items: [
      {
        label: "Audit Log",
        href: "/audit",
        icon: <ScrollText size={20} />,
        requiredPermission: { action: "view", resource: "audit" },
      },
      {
        label: "Alerts & Monitoring",
        href: "/alerts",
        icon: <AlertCircle size={20} />,
        requiredPermission: { action: "view", resource: "alerts" },
      },
      {
        label: "Templates",
        href: "/templates",
        icon: <Grid2X2 size={20} />,
        requiredPermission: { action: "view", resource: "templates" },
      },
    ],
  },
  {
    title: "System",
    category: "system",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: <Settings size={20} />,
        requiredPermission: { action: "view", resource: "settings" },
      },
    ],
  },
];

// Badge color styles - Enhanced
const badgeColorStyles: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
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
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Flatten and filter all items
  const allNavItems = navigationSections.flatMap((section) => section.items);

  // Filter navigation based on permissions and search
  const getFilteredSections = () => {
    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // Check permission
          if (user && item.requiredPermission && !checkPermission(user, item.requiredPermission.action as PermissionAction, item.requiredPermission.resource)) {
            return false;
          }
          // Filter by search query
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesItem = item.label.toLowerCase().includes(query);
            const matchesChildren = item.children?.some(child =>
              child.label.toLowerCase().includes(query)
            ) ?? false;
            return matchesItem || matchesChildren;
          }
          return true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  };

  // Auto-expand parent when child is active
  useEffect(() => {
    allNavItems.forEach((item) => {
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

  const renderNavItem = (item: (typeof navigationSections)[0]['items'][0], level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);
    const itemId = `nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
    const isAllowed = user ? checkRouteAllowed(user, item.href || "") : true;

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
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-sm font-medium
              transition-all duration-200 ease-out
              ${active
                ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300 shadow-sm shadow-blue-500/10"
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              }
              ${collapsed ? "justify-center" : ""}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
            `}
            aria-expanded={isExpanded}
            aria-haspopup="true"
          >
            <span
              className={`
                transition-colors duration-200 flex-shrink-0
                ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}
              `}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColorStyles[item.badge.color]} ring-1 ring-current ring-opacity-20`}>
                    {item.badge.count}
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`
                    transition-transform duration-200 ease-out flex-shrink-0
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
              flex items-center gap-3 px-4 py-3 rounded-xl
              text-sm font-medium
              transition-all duration-200 ease-out
              group
              ${active
                ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300 shadow-sm shadow-blue-500/10"
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
              }
              ${collapsed ? "justify-center" : ""}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
            `}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={`
                transition-colors duration-200 flex-shrink-0
                ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}
              `}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColorStyles[item.badge.color]} ring-1 ring-current ring-opacity-20`}>
                    {item.badge.count}
                  </span>
                )}
              </>
            )}
          </Link>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && hoveredItem === item.label && !hasChildren && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn border border-slate-700">
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 ${badgeColorStyles[item.badge.color]} rounded text-xs font-semibold`}>
                  {item.badge.count}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tooltip for collapsed expandable items */}
        {collapsed && hoveredItem === item.label && hasChildren && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fadeIn border border-slate-700 flex items-center gap-1">
            {item.label}
            <ChevronRight size={14} />
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
            <div className="ml-6 mt-2 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-3">
              {item.children!.map((child) => {
                const childAllowed = user
                  ? checkRouteAllowed(user, child.href)
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
                      group
                      ${childActive
                        ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300"
                        : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/30 dark:hover:text-white"
                      }
                    `}
                    aria-current={childActive ? "page" : undefined}
                  >
                    <span className={`text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0 transition-colors`}>
                      {child.icon}
                    </span>
                    <span className="flex-1">{child.label}</span>
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
        lg:hidden flex flex-col
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30">
            <Network size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">NetFlow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ISP Mgmt</p>
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

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Role indicator */}
      {user && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-full text-blue-700 dark:text-blue-300 font-semibold capitalize">
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {getFilteredSections().map((section) => (
          <div key={section.category}>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email || user.role}
              </p>
            </div>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
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
        ${collapsed ? "w-20" : "w-72"}
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo - Enhanced */}
      <div
        className={`
          flex items-center gap-3 h-16 px-4 border-b border-slate-200 dark:border-slate-700
          ${collapsed ? "justify-center" : ""}
          flex-shrink-0
        `}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 flex-shrink-0 font-bold text-lg">
          N
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">NetFlow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">ISP Management</p>
          </div>
        )}
      </div>

      {/* Search Bar - Only visible when not collapsed */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Role indicator */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-full text-blue-700 dark:text-blue-300 font-semibold capitalize">
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
          hover:scale-110 z-50
        `}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          size={14}
          className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Navigation with Sections */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {getFilteredSections().map((section) => (
          <div key={section.category}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 opacity-70">
                {section.title}
              </h3>
            )}
            <div className={`space-y-1 ${collapsed ? "flex flex-col items-center justify-center" : ""}`}>
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section - Enhanced */}
      {user && (
        <div
          className={`
            border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0
            bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-900/50
            ${collapsed ? "flex flex-col items-center justify-center" : ""}
          `}
        >
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""} w-full`}>
            <Avatar
              src={user.avatar}
              name={user.name}
              size="md"
              className="flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fadeIn">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
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
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
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
