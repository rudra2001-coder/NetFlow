'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity, Server, Users, AlertTriangle, Zap, Settings, Bell,
  ChevronRight, LayoutGrid, List, TrendingUp, TrendingDown,
  Search, Command, MoreVertical, Power, MessageSquare, History,
  Layout, Minus, Plus, Grid3X3, BarChart3, PieChart, Target,
  Clock, Calendar, FileText, Download, Filter, Play, Pause,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Eye, Edit,
  RotateCcw, CheckCircle, XCircle, Info, AlertCircle,
  Sun, Moon, Globe, ArrowLeft, ArrowRight, Layers,
  RefreshCw, ZapOff, Shield, CreditCard, UserCog,
  Wifi, MapPin, Hash, FilterX, LayoutDashboard,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell, ComposedChart,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

type UserRole = 'admin' | 'engineer' | 'security' | 'executive' | 'manager';

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface Router {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  cpu: number;
  memory: number;
  traffic: number;
  riskScore: number;
  uptime: number;
  region: string;
  incidents: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  router: string;
  time: Date;
  acknowledged: boolean;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  startTime: Date;
  duration: number;
  affected: number;
  status: 'active' | 'investigating' | 'resolved';
  timeline: { time: Date; event: string }[];
}

// ============================================================================
// Role-Based Dashboard Templates
// ============================================================================

const dashboardTemplates = {
  admin: {
    name: 'Administrator',
    widgets: ['system-health', 'routers', 'alerts', 'users', 'billing', 'automation'],
    layout: 'full',
  },
  engineer: {
    name: 'Network Engineer',
    widgets: ['routers', 'topology', 'interfaces', 'traffic', 'templates'],
    layout: 'network-focused',
  },
  security: {
    name: 'Security Analyst',
    widgets: ['threats', 'access', 'compliance', 'alerts', 'audit'],
    layout: 'security-focused',
  },
  executive: {
    name: 'Executive',
    widgets: ['kpis', 'revenue', 'sla', 'capacity', 'incidents-summary'],
    layout: 'executive',
  },
  manager: {
    name: 'Operations Manager',
    widgets: ['team', 'capacity', 'tickets', 'sla', 'reports'],
    layout: 'manager-focused',
  },
};

// ============================================================================
// Drill-Down Chart Component
// ============================================================================

interface DrillDownChartProps {
  data: { name: string; value: number; children?: { name: string; value: number }[] }[];
  title: string;
}

