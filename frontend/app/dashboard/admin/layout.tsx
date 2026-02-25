'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Server, Users, UserCog, CreditCard, FileText,
  Settings, Plug, BarChart3, Shield, Activity, Wifi,
  ChevronDown, ChevronRight, Menu, X, Bell,
  Search, Tag, Zap, AlertTriangle,
  CheckCircle, Clock, TrendingUp,
  LogOut, User, Globe,
  RefreshCw, HelpCircle,
  Play, Building2, PanelLeftClose, PanelLeft, SlidersHorizontal,
  Gauge, HardDrive, Network,
  BellOff, VolumeX, PieChart,
  Router, Antenna, Map, GitFork, Layers, List, Upload,
  Package, DollarSign, Receipt, BookOpen,
  Users2, Wallet, ArrowLeftRight, BarChart2,
  Cpu, Terminal, Repeat, Database, Zap as LightningBolt,
  Briefcase, Banknote, Calculator, FileCheck, TrendingDown,
  LifeBuoy, Headphones, Star, MonitorPlay,
  Lock, UserCheck, LinkIcon, PhoneCall,
  Sun, Moon, ChevronUp, Boxes, Signal,
  Landmark, Scale, FileSearch, AlertCircle, OctagonAlert,
  Eye, EyeOff, Monitor, Globe2, Timer, GaugeCircle,
  FileSpreadsheet, UserPlus, UserMinus, CalendarClock, ArrowRightLeft,
  Send, Archive, ClipboardList,
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
  badgeColor?: string;
  description?: string;
  children?: NavItem[];
  roles?: UserRole[];
  dividerAbove?: boolean;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// ============================================================================
// Navigation Structure — Hierarchical Module Tree
// ============================================================================

