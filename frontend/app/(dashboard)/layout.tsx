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
  Play, Building2, PanelLeftClose, PanelLeft, SlidersHorizontal,
  Gauge, HardDrive, Network, Zap as Lightning,
  BellOff, VolumeX, Volume2,
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
// Navigation Structure - Enhanced
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
      { id: 'routers', label: 'Routers', icon: <Server className="w-4 h-4" />, href: '/routers', badge: 24 },
      { id: 'interfaces', label: 'Interfaces', icon: <Activity className="w-4 h-4" />, href: '/interfaces' },
      { id: 'olts', label: 'OLTs', icon: <Network className="w-4 h-4" />, href: '/olts', badge: 8 },
      { id: 'topology', label: 'Topology', icon: <Globe className="w-4 h-4" />, href: '/topology' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
    children: [
      { id: 'ppp-users', label: 'PPP Users', icon: <UserCog className="w-4 h-4" />, href: '/ppp', badge: 248 },
      { id: 'hotspot', label: 'Hotspot', icon: <Wifi className="w-4 h-4" />, href: '/hotspot' },
      { id: 'profiles', label: 'Profiles', icon: <Tag className="w-4 h-4" />, href: '/profiles' },
    ],
  },
  {
    id: 'resellers',
    label: 'Resellers',
    icon: <Building2 className="w-5 h-5" />,
    href: '/resellers',
    badge: 28,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/billing',
    badge: 12,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { id: 'traffic', label: 'Traffic Analysis', icon: <TrendingUp className="w-4 h-4" />, href: '/analytics/traffic' },
      { id: 'capacity', label: 'Capacity Forecast', icon: <Gauge className="w-4 h-4" />, href: '/analytics/capacity' },
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
    id: 'hr',
    label: 'HR & Payroll',
    icon: <Users className="w-5 h-5 text-purple-500" />,
    children: [
      { id: 'hr-payroll', label: 'Payroll Hub', icon: <CreditCard className="w-4 h-4" />, href: '/hr/payroll' },
      { id: 'hr-process', label: 'Processing Hub', icon: <Zap className="w-4 h-4" />, href: '/hr/process' },
      { id: 'hr-directory', label: 'Employee Catalog', icon: <UserCog className="w-4 h-4" />, href: '/hr/directory' },
      { id: 'hr-salary', label: 'Salary Matrix', icon: <Tag className="w-4 h-4" />, href: '/hr/salary' },
    ],
  },
  {
    id: 'support-group',
    label: 'Support & Tickets',
    icon: <HelpCircle className="w-5 h-5 text-indigo-500" />,
    badge: 3,
    children: [
      { id: 'support-dash', label: 'Support Pulse', icon: <Activity className="w-4 h-4" />, href: '/support' },
      { id: 'support-tickets', label: 'Ticket Hub', icon: <FileText className="w-4 h-4" />, href: '/support/tickets' },
      { id: 'support-performance', label: 'Staff Analytics', icon: <BarChart3 className="w-4 h-4" />, href: '/support/performance' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { id: 'system', label: 'System Governance', icon: <Shield className="w-4 h-4" />, href: '/settings/system' },
      { id: 'users-settings', label: 'Staff Directory', icon: <UserCog className="w-4 h-4" />, href: '/settings/users' },
      { id: 'integrations', label: 'Integrations Hub', icon: <Plug className="w-4 h-4" />, href: '/settings/integrations' },
    ],
  },
];