const DrillDownChart = memo(({ data, title }: DrillDownChartProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const currentData = selected
    ? data.find(d => d.name === selected)?.children || []
    : data;

  const handleBack = () => {
    if (selected) {
      setSelected(null);
      setShowDetail(false);
    }
  };

  const handleBarClick = (name: string) => {
    const item = data.find(d => d.name === name);
    if (item?.children) {
      setSelected(name);
      setShowDetail(true);
    }
  };

  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#d946ef', '#8b5cf6'];

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={selected ? `Drill-down: ${selected}` : 'Click bars to drill down'}
        action={
          <div className="flex items-center gap-2">
            {showDetail && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowDetail(!showDetail)}>
              {showDetail ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        }
      />
      <CardContent>
        <div className={cn(
          'transition-all duration-300',
          showDetail ? 'h-96' : 'h-64'
        )}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} layout={showDetail ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {showDetail ? (
                <>
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                onClick={(_, index) => handleBarClick(currentData[index]?.name || '')}
                className="cursor-pointer transition-all duration-150 hover:opacity-80"
              >
                {currentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
DrillDownChart.displayName = 'DrillDownChart';

// ============================================================================
// Forecast Chart Component
// ============================================================================

interface ForecastChartProps {
  historical: { date: string; value: number }[];
  forecast: { date: string; value: number; lower: number; upper: number }[];
  title: string;
}

const ForecastChart = memo(({ historical, forecast, title }: ForecastChartProps) => {
  const combinedData = useMemo(() => {
    return [
      ...historical.map(d => ({ ...d, type: 'historical' })),
      ...forecast.map(d => ({ ...d, type: 'forecast' })),
    ];
  }, [historical, forecast]);

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle="Historical data with 90-day forecast (95% confidence interval)"
        action={
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-primary-500" />
              Historical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-primary-200" />
              Forecast
            </span>
          </div>
        }
      />
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              {/* Confidence interval */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#confidenceGradient)"
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="white"
                name="Lower Bound"
              />
              {/* Historical line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                name="Actual"
                connectNulls={false}
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
ForecastChart.displayName = 'ForecastChart';

// ============================================================================
// Incident Timeline & Heatmap
// ============================================================================

interface IncidentTimelineProps {
  incidents: Incident[];
}

const IncidentTimeline = memo(({ incidents }: IncidentTimelineProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <Card>
      <CardHeader
        title="Incident Timeline"
        subtitle={`Showing ${selectedPeriod} incident history`}
        action={
          <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            {(['24h', '7d', '30d'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'px-3 py-1 text-xs font-medium transition-colors',
                  selectedPeriod === period
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                )}
              >
                {period}
              </button>
            ))}
          </div>
        }
      />
      <CardContent>
        <div className="space-y-4">
          {/* Severity heatmap strip */}
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {Array.from({ length: 24 }, (_, i) => {
              const severity = Math.random() > 0.9 ? 'critical' : Math.random() > 0.8 ? 'warning' : 'none';
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-sm transition-all hover:opacity-80',
                    severity === 'critical' && 'bg-error-500',
                    severity === 'warning' && 'bg-warning-500',
                    severity === 'none' && 'bg-neutral-200 dark:bg-neutral-700'
                  )}
                  title={`Hour ${i}:00 - ${severity}`}
                />
              );
            })}
          </div>

          {/* Timeline */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {incidents.slice(0, 5).map((incident, idx) => (
              <div
                key={incident.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2',
                  incident.severity === 'critical' && 'bg-error-500',
                  incident.severity === 'warning' && 'bg-warning-500'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">
                      {incident.title}
                    </p>
                    <Badge
                      variant={incident.status === 'active' ? 'error' : incident.status === 'resolved' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{incident.duration} min duration</span>
                    <span>•</span>
                    <span>{incident.affected} affected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
IncidentTimeline.displayName = 'IncidentTimeline';

// ============================================================================
// Command Safety Modal
// ============================================================================

interface CommandSafetyModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  command: string;
  affectedCount: number;
  destructive: boolean;
}

const CommandSafetyModal = ({
  isOpen,
  onConfirm,
  onCancel,
  command,
  affectedCount,
  destructive,
}: CommandSafetyModalProps) => {
  const [typed, setTyped] = useState('');
  const [undoWindow, setUndoWindow] = useState(30); // seconds

  useEffect(() => {
    if (isOpen) {
      setTyped('');
      const timer = setInterval(() => {
        setUndoWindow(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = typed.toLowerCase() === command.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div className={cn(
        'relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in',
        destructive && 'border-2 border-error-200 dark:border-error-800'
      )}>
        <div className="flex items-center gap-3 mb-4">
          {destructive ? (
            <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
          ) : (
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {destructive ? 'Confirm Dangerous Action' : 'Confirm Action'}
            </h3>
            <p className="text-sm text-neutral-500">
              This will affect {affectedCount} {affectedCount === 1 ? 'target' : 'targets'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={cn(
            'p-3 rounded-lg',
            destructive ? 'bg-error-50 dark:bg-error-900/20' : 'bg-neutral-50 dark:bg-neutral-800'
          )}>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Command: <code className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 rounded">{command}</code>
            </p>
          </div>

          {destructive && (
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <p className="text-sm text-warning-700 dark:text-warning-300">
                ⚠️ This action cannot be undone after the confirmation window closes.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">{command}</code> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type "${command}" to confirm`}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                destructive
                  ? 'border-error-300 dark:border-error-600 focus:ring-error-500'
                  : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500'
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={!canConfirm || undoWindow === 0}
            className="flex-1"
          >
            {destructive ? 'Execute' : 'Confirm'}
          </Button>
        </div>

        {canConfirm && destructive && undoWindow > 0 && (
          <p className="text-center text-xs text-neutral-500 mt-3">
            Undo available for {undoWindow}s after execution
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Compact Mobile View
// ============================================================================

const CompactMobileView = memo(({
  role,
  onExpand
}: {
  role: UserRole;
  onExpand: () => void;
}) => {
  const [alerts] = useState([
    { severity: 'critical', count: 2, label: 'Critical' },
    { severity: 'warning', count: 5, label: 'Warning' },
    { severity: 'info', count: 12, label: 'Info' },
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-50 safe-area-inset-bottom">
      {/* Critical Alert Banner */}
      <div className="bg-error-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <span className="font-medium">2 Critical Alerts</span>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-error-600" onClick={onExpand}>
          View Details
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {alerts.map(alert => (
          <button
            key={alert.severity}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg',
              alert.severity === 'critical' && 'bg-error-50 dark:bg-error-900/20',
              alert.severity === 'warning' && 'bg-warning-50 dark:bg-warning-900/20',
              alert.severity === 'info' && 'bg-info-50 dark:bg-info-900/20'
            )}
          >
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              {alert.count}
            </span>
            <span className="text-xs text-neutral-500">{alert.label}</span>
          </button>
        ))}
      </div>

      {/* Single-Tap Actions */}
      <div className="grid grid-cols-4 gap-2 px-3 pb-3">
        {[
          { icon: <RefreshCw className="w-5 h-5" />, label: 'Sync', action: 'sync' },
          { icon: <Users className="w-5 h-5" />, label: 'Users', action: 'users' },
          { icon: <AlertTriangle className="w-5 h-5" />, label: 'Alerts', action: 'alerts' },
          { icon: <Settings className="w-5 h-5" />, label: 'Settings', action: 'settings' },
        ].map(item => (
          <button
            key={item.action}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {item.icon}
            <span className="text-xs text-neutral-600 dark:text-neutral-300">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
CompactMobileView.displayName = 'CompactMobileView';

// ============================================================================
// Main Dashboard Component
// ============================================================================

// ============================================================================
// Quick Actions Grid
// ============================================================================

function QuickActionsGrid({
  actions,
  role
}: {
  actions: { id: string; label: string; icon: React.ReactNode; category: string }[];
  role: UserRole;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors gap-3 group"
        >
          <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
            {action.icon}
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

interface DashboardProps {
  userRole?: UserRole;
}

export default function EnhancedNOCDashboard() {
  const userRole: UserRole = 'admin';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable' | 'expanded'>('comfortable');
  const [safetyModal, setSafetyModal] = useState<{
    isOpen: boolean;
    command: string;
    affectedCount: number;
    destructive: boolean;
  }>({ isOpen: false, command: '', affectedCount: 0, destructive: false });
  const [selectedTemplate, setSelectedTemplate] = useState<UserRole>(userRole);

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const routers = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: `r${i}`,
      name: `RTR-${['HQ', 'BRANCH', 'DC', 'HOTSPOT'][i % 4]}-${String(i + 1).padStart(2, '0')}`,
      status: (i % 10 === 0 ? 'offline' : i % 10 === 1 ? 'degraded' : 'online') as 'offline' | 'degraded' | 'online',
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 70) + 20,
      traffic: Math.floor(Math.random() * 1000),
      riskScore: Math.floor(Math.random() * 100),
      uptime: 99 + Math.random(),
      region: ['US-East', 'US-West', 'EU-Central', 'AP-Southeast'][i % 4],
      incidents: Math.floor(Math.random() * 5),
      risk: Math.floor(Math.random() * 100), // Added to match likely interface if needed, or just ignore
    })), []);

  const stats = useMemo(() => ({
    online: routers.filter(r => r.status === 'online').length,
    degraded: routers.filter(r => r.status === 'degraded').length,
    offline: routers.filter(r => r.status === 'offline').length,
    total: routers.length,
    affectedUsers: routers.filter(r => r.status !== 'online').reduce((sum, r) => sum + Math.floor(Math.random() * 500), 0),
  }), [routers]);

  // Historical + Forecast data
  const historicalData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 60 + Math.random() * 30,
    })), []);

  const forecastData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 70 + Math.random() * 25,
      lower: 60 + Math.random() * 15,
      upper: 80 + Math.random() * 15,
    })), []);

  const incidents = useMemo(() => [
    {
      id: '1',
      title: 'HQ Router Offline',
      severity: 'critical' as const,
      startTime: new Date(Date.now() - 30 * 60000),
      duration: 30,
      affected: 450,
      status: 'active' as const,
      timeline: [
        { time: new Date(Date.now() - 30 * 60000), event: 'Detection' },
        { time: new Date(Date.now() - 25 * 60000), event: 'Escalation' },
        { time: new Date(Date.now() - 10 * 60000), event: 'Investigation' },
      ],
    },
  ], []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setViewMode(v => v === 'comfortable' ? 'expanded' : 'comfortable');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drill-down chart data
  const drillDownData = [
    {
      name: 'Routers', value: 156, children: [
        { name: 'Online', value: 142 },
        { name: 'Degraded', value: 8 },
        { name: 'Offline', value: 6 },
      ]
    },
    {
      name: 'Users', value: 12450, children: [
        { name: 'Active', value: 8934 },
        { name: 'Suspended', value: 234 },
        { name: 'Expired', value: 156 },
      ]
    },
    {
      name: 'Incidents', value: 23, children: [
        { name: 'Critical', value: 3 },
        { name: 'Warning', value: 12 },
        { name: 'Info', value: 8 },
      ]
    },
    {
      name: 'Traffic', value: 2450, children: [
        { name: 'Peak', value: 980 },
        { name: 'Average', value: 650 },
        { name: 'Off-Peak', value: 320 },
      ]
    },
  ];

  if (viewMode === 'compact') {
    return <CompactMobileView role={selectedTemplate} onExpand={() => setViewMode('comfortable')} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">
                Network Operations Center
              </h1>
              <Badge variant="info">{dashboardTemplates[selectedTemplate].name} View</Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {(['compact', 'comfortable', 'expanded'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                      viewMode === mode
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Role Switcher (for demo) */}
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as UserRole)}
                className="text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 border-0"
              >
                {Object.entries(dashboardTemplates).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>

              <Button variant="outline" size="sm" leftIcon={<Bell className="w-4 h-4" />}>
                Alerts
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 lg:px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <StatusDot status="online" />
              <span className="text-sm"><strong>{stats.online}</strong> Online</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="degraded" />
              <span className="text-sm"><strong>{stats.degraded}</strong> Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="offline" />
              <span className="text-sm"><strong>{stats.offline}</strong> Offline</span>
            </div>
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-sm text-neutral-500">
              Last updated: {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      <main className={cn(
        'p-4 lg:p-6 space-y-6',
        viewMode === 'expanded' && 'pb-32'
      )}>
        {/* Primary KPIs - Top Tier */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Critical Metrics
          </h2>
          <div className={cn(
            'grid gap-4',
            viewMode === 'expanded'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-4'
          )}>
            <MetricCard
              title="System Health"
              value="99.5%"
              change={{ value: 0.2, positive: true }}
              icon={<Activity className="w-6 h-6" />}
              color="success"
              trend="stable"
            />
            <MetricCard
              title="Active Incidents"
              value={3}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="error"
              sparkline={[1, 2, 1, 3, 2, 3, 3]}
            />
            <MetricCard
              title="Affected Users"
              value={stats.affectedUsers.toLocaleString()}
              change={{ value: 12, positive: false }}
              icon={<Users className="w-6 h-6" />}
              color="warning"
            />
            <MetricCard
              title="Network Traffic"
              value="1.24 Gbps"
              change={{ value: 8.5, positive: true }}
              icon={<Wifi className="w-6 h-6" />}
              color="primary"
              sparkline={[650, 780, 820, 790, 980, 1020, 1240]}
            />
          </div>
        </section>

        {/* Secondary Metrics - Middle Tier */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Network Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Drill-down Chart */}
            <div className="lg:col-span-2">
              <DrillDownChart data={drillDownData} title="Resource Distribution" />
            </div>

            {/* Router Status Pie */}
            <Card>
              <CardHeader title="Router Status" />
              <CardContent>
                <UserStatusChart
                  data={[
                    { name: 'Online', value: stats.online, color: '#22c55e' },
                    { name: 'Degraded', value: stats.degraded, color: '#eab308' },
                    { name: 'Offline', value: stats.offline, color: '#ef4444' },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tertiary - Collapsible Sections */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Capacity Forecast
            </h2>
            <Badge variant="info">90-Day Prediction</Badge>
          </div>
          <ForecastChart
            historical={historicalData}
            forecast={forecastData}
            title="Bandwidth Utilization Forecast"
          />
        </section>

        {/* Incidents & Timeline */}
        <section>
          <IncidentTimeline incidents={incidents} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <QuickActionsGrid
            actions={[
              { id: 'restart', label: 'Restart Router', icon: <RefreshCw className="w-5 h-5" />, category: 'network' },
              { id: 'sync', label: 'Sync All', icon: <RefreshCw className="w-5 h-5" />, category: 'network' },
              { id: 'template', label: 'Apply Template', icon: <Layout className="w-5 h-5" />, category: 'network' },
              { id: 'notify', label: 'Send Alert', icon: <Bell className="w-5 h-5" />, category: 'network' },
              { id: 'users', label: 'View Users', icon: <Users className="w-5 h-5" />, category: 'users' },
              { id: 'report', label: 'Generate Report', icon: <FileText className="w-5 h-5" />, category: 'reports' },
              { id: 'backup', label: 'Backup Config', icon: <Download className="w-5 h-5" />, category: 'security' },
              { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" />, category: 'security' },
            ]}
            role={selectedTemplate}
          />
        </section>

        {/* Router Grid */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Router Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {routers.slice(0, viewMode === 'expanded' ? 20 : 10).map(router => (
              <RouterCard key={router.id} router={router} />
            ))}
          </div>
        </section>
      </main>

      {/* Command Safety Modal */}
      <CommandSafetyModal
        isOpen={safetyModal.isOpen}
        onConfirm={() => setSafetyModal(prev => ({ ...prev, isOpen: false }))}
        onCancel={() => setSafetyModal(prev => ({ ...prev, isOpen: false }))}
        command={safetyModal.command}
        affectedCount={safetyModal.affectedCount}
        destructive={safetyModal.destructive}
      />
    </div>
  );
}

// ============================================================================
// Supporting Components (inline for brevity)
// ============================================================================

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border bg-white dark:bg-neutral-900 shadow-sm',
      'dark:border-neutral-800 p-5',
      className
    )}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  onClick,
  className,
  disabled
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  leftIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    ghost: 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    danger: 'bg-error-600 text-white hover:bg-error-700',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    icon: 'h-10 w-10 justify-center',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {leftIcon}
      {children}
    </button>
  );
}

function Badge({ children, variant = 'default', size = 'md' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info'; size?: 'sm' | 'md' }) {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
    error: 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400',
    info: 'bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  );
}

function StatusDot({ status }: { status: 'online' | 'offline' | 'degraded' | 'maintenance' | 'synchronizing' }) {
  const colors = {
    online: 'bg-status-online',
    offline: 'bg-status-offline',
    degraded: 'bg-status-degraded',
    maintenance: 'bg-status-maintenance',
    synchronizing: 'bg-status-synchronizing',
  };

  return (
    <div className={cn('relative flex h-2.5 w-2.5')}>
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', colors[status])} />
    </div>
  );
}

function UserStatusChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="flex justify-center mb-4">
        <ResponsiveContainer width={150} height={150}>
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPie>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-neutral-600 dark:text-neutral-300">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 dark:text-white">{item.value}</span>
              <span className="text-neutral-400">({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouterCard({ router }: { router: Router }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={router.status} />
        <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
          {router.name}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-neutral-500">CPU</span>
          <span className={cn(
            'font-medium',
            router.cpu > 80 ? 'text-error-500' : router.cpu > 60 ? 'text-warning-500' : 'text-success-500'
          )}>
            {router.cpu}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Traffic</span>
          <span className="font-medium text-neutral-900 dark:text-white">{router.traffic} Mbps</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Uptime</span>
          <span className="font-medium text-success-500">{router.uptime.toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  color = 'primary',
  trend,
  sparkline
}: {
  title: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
}) {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    success: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    error: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400',
    info: 'bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400',
  };

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              change.positive ? 'text-success-600' : 'text-error-600'
            )}>
              {change.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change.value}%</span>
              <span className="text-neutral-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>{icon}</div>
      </div>
      {sparkline && (
        <div className="h-10 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((v, i) => ({ i, v }))}>
              <Line type="monotone" dataKey="v" stroke={color === 'error' ? '#ef4444' : color === 'warning' ? '#eab308' : '#0ea5e9'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}


