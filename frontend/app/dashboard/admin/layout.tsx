'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Server, Users, UserCog, CreditCard, FileText,
  Settings, Plug, BarChart3, Shield, Activity, Wifi,
  ChevronDown, ChevronRight, ChevronLeft, Menu, X, Bell,
  Search, Home, Folder, FolderOpen, Tag, Zap, AlertTriangle,
  CheckCircle, Clock, TrendingUp, TrendingDown, MoreHorizontal,
  LogOut, User, Sun, Moon, Globe, RefreshCw, HelpCircle,
  Play,
} from 'lucide-react';
import { QuickSearch } from '@/components';

// ============================================================================
// Types & Interfaces
// ============================================================================

type UserRole = 'admin' | 'support' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number | string;
  children?: NavItem[];
  roles?: UserRole[];
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  routerId?: string;
}

// ============================================================================
// Role-Based Permission Hook
// ============================================================================

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  support: ['dashboard', 'routers', 'users', 'tickets', 'alerts'],
  viewer: ['dashboard', 'metrics'],
};

function usePermissions() {
  const [user] = useState<User>({
    id: 'u1',
    name: 'Admin User',
    email: 'admin@netflow',
    role: 'admin',
  });

  const hasPermission = useCallback((item: NavItem): boolean => {
    if (!item.roles || item.roles.includes(user.role)) return true;
    if (item.children?.some(child => hasPermission(child))) return true;
    return false;
  }, [user.role]);

  const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
    return items.filter(item => hasPermission(item)).map(item => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    }));
  }, [hasPermission]);

  return { user, hasPermission, filterNavItems, rolePermissions };
}

// ============================================================================
// Navigation Structure
// ============================================================================

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    id: 'network',
    label: 'Network',
    icon: <Wifi className="w-5 h-5" />,
    children: [
      { id: 'routers', label: 'Routers', icon: <Server className="w-4 h-4" />, href: '/routers' },
      { id: 'interfaces', label: 'Interfaces', icon: <Activity className="w-4 h-4" />, href: '/interfaces' },
      { id: 'topology', label: 'Topology', icon: <Globe className="w-4 h-4" />, href: '/topology' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
    children: [
      { id: 'ppp-users', label: 'PPP Users', icon: <UserCog className="w-4 h-4" />, href: '/ppp' },
      { id: 'hotspot', label: 'Hotspot', icon: <Wifi className="w-4 h-4" />, href: '/hotspot' },
      { id: 'profiles', label: 'Profiles', icon: <Tag className="w-4 h-4" />, href: '/profiles' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/billing',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { id: 'traffic', label: 'Traffic Analysis', icon: <TrendingUp className="w-4 h-4" />, href: '/analytics/traffic' },
      { id: 'capacity', label: 'Capacity Forecast', icon: <BarChart3 className="w-4 h-4" />, href: '/analytics/capacity' },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: <Zap className="w-5 h-5" />,
    children: [
      { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" />, href: '/templates' },
      { id: 'rules', label: 'Rules', icon: <Settings className="w-4 h-4" />, href: '/rules' },
      { id: 'executions', label: 'Executions', icon: <Play className="w-4 h-4" />, href: '/executions' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: <Shield className="w-5 h-5" />,
    href: '/compliance',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="w-5 h-5" />,
    href: '/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'system', label: 'System', icon: <Settings className="w-4 h-4" />, href: '/settings/system' },
      { id: 'users-settings', label: 'User Management', icon: <UserCog className="w-4 h-4" />, href: '/settings/users' },
      { id: 'integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" />, href: '/settings/integrations' },
    ],
  },
];

// ============================================================================
// Navigation Components
// ============================================================================

function NavItemComponent({
  item,
  depth = 0,
  collapsed,
  activeHref,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  collapsed: boolean;
  activeHref: string;
  onNavigate: (href: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeHref === item.href;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.href) {
      onNavigate(item.href);
    }
  };

  if (collapsed && depth > 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:translate-x-1',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
            : 'text-neutral-600 dark:text-neutral-400',
          collapsed && depth === 0 && 'justify-center hover:translate-x-0 group'
        )}
      >
        <span className="flex-shrink-0">{item.icon}</span>

        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && (
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              )}>
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight className={cn(
                'w-4 h-4 transition-transform duration-150',
                isExpanded && 'rotate-90'
              )} />
            )}
          </>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="mt-1 space-y-1 ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-700">
          {item.children?.map(child => (
            <NavItemComponent
              key={child.id}
              item={child}
              depth={depth + 1}
              collapsed={collapsed}
              activeHref={activeHref}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

function Sidebar({
  collapsed,
  mobileOpen,
  onToggleMobile,
  onToggleCollapse,
  filteredNav,
  activeHref,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onToggleCollapse: () => void;
  filteredNav: NavItem[];
  activeHref: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
        'transition-all duration-300 ease-in-out',
        'flex flex-col',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">NetFlow</h1>
                <p className="text-xs text-neutral-500">ISP Operating System</p>
              </div>
            </div>
          )}

          <button
            onClick={mobileOpen ? onToggleMobile : onToggleCollapse}
            className={cn(
              'p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'text-neutral-500 transition-colors',
              !collapsed && 'lg:hidden'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNav.map(item => (
            <NavItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
              activeHref={activeHref}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-neutral-500 capitalize">admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Header Component
// ============================================================================

function Header({
  onMenuClick,
  notifications,
  showNotifications,
  setShowNotifications,
  acknowledgeAlert,
}: {
  onMenuClick: () => void;
  notifications: Alert[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  acknowledgeAlert: (id: string) => void;
}) {
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.acknowledged).length;

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Menu Toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search routers, users, alerts..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-neutral-400 bg-neutral-200 dark:bg-neutral-700 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions (Admin Only) */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden lg:inline">Sync All</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            {criticalCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 animate-scale-in overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer',
                        !alert.acknowledged && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2',
                          alert.severity === 'critical' && 'bg-error-500',
                          alert.severity === 'warning' && 'bg-warning-500',
                          alert.severity === 'info' && 'bg-info-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {alert.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {alert.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <span className="text-xs text-primary-600">New</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <User className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// Main Dashboard Layout
// ============================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { filterNavItems } = usePermissions();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Alert[]>([
    { id: '1', severity: 'critical', title: 'Router Offline', message: 'RTR-HQ-01 is offline', timestamp: new Date(Date.now() - 2 * 60000), acknowledged: false, routerId: 'r1' },
    { id: '2', severity: 'warning', title: 'High CPU Usage', message: 'RTR-BRANCH-15 at 92%', timestamp: new Date(Date.now() - 15 * 60000), acknowledged: false, routerId: 'r2' },
    { id: '3', severity: 'info', title: 'Backup Complete', message: 'Daily backup completed', timestamp: new Date(Date.now() - 60 * 60000), acknowledged: true },
  ]);

  const filteredNav = useMemo(() =>
    filterNavItems(navigationItems),
    [filterNavItems]);

  const acknowledgeAlert = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, acknowledged: true } : n)
    );
  };

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close notifications on navigation
  useEffect(() => {
    setShowNotifications(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <QuickSearch />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        filteredNav={filteredNav}
        activeHref={pathname}
        onNavigate={handleNavigate}
      />

      <Header
        onMenuClick={() => setMobileOpen(true)}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        acknowledgeAlert={acknowledgeAlert}
      />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20 pl-0' : 'lg:pl-64 pl-0'
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