const navigationItems: NavItem[] = [
  // ── COMMAND CENTER ──────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
    href: '/dashboard',
    description: 'Overview & KPIs',
  },

  // ── NETWORK ──────────────────────────────────────────────────────────────
  {
    id: 'network',
    label: 'Network',
    icon: <Network className="w-[18px] h-[18px]" />,
    description: 'Infrastructure & Topology',
    children: [


      {
        id: 'interfaces',
        label: 'Interfaces',
        icon: <Signal className="w-4 h-4" />,
        href: '/interfaces',
        description: 'Physical & logical ports',
      },
      {
        id: 'topology',
        label: 'Topology',
        icon: <GitFork className="w-4 h-4" />,
        href: '/topology',
        description: 'Visual network diagram',
      },
      {
        id: 'geo-maps',
        label: 'Geo Maps',
        icon: <Map className="w-4 h-4" />,
        href: '/topology',
        description: 'Geographic coverage map',
      },
    ],
  },

  // ── MIKROTEK ──────────────────────────────────────────────────────────────
  {
    id: 'mikrotek',
    label: 'MikroTik',
    icon: <Cpu className="w-[18px] h-[18px]" />,
    description: 'RouterOS management',
    children: [
      {
        id: 'routers',
        label: 'Routers',
        icon: <Router className="w-4 h-4" />,
        href: '/routers',
        badge: 24,
        badgeColor: 'bg-blue-500',
        description: 'MikroTik device management',
      },

      {
        id: 'bulk-import',
        label: 'Bulk Client Import',
        icon: <Upload className="w-4 h-4" />,
        href: '/bulk-import',
        description: 'Import clients from Excel/CSV',
      },
      {
        id: 'bulk-line-import',
        label: 'Bulk Line Import',
        icon: <FileSpreadsheet className="w-4 h-4" />,
        href: '/bulk-line-import',
        description: 'Import lines from MikroTik',
      },
      {
        id: 'terminal',
        label: 'Terminal',
        icon: <Terminal className="w-4 h-4" />,
        href: '/dashboard/command-center',
        description: 'SSH command center',
      },
    ],
  },
  // ── OLT Management ────────────────────────────────────────────────────────────
  {
    id: 'olt-management',
    label: 'OLT Management',
    icon: <Antenna className="w-[18px] h-[18px]" />,
    description: 'OLT device management',
    href: '/olts',
    badge: 8,
    badgeColor: 'bg-cyan-500',
  },
  // ── CUSTOMERS ────────────────────────────────────────────────────────────
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users2 className="w-[18px] h-[18px]" />,
    description: 'Subscriber management',
    children: [
      {
        id: 'ppp-users',
        label: 'PPP Users',
        icon: <Users className="w-4 h-4" />,
        href: '/ppp',
        badge: 248,
        badgeColor: 'bg-violet-500',
        description: 'PPPoE sessions',
      },
      {
        id: 'hotspot',
        label: 'Hotspot',
        icon: <Wifi className="w-4 h-4" />,
        href: '/hotspot',
        description: 'Hotspot users & sessions',
      },
      {
        id: 'profiles',
        label: 'Speed Profiles',
        icon: <Layers className="w-4 h-4" />,
        href: '/profiles',
        description: 'Bandwidth templates',
      },
      {
        id: 'critique-list',
        label: 'Critique List',
        icon: <List className="w-4 h-4" />,
        href: '/ppp',
        badge: 'NEW',
        badgeColor: 'bg-orange-500',
        description: 'Problem device audit',
      },

    ],
  },

  // ── CLIENT MANAGEMENT ──────────────────────────────────────────────────────
  {
    id: 'client',
    label: 'Client',
    icon: <UserPlus className="w-[18px] h-[18px]" />,
    description: 'Client Management',
    children: [
      {
        id: 'new-request',
        label: 'New Request',
        icon: <Send className="w-4 h-4" />,
        href: '/client/new-request',
        description: 'New connection requests',
      },
      {
        id: 'add-new',
        label: 'Add New',
        icon: <UserPlus className="w-4 h-4" />,
        href: '/client/add-new',
        description: 'Add new client',
      },
      {
        id: 'client-list',
        label: 'Client List',
        icon: <Users className="w-4 h-4" />,
        href: '/client',
        badge: 523,
        badgeColor: 'bg-emerald-500',
        description: 'All active clients',
      },
      {
        id: 'left-client',
        label: 'Left Client',
        icon: <UserMinus className="w-4 h-4" />,
        href: '/client/left',
        description: 'Disconnected clients',
      },
      {
        id: 'scheduler',
        label: 'Scheduler',
        icon: <CalendarClock className="w-4 h-4" />,
        href: '/client/scheduler',
        description: 'Auto tasks & scheduling',
      },
      {
        id: 'change-request',
        label: 'Change Request',
        icon: <ArrowRightLeft className="w-4 h-4" />,
        href: '/client/change-request',
        description: 'Plan & package changes',
      },
      {
        id: 'portal-manage',
        label: 'Portal Manage',
        icon: <Settings className="w-4 h-4" />,
        href: '/client/portal',
        description: 'Client portal settings',
      },
    ],
  },

  // ── BILLING & FINANCE ────────────────────────────────────────────────────
  {
    id: 'billing-finance',
    label: 'Billing & Finance',
    icon: <Landmark className="w-[18px] h-[18px]" />,
    description: 'Revenue operations',
    children: [
      {
        id: 'billing',
        label: 'Billing',
        icon: <Receipt className="w-4 h-4" />,
        href: '/billing',
        badge: 12,
        badgeColor: 'bg-orange-500',
        description: 'Invoice generation',
      },
      {
        id: 'accounting',
        label: 'Accounting',
        icon: <Calculator className="w-4 h-4" />,
        href: '/accounting',
        description: 'Ledger & reconciliation',
        children: [
          { id: 'acc-invoices', label: 'Invoices', icon: <FileText className="w-3.5 h-3.5" />, href: '/accounting/invoices', description: 'Issue & track invoices' },
          { id: 'acc-payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" />, href: '/accounting/payments', description: 'Payment collection' },
          { id: 'acc-expenses', label: 'Expenses', icon: <TrendingDown className="w-3.5 h-3.5" />, href: '/accounting/expenses', description: 'Expense tracking' },
          { id: 'acc-income', label: 'Income', icon: <TrendingUp className="w-3.5 h-3.5" />, href: '/accounting/income', description: 'Revenue records' },
          { id: 'acc-ledger', label: 'Ledger', icon: <BookOpen className="w-3.5 h-3.5" />, href: '/accounting/ledger', description: 'General ledger' },
          { id: 'acc-reconciliation', label: 'Reconciliation', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, href: '/accounting/reconciliation', description: 'Bank matching' },
        ],
      },

    ],
  },
  // ── MacReseller ────────────────────────────────────────────────────

  {
    id: 'macreseller',
    label: 'MACReseller',
    icon: <Globe className="w-[18px] h-[18px]" />,
    description: 'Global reseller network',
    children: [

      {
        id: 'packages',
        label: 'Packages',
        icon: <Package className="w-4 h-4" />,
        href: '/resellers/packages',
        description: 'Service plans',
      },
      {
        id: 'tariffs',
        label: 'Tariffs',
        icon: <Tag className="w-4 h-4" />,
        href: '/resellers/tariffs',
        description: 'Pricing structures',
      },
      {
        id: 'reseller-funds',
        label: 'Reseller Funds',
        icon: <Wallet className="w-4 h-4" />,
        href: '/resellers/funds',
        description: 'Partner balances',
      },
      {
        id: 'resellers',
        label: 'Resellers',
        icon: <Building2 className="w-4 h-4" />,
        href: '/resellers',
        badge: 28,
        badgeColor: 'bg-emerald-500',
        description: 'Partner network',
      },
      {
        id: 'settlements',
        label: 'Settlements',
        icon: <Scale className="w-4 h-4" />,
        href: '/resellers/settlements',
        description: 'Partner settlements',
      },
    ]
  },
  // ── ANALYTICS & REPORTS ──────────────────────────────────────────────────
  {
    id: 'analytics-group',
    label: 'Analytics',
    icon: <BarChart3 className="w-[18px] h-[18px]" />,
    description: 'Insights & forecasts',
    children: [
      {
        id: 'analytics-traffic',
        label: 'Traffic Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        href: '/analytics/traffic',
        description: 'Throughput monitoring',
      },
      {
        id: 'analytics-capacity',
        label: 'Capacity Forecast',
        icon: <Gauge className="w-4 h-4" />,
        href: '/analytics/capacity',
        description: 'Load planning',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <FileSearch className="w-4 h-4" />,
        href: '/reports',
        description: 'Scheduled & custom reports',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: <Shield className="w-4 h-4" />,
        href: '/compliance',
        description: 'Audit & regulatory',
      },
    ],
  },

  // ── AUTOMATION ───────────────────────────────────────────────────────────
  {
    id: 'automation',
    label: 'Automation',
    icon: <Repeat className="w-[18px] h-[18px]" />,
    description: 'Scripts & scheduling',
    children: [
      { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" />, href: '/templates', description: 'Config templates' },
      { id: 'rules', label: 'Rules Engine', icon: <Settings className="w-4 h-4" />, href: '/rules', description: 'Trigger conditions' },
      { id: 'executions', label: 'Executions', icon: <Play className="w-4 h-4" />, href: '/executions', description: 'Run history' },
    ],
  },

  // ── HR & PAYROLL ─────────────────────────────────────────────────────────
  {
    id: 'hr',
    label: 'HR & Payroll',
    icon: <Briefcase className="w-[18px] h-[18px]" />,
    description: 'Human resources',
    children: [
      { id: 'hr-payroll', label: 'Payroll Hub', icon: <Banknote className="w-4 h-4" />, href: '/hr/payroll', description: 'Salary disbursements' },
      { id: 'hr-process', label: 'Processing Hub', icon: <Zap className="w-4 h-4" />, href: '/hr/process', description: 'Payroll processing' },
      { id: 'hr-directory', label: 'Employee Catalog', icon: <UserCog className="w-4 h-4" />, href: '/hr/directory', description: 'Staff directory' },
      { id: 'hr-salary', label: 'Salary Matrix', icon: <BarChart2 className="w-4 h-4" />, href: '/hr/salary', description: 'Compensation bands' },
    ],
  },

  // ── SUPPORT ──────────────────────────────────────────────────────────────
  {
    id: 'support-group',
    label: 'Support',
    icon: <Headphones className="w-[18px] h-[18px]" />,
    badge: 3,
    badgeColor: 'bg-red-500',
    description: 'Tickets & helpdesk',
    children: [
      { id: 'support-dash', label: 'Support Pulse', icon: <Activity className="w-4 h-4" />, href: '/support', description: 'Live support metrics' },
      { id: 'support-tickets', label: 'Ticket Hub', icon: <HelpCircle className="w-4 h-4" />, href: '/support/tickets', badge: 3, badgeColor: 'bg-red-500', description: 'Open tickets' },
      { id: 'support-performance', label: 'Staff Analytics', icon: <Star className="w-4 h-4" />, href: '/support/performance', description: 'Agent performance' },
    ],
  },

  // ── SETTINGS ─────────────────────────────────────────────────────────────
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-[18px] h-[18px]" />,
    description: 'System configuration',
    dividerAbove: true,
    children: [
      { id: 'settings-system', label: 'System', icon: <Shield className="w-4 h-4" />, href: '/settings/system', description: 'Core configuration' },
      { id: 'settings-users', label: 'Users & Access', icon: <UserCheck className="w-4 h-4" />, href: '/settings/users', description: 'Staff accounts' },
      { id: 'settings-integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" />, href: '/settings/integrations', description: 'API & webhooks' },
    ],
  },
];

// ============================================================================
// Utility
// ============================================================================

function getActiveParentIds(items: NavItem[], activeHref: string): Set<string> {
  const active = new Set<string>();
  const walk = (items: NavItem[], parentId?: string): boolean => {
    for (const item of items) {
      const selfMatch = item.href && (activeHref === item.href || activeHref.startsWith(item.href + '/'));
      const childMatch = item.children ? walk(item.children, item.id) : false;
      if (selfMatch || childMatch) {
        if (parentId) active.add(parentId);
        active.add(item.id);
        return true;
      }
    }
    return false;
  };
  walk(items);
  return active;
}

// ============================================================================
// NavItem Component – Recursive with 3-level support
// ============================================================================

function NavItemComponent({
  item,
  depth = 0,
  collapsed,
  activeHref,
  activeIds,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  collapsed: boolean;
  activeHref: string;
  activeIds: Set<string>;
  onNavigate: (href: string) => void;
}) {
  const hasChildren = !!item.children?.length;
  const isActive = !!item.href && (activeHref === item.href || activeHref.startsWith(item.href + '/'));
  const isAncestorActive = activeIds.has(item.id) && !isActive;
  const [expanded, setExpanded] = useState(false);

  // Auto-expand when a descendant is active
  useEffect(() => {
    if (activeIds.has(item.id)) {
      setExpanded(true);
    }
  }, [activeIds, item.id]);

  if (collapsed && depth > 0) return null;

  const indent = depth === 0 ? '' : depth === 1 ? 'ml-3' : 'ml-6';

  const handleClick = () => {
    if (hasChildren) setExpanded(v => !v);
    else if (item.href) onNavigate(item.href);
  };

  // ── Visual tokens by depth
  const depthStyles = {
    0: {
      button: cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        'group relative overflow-hidden',
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
          : isAncestorActive
            ? 'bg-slate-800/60 text-slate-200'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
        collapsed && 'justify-center px-2'
      ),
    },
    1: {
      button: cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
        isActive
          ? 'bg-blue-500/15 text-blue-300 border-l-2 border-blue-400'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40',
      ),
    },
    2: {
      button: cn(
        'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150',
        isActive
          ? 'text-blue-400 bg-blue-500/10'
          : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/30',
      ),
    },
  };

  const btnClass = depthStyles[Math.min(depth, 2) as 0 | 1 | 2].button;

  return (
    <div className={cn('relative', indent)}>
      {/* Divider */}
      {item.dividerAbove && depth === 0 && (
        <div className="h-px bg-slate-800/80 my-3 mx-1" />
      )}

      <button onClick={handleClick} className={btnClass} title={collapsed ? item.label : undefined}>
        {/* Active glow for top-level */}
        {depth === 0 && isActive && (
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 rounded-xl pointer-events-none" />
        )}

        {/* Icon */}
        <span className={cn(
          'flex-shrink-0 transition-colors',
          isActive && depth === 0 ? 'text-white' : '',
          isActive && depth > 0 ? 'text-blue-400' : '',
        )}>
          {item.icon}
        </span>

        {/* Label area */}
        {(!collapsed || depth > 0) && (
          <>
            <span className="flex-1 text-left truncate leading-none">{item.label}</span>
            {/* Badge */}
            {item.badge !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white flex-shrink-0',
                item.badgeColor ?? 'bg-blue-500'
              )}>
                {item.badge}
              </span>
            )}
            {/* Expand arrow */}
            {hasChildren && (
              <ChevronRight className={cn(
                'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-slate-600',
                expanded && 'rotate-90',
              )} />
            )}
          </>
        )}

        {/* Collapsed top-level badge dot */}
        {collapsed && depth === 0 && item.badge !== undefined && (
          <span className={cn(
            'absolute top-0.5 right-0.5 w-2 h-2 rounded-full',
            item.badgeColor ?? 'bg-blue-500'
          )} />
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && !collapsed && (
        <div className={cn(
          'mt-0.5 space-y-0.5 overflow-hidden',
          depth === 0 && 'border-l border-slate-800/80 ml-[22px] pl-2 pb-1 pt-0.5',
          depth === 1 && 'border-l border-slate-800/50 ml-[18px] pl-2 pb-0.5',
        )}>
          {item.children!.map(child => (
            <NavItemComponent
              key={child.id}
              item={child}
              depth={depth + 1}
              collapsed={false}
              activeHref={activeHref}
              activeIds={activeIds}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Module Group Label (section headers)
// ============================================================================

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-3" />;
  return (
    <div className="px-3 pt-4 pb-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 select-none">
        {label}
      </p>
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
  activeHref,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onToggleCollapse: () => void;
  activeHref: string;
  onNavigate: (href: string) => void;
}) {
  const activeIds = useMemo(() => getActiveParentIds(navigationItems, activeHref), [activeHref]);

  // Group the navigation items for section labels
  const sections: { label: string; items: NavItem[] }[] = [
    { label: '', items: navigationItems.filter(i => i.id === 'dashboard') },
    { label: 'Infrastructure', items: navigationItems.filter(i => ['network', 'mikrotek', 'olt-management'].includes(i.id)) },
    { label: 'Business', items: navigationItems.filter(i => ['customers', 'billing-finance'].includes(i.id)) },
    { label: 'Operations', items: navigationItems.filter(i => ['analytics-group', 'automation'].includes(i.id)) },
    { label: 'Organization', items: navigationItems.filter(i => ['hr', 'support-group'].includes(i.id)) },
    { label: 'System', items: navigationItems.filter(i => ['settings'].includes(i.id)) },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen flex flex-col',
        'bg-[#0d1117] border-r border-slate-800/60',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo Area */}
        <div className={cn(
          'h-16 flex items-center border-b border-slate-800/60 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-[15px] text-white leading-none">NetFlow</h1>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">ISP Operating System</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={mobileOpen ? onToggleMobile : onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 transition-colors lg:flex"
            >
              <X className="w-4 h-4 lg:hidden" />
              <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={onToggleCollapse}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && <SectionLabel label={section.label} collapsed={collapsed} />}
              {section.items.map(item => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  activeHref={activeHref}
                  activeIds={activeIds}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div
          className={cn(
            'border-t border-slate-800/60 p-3 cursor-pointer',
            'hover:bg-slate-800/40 transition-colors flex-shrink-0',
            collapsed ? 'flex justify-center' : 'flex items-center gap-3',
          )}
          onClick={() => onNavigate('/profile')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate leading-none">Admin User</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-none">Administrator</p>
            </div>
          )}
          {!collapsed && (
            <button
              title="Logout"
              className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Breadcrumb
// ============================================================================

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);

  const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    routers: 'Routers',
    olts: 'OLT Management',
    interfaces: 'Interfaces',
    topology: 'Topology',
    ppp: 'PPP Users',
    hotspot: 'Hotspot',
    profiles: 'Profiles',
    resellers: 'Resellers',
    billing: 'Billing',
    accounting: 'Accounting',
    invoices: 'Invoices',
    payments: 'Payments',
    expenses: 'Expenses',
    income: 'Income',
    ledger: 'Ledger',
    reconciliation: 'Reconciliation',
    reports: 'Reports',
    analytics: 'Analytics',
    traffic: 'Traffic',
    capacity: 'Capacity',
    compliance: 'Compliance',
    automation: 'Automation',
    templates: 'Templates',
    rules: 'Rules',
    executions: 'Executions',
    hr: 'HR',
    payroll: 'Payroll',
    process: 'Processing',
    directory: 'Directory',
    salary: 'Salary',
    support: 'Support',
    tickets: 'Tickets',
    performance: 'Performance',
    settings: 'Settings',
    system: 'System',
    users: 'Users',
    integrations: 'Integrations',
    profile: 'Profile',
    funds: 'Funds',
    packages: 'Packages',
    tariffs: 'Tariffs',
    settlements: 'Settlements',
    noc: 'NOC',
    'enhanced-noc': 'Enhanced NOC',
    'enterprise-noc': 'Enterprise NOC',
    'command-center': 'Command Center',
  };

  return (
    <nav className="flex items-center gap-1 text-sm">
      <button className="text-slate-500 hover:text-slate-300 transition-colors">
        <LayoutDashboard className="w-3.5 h-3.5" />
      </button>
      {segments.map((seg, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className={cn(
            'transition-colors',
            i === segments.length - 1
              ? 'text-slate-300 font-medium'
              : 'text-slate-600 hover:text-slate-400 cursor-pointer'
          )}>
            {labelMap[seg] ?? seg}
          </span>
        </React.Fragment>
      ))}
    </nav>
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
  onProfileClick,
  collapsed,
  onQuickSettingsClick,
  showQuickSettings,
}: {
  onMenuClick: () => void;
  notifications: Alert[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  onProfileClick: () => void;
  collapsed: boolean;
  onQuickSettingsClick: () => void;
  showQuickSettings: boolean;
}) {
  const pathname = usePathname();
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.acknowledged).length;
  const unreadCount = notifications.filter(n => !n.acknowledged).length;

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16',
      'bg-[#0d1117]/90 backdrop-blur-xl border-b border-slate-800/60',
      'flex items-center justify-between px-4 gap-4',
      'transition-all duration-300',
      collapsed ? 'left-[68px]' : 'left-[260px]',
      'left-0 lg:left-[260px]',
      collapsed && 'lg:left-[68px]',
    )}>
      {/* Left: Menu + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors lg:hidden flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex min-w-0">
          <Breadcrumb pathname={pathname} />
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            readOnly
            placeholder="Search modules, users, alerts…"
            className="w-full pl-9 pr-14 py-2 bg-slate-800/60 border border-slate-700/40 rounded-xl text-[13px] text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-800 rounded border border-slate-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Sync */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Sync</span>
        </button>

        {/* Quick Settings */}
        <button
          onClick={onQuickSettingsClick}
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            showQuickSettings 
              ? 'text-purple-400 bg-purple-500/10' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
          )}
          title="Quick Settings"
        >
          <SlidersHorizontal className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className={cn(
                'absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[#0d1117]',
                criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
              )} />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#161b22] border border-slate-800/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => acknowledgeAlert(alert.id)}
                      className={cn(
                        'p-3.5 border-b border-slate-800/40 hover:bg-slate-800/30 cursor-pointer transition-colors',
                        !alert.acknowledged && 'bg-blue-500/5'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-slate-200">{alert.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                          <p className="text-[11px] text-slate-700 mt-1">{Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago</p>
                        </div>
                        {!alert.acknowledged && (
                          <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full h-fit">New</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-800/60">
                  <button className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors text-center py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-[13px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors hidden lg:inline">Admin</span>
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// Quick Settings Panel
// ============================================================================

interface QuickSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

function QuickSettingsPanel({ open, onClose }: QuickSettingsPanelProps) {
  const [settings, setSettings] = useState({
    darkMode: false,
    compactMode: false,
    showNotifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    language: 'en',
    timezone: 'UTC+6',
    performanceMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="
        fixed top-0 right-0 z-50 h-screen w-80
        bg-[#0d1117] border-l border-slate-800/60
        transform transition-transform duration-300 ease-out
        shadow-2xl shadow-black/20
        overflow-hidden
      ">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-white">Quick Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-4">
          {/* Appearance Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Appearance</p>
            
            <div 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60"
              onClick={() => toggleSetting('darkMode')}
            >
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span className="text-[13px] text-slate-300">Dark Mode</span>
              </div>
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors relative cursor-pointer',
                settings.darkMode ? 'bg-purple-500' : 'bg-slate-700'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.darkMode ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 cursor-pointer"
              onClick={() => toggleSetting('compactMode')}
            >
              <div className="flex items-center gap-3">
                <GaugeCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-[13px] text-slate-300">Compact Mode</span>
              </div>
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors relative',
                settings.compactMode ? 'bg-cyan-500' : 'bg-slate-700'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.compactMode ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Notifications</p>
            
            <div 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 cursor-pointer"
              onClick={() => toggleSetting('showNotifications')}
            >
              <div className="flex items-center gap-3">
                {settings.showNotifications ? <Bell className="w-4 h-4 text-blue-400" /> : <BellOff className="w-4 h-4 text-slate-500" />}
                <span className="text-[13px] text-slate-300">Show Alerts</span>
              </div>
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors relative',
                settings.showNotifications ? 'bg-blue-500' : 'bg-slate-700'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.showNotifications ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Performance</p>
            
            <div 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 cursor-pointer"
              onClick={() => toggleSetting('performanceMode')}
            >
              <div className="flex items-center gap-3">
                <Zap className={cn('w-4 h-4', settings.performanceMode ? 'text-amber-400' : 'text-slate-500')} />
                <span className="text-[13px] text-slate-300">Performance Mode</span>
              </div>
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors relative',
                settings.performanceMode ? 'bg-amber-500' : 'bg-slate-700'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.performanceMode ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 cursor-pointer"
              onClick={() => toggleSetting('autoRefresh')}
            >
              <div className="flex items-center gap-3">
                <RefreshCw className={cn('w-4 h-4', settings.autoRefresh ? 'text-green-400' : 'text-slate-500')} />
                <span className="text-[13px] text-slate-300">Auto Refresh</span>
              </div>
              <div className={cn(
                'w-10 h-5.5 rounded-full transition-colors relative',
                settings.autoRefresh ? 'bg-green-500' : 'bg-slate-700'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.autoRefresh ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>

            {settings.autoRefresh && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-slate-500" />
                    <span className="text-[13px] text-slate-300">Refresh Interval</span>
                  </div>
                  <span className="text-[12px] text-blue-400 font-medium">{settings.refreshInterval}s</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="120" 
                  step="10"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>10s</span>
                  <span>120s</span>
                </div>
              </div>
            )}
          </div>

          {/* Regional Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Regional</p>
            
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <div className="flex items-center gap-3 mb-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[13px] text-slate-300">Language</span>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span className="text-[13px] text-slate-300">Timezone</span>
              </div>
              <select 
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                <option value="UTC+6">UTC+6 (Bangladesh)</option>
                <option value="UTC">UTC</option>
                <option value="UTC+1">UTC+1</option>
                <option value="UTC+5">UTC+5</option>
                <option value="UTC+8">UTC+8</option>
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Quick Actions</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span className="text-[12px]">Sync</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
                <Gauge className="w-4 h-4" />
                <span className="text-[12px]">Metrics</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
                <Activity className="w-4 h-4" />
                <span className="text-[12px]">Status</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-[12px]">Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Main Dashboard Layout
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const [notifications, setNotifications] = useState<Alert[]>([
    { id: '1', severity: 'critical', title: 'Router Offline', message: 'RTR-HQ-01 is not responding', timestamp: new Date(Date.now() - 2 * 60000), acknowledged: false },
    { id: '2', severity: 'warning', title: 'High CPU Usage', message: 'RTR-BRANCH-15 at 92% CPU', timestamp: new Date(Date.now() - 15 * 60000), acknowledged: false },
    { id: '3', severity: 'info', title: 'Backup Complete', message: 'Daily config backup completed', timestamp: new Date(Date.now() - 60 * 60000), acknowledged: true },
  ]);

  const acknowledgeAlert = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n));

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    setMobileOpen(false);
  }, [router]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setShowNotifications(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <QuickSearch />

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
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
        collapsed={sidebarCollapsed}
        onQuickSettingsClick={() => setShowQuickSettings(!showQuickSettings)}
        showQuickSettings={showQuickSettings}
      />

      <QuickSettingsPanel
        open={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
      />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[260px]',
          showQuickSettings && 'lg:pr-[320px]'
        )}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