// ============================================================================
// Enhanced Navigation Item Component
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

  // Auto-expand parent when child is active
  useEffect(() => {
    if (hasChildren && item.children) {
      const activeChild = item.children.find(
        child => child.href && activeHref.startsWith(child.href)
      );
      if (activeChild && !isExpanded) {
        setIsExpanded(true);
      }
    }
  }, [activeHref, hasChildren, item.children, isExpanded]);

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

  // Badge color mapping
  const getBadgeColor = (badge: number | string) => {
    const num = typeof badge === 'string' ? parseInt(badge) : badge;
    if (num > 100) return 'bg-blue-500';
    if (num > 50) return 'bg-cyan-500';
    if (num > 10) return 'bg-green-500';
    return 'bg-orange-500';
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          'hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1',
          isActive
            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 font-medium shadow-sm shadow-blue-500/10'
            : 'text-slate-600 dark:text-slate-400',
          collapsed && depth === 0 && 'justify-center hover:translate-x-0 group'
        )}
      >
        <span className={cn(
          'flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
        )}>
          {item.icon}
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate text-sm">{item.label}</span>
            {item.badge && (
              <span className={cn(
                'px-2 py-0.5 text-xs font-semibold rounded-full text-white',
                getBadgeColor(item.badge)
              )}>
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight className={cn(
                'w-4 h-4 transition-transform duration-150 flex-shrink-0 text-slate-400',
                isExpanded && 'rotate-90'
              )} />
            )}
          </>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="mt-1 space-y-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-700">
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
// Enhanced Sidebar Component
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
        'transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-20' : 'w-72',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'h-20 flex items-center px-4 border-b border-slate-200 dark:border-slate-800',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900 dark:text-white">NetFlow</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">ISP Operating System</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
          )}

          <button
            onClick={mobileOpen ? onToggleMobile : onToggleCollapse}
            className={cn(
              'p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800',
              'text-slate-500 transition-colors',
              !collapsed && 'lg:hidden'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <div className="hidden lg:flex px-4 py-2">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              'hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
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

        {/* User Profile */}
        <div
          className={cn(
            'p-4 border-t border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
            collapsed && 'justify-center'
          )}
          onClick={() => onNavigate('/profile')}
        >
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-500 capitalize">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Quick Settings Panel (Right Side)
// ============================================================================

function QuickSettingsPanel({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    sound: true,
    compactMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Quick Settings Panel */}
      <aside className={cn(
        'fixed top-0 right-0 z-50 h-screen w-80 max-w-[calc(100vw-2rem)]',
        'bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800',
        'shadow-2xl transform transition-transform duration-300 ease-in-out',
        'flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/30 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Quick Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your view
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <HardDrive className="w-5 h-5" />, label: 'System', color: 'bg-emerald-500' },
                { icon: <Network className="w-5 h-5" />, label: 'Network', color: 'bg-blue-500' },
                { icon: <Lightning className="w-5 h-5" />, label: 'Power', color: 'bg-amber-500' },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className={`${action.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Appearance
            </h3>
            <div className="space-y-2">
              {[
                { id: 'darkMode', label: 'Dark Mode', description: 'Switch to dark theme', icon: Moon, altIcon: Sun },
                { id: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing', icon: LayoutDashboard },
              ].map((item) => {
                const Icon = settings[item.id as keyof typeof settings] && (item as any).altIcon ? (item as any).altIcon : item.icon;
                const isActive = settings[item.id as keyof typeof settings];
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSetting(item.id as keyof typeof settings)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <div className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}>
                      <span className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Notifications
            </h3>
            <div className="space-y-2">
              {[
                { id: 'notifications', label: 'Push Notifications', description: 'Browser notifications', icon: Bell, altIcon: BellOff },
                { id: 'sound', label: 'Sound Effects', description: 'Audio alerts', icon: Zap, altIcon: VolumeX },
              ].map((item) => {
                const Icon = settings[item.id as keyof typeof settings] ? (item as any).icon : (item as any).altIcon || (item as any).icon;
                const isActive = settings[item.id as keyof typeof settings];
                
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSetting(item.id as keyof typeof settings)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <div className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}>
                      <span className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>NetFlow v2.1.0</span>
            <div className="flex items-center gap-3">
              <button className="hover:text-blue-500 transition-colors">Help</button>
              <button className="hover:text-blue-500 transition-colors">Privacy</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Enhanced Header Component
// ============================================================================

function Header({
  onMenuClick,
  notifications,
  showNotifications,
  setShowNotifications,
  acknowledgeAlert,
  onProfileClick,
  onQuickSettingsClick,
}: {
  onMenuClick: () => void;
  notifications: Alert[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  onProfileClick: () => void;
  onQuickSettingsClick: () => void;
}) {
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.acknowledged).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Menu Toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search routers, users, alerts..."
            className="w-full pl-12 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-slate-400 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden lg:inline">Sync All</span>
        </button>

        {/* Quick Settings Toggle */}
        <button
          onClick={onQuickSettingsClick}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Quick Settings"
        >
          <SlidersHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {criticalCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-3 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-scaleIn overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors',
                        !alert.acknowledged && 'bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0',
                          alert.severity === 'critical' && 'bg-red-500',
                          alert.severity === 'warning' && 'bg-amber-500',
                          alert.severity === 'info' && 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {alert.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <button
          onClick={onProfileClick}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
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
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
        onProfileClick={() => handleNavigate('/profile')}
        onQuickSettingsClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
      />

      <QuickSettingsPanel
        isOpen={quickSettingsOpen}
        onToggle={() => setQuickSettingsOpen(!quickSettingsOpen)}
      />

      <main
        className={cn(
          'pt-20 min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
