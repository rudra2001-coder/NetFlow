'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { DataDensityToggle } from '@/components/ui/DataDensityToggle';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';
import {
  Activity, Server, Users, AlertTriangle, Zap, Settings, Bell,
  ChevronRight, LayoutGrid, List, AlertCircle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Search,
  Command, Eye, MoreVertical, Power, MessageSquare, History, Layout,
  Minus, Plus, Grid3X3, BarChart3, PieChart, Target, Shield,
  ZapOff, RefreshCw, X, Maximize2, Minimize2, ExternalLink,
  Calendar, FileText, Download, Filter, Play, Pause, RotateCcw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface Router {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'degraded' | 'synchronizing';
  cpu: number;
  memory: number;
  trafficIn: number;
  trafficOut: number;
  packetLoss: number;
  uplinkStatus: 'up' | 'down';
  region: string;
  cluster?: string;
  pppUsers: number;
  riskScore: number;
  uptime24h: number;
  incidents7d: number;
  changes7d: number;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  affectedRouters: number;
  affectedUsers: number;
  affectedRegions: string[];
  affectedVlans: string[];
  affectedResellers: string[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'investigating' | 'resolved';
  timeline: { timestamp: Date; event: string; user?: string }[];
}

interface CorrelationEvent {
  id: string;
  events: {
    timestamp: Date;
    type: string;
    description: string;
    router?: string;
  }[];
  rootCause?: string;
  confidence: number;
}

interface HealthMetrics {
  apiLatency: number;
  workerQueueDepth: number;
  redisLag: number;
  wsConnections: number;
  automationBacklog: number;
}

// ============================================================================
// Risk Score Badge Component
// ============================================================================

const RiskScoreBadge = memo(({ score }: { score: number }) => {
  const color = score > 70 ? 'text-error-500 bg-error-100' : 
               score > 40 ? 'text-warning-500 bg-warning-100' : 
               'text-success-500 bg-success-100';
  
  const label = score > 70 ? 'High Risk' : 
               score > 40 ? 'Medium Risk' : 'Low Risk';

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      <Target className="w-3 h-3" />
      <span>{score}% - {label}</span>
    </div>
  );
});
RiskScoreBadge.displayName = 'RiskScoreBadge';

// ============================================================================
// Operational Memory Component
// ============================================================================

const OperationalMemory = memo(({ router }: { router: Router }) => {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1" title="7-Day Uptime">
        <Clock className="w-3.5 h-3.5 text-neutral-400" />
        <span className={cn(
          'font-medium',
          router.uptime24h < 99 ? 'text-warning-500' : 'text-success-500'
        )}>
          {router.uptime24h.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-1" title="7-Day Incidents">
        <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />
        <span className={cn(
          'font-medium',
          router.incidents7d > 2 ? 'text-error-500' : 'text-neutral-600 dark:text-neutral-300'
        )}>
          {router.incidents7d}
        </span>
      </div>
      <div className="flex items-center gap-1" title="7-Day Config Changes">
        <FileText className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-medium text-neutral-600 dark:text-neutral-300">
          {router.changes7d}
        </span>
      </div>
    </div>
  );
});
OperationalMemory.displayName = 'OperationalMemory';

// ============================================================================
// Enhanced System Status Panel
// ============================================================================

const SystemStatusPanel = ({ 
  isOpen, 
  onClose,
  metrics 
}: { 
  isOpen: boolean;
  onClose: () => void;
  metrics: HealthMetrics;
}) => {
  if (!isOpen) return null;

  const subsystems = [
    { name: 'API Latency', value: `${metrics.apiLatency}ms`, status: metrics.apiLatency < 100 ? 'healthy' : 'degraded' },
    { name: 'Worker Queue', value: `${metrics.workerQueueDepth} jobs`, status: metrics.workerQueueDepth < 50 ? 'healthy' : 'degraded' },
    { name: 'Redis Lag', value: `${metrics.redisLag}ms`, status: metrics.redisLag < 50 ? 'healthy' : 'degraded' },
    { name: 'WebSocket', value: `${metrics.wsConnections} conns`, status: 'healthy' },
    { name: 'Automation', value: `${metrics.automationBacklog} pending`, status: metrics.automationBacklog < 10 ? 'healthy' : 'degraded' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 z-50 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-neutral-900 dark:text-white">
            System Health
          </h4>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {subsystems.map(sub => (
            <div key={sub.name} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {sub.name}
                </p>
                <p className="text-xs text-neutral-500">{sub.value}</p>
              </div>
              <div className={cn(
                'w-2 h-2 rounded-full',
                sub.status === 'healthy' ? 'bg-success-500' : 'bg-warning-500'
              )} />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" size="sm" className="w-full" leftIcon={<BarChart3 className="w-4 h-4" />}>
            View Detailed Metrics
          </Button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// Enhanced System Status Indicator
// ============================================================================

const EnhancedSystemStatus = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    apiLatency: 45,
    workerQueueDepth: 12,
    redisLag: 8,
    wsConnections: 2847,
    automationBacklog: 3,
  });

  const status = metrics.apiLatency > 100 || metrics.workerQueueDepth > 50 ? 'degraded' : 'operational';

  return (
    <div className="relative">
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
          status === 'degraded' && 'animate-pulse-soft'
        )}
      >
        <div className={cn(
          'w-2 h-2 rounded-full',
          status === 'operational' ? 'bg-success-500' : 'bg-warning-500'
        )} />
        <span className="text-xs text-neutral-500 hidden lg:inline">
          {status === 'operational' ? 'System Operational' : 'System Degraded'}
        </span>
      </button>

      <SystemStatusPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};

// ============================================================================
// Executive Mode Toggle
// ============================================================================

const ExecutiveModeToggle = ({ 
  enabled, 
  onToggle 
}: { 
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(false)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          !enabled
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
        )}
      >
        <Activity className="w-4 h-4" />
        <span className="hidden sm:inline">Operations</span>
      </button>
      <button
        onClick={() => onToggle(true)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          enabled
            ? 'bg-accent-600 text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
        )}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden sm:inline">Executive</span>
      </button>
    </div>
  );
};

// ============================================================================
// Incident Lifecycle Panel
// ============================================================================

const IncidentLifecyclePanel = ({ 
  incident, 
  onResolve 
}: { 
  incident: Incident;
  onResolve: () => void;
}) => {
  const duration = useMemo(() => {
    const diff = Date.now() - incident.startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  }, [incident.startTime]);

  return (
    <Card className="border-2 border-error-300 dark:border-error-700">
      <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border-b border-error-200 dark:border-error-800">
        <AlertCircle className="w-6 h-6 text-error-600 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold text-error-800 dark:text-error-200">
            {incident.title}
          </h3>
          <p className="text-sm text-error-600 dark:text-error-300">
            Started {incident.startTime.toLocaleTimeString()} • Duration: {duration}
          </p>
        </div>
        <Badge variant="error">
          {incident.status === 'active' ? 'Active' : incident.status}
        </Badge>
      </div>

      <CardContent>
        {/* Blast Radius */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">Routers</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {incident.affectedRouters}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">Users</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {incident.affectedUsers.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">Regions</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {incident.affectedRegions.length}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">VLANs</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {incident.affectedVlans.length}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Incident Timeline
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {incident.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-neutral-900 dark:text-white">{event.event}</p>
                  <p className="text-xs text-neutral-500">
                    {event.timestamp.toLocaleTimeString()}
                    {event.user && ` • ${event.user}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" leftIcon={<FileText className="w-4 h-4" />}>
          Generate Post-Mortem
        </Button>
        <Button variant="primary" onClick={onResolve}>
          Mark Resolved
        </Button>
      </CardFooter>
    </Card>
  );
};

// ============================================================================
// Correlation Event Display
// ============================================================================

const CorrelationEventDisplay = ({ correlation }: { correlation: CorrelationEvent }) => {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            Correlated Events
          </span>
        </div>
        <Badge variant="info" size="sm">
          {correlation.confidence}% confidence
        </Badge>
      </div>

      <div className="space-y-2">
        {correlation.events.map((event, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-600 dark:text-neutral-300">
              {event.description}
            </span>
            {event.router && (
              <Badge size="sm" variant="default">{event.router}</Badge>
            )}
          </div>
        ))}
      </div>

      {correlation.rootCause && (
        <div className="mt-3 p-2 bg-warning-50 dark:bg-warning-900/20 rounded border border-warning-200 dark:border-warning-800">
          <p className="text-xs font-medium text-warning-700 dark:text-warning-300">
            Root Cause: {correlation.rootCause}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Command Safety Layer
// ============================================================================

const CommandSafetyLayer = ({
  isOpen,
  onConfirm,
  onCancel,
  command,
  affectedCount,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  command: string;
  affectedCount: number;
}) => {
  const [typedValue, setTypedValue] = useState('');
  const canConfirm = typedValue.toLowerCase() === command.toLowerCase();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-error-200 dark:border-error-800 w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-error-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Confirm Dangerous Action
            </h3>
            <p className="text-sm text-neutral-500">
              This will affect {affectedCount} resources
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Command: {command}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type <code className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">{command}</code> to confirm
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Type "${command}" to confirm`}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-error-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Performance-Optimized Router Card
// ============================================================================

const OptimizedRouterCard = memo(({ 
  router, 
  density,
  onSelect 
}: { 
  router: Router; 
  density: 'compact' | 'normal' | 'comfortable';
  onSelect?: () => void;
}) => {
  const isCompact = density === 'compact';

  const cpuColor = router.cpu > 80 ? 'text-error-500' : router.cpu > 60 ? 'text-warning-500' : 'text-success-500';
  const trafficInUnit = router.trafficIn >= 1000 ? `${(router.trafficIn / 1000).toFixed(1)} Gbps` : `${router.trafficIn} Mbps`;

  return (
    <Card
      hover
      padding={isCompact ? 'sm' : 'md'}
      className={cn(
        'transition-all duration-200 cursor-pointer group',
        router.status === 'offline' && 'border-error-300 dark:border-error-700',
        router.status === 'degraded' && 'border-warning-300 dark:border-warning-700',
        !isCompact && 'hover:-translate-y-1 hover:shadow-lg'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusDot status={router.status} pulse={router.status === 'synchronizing'} />
          <div>
            <h3 className={cn(
              'font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors',
              isCompact && 'text-sm'
            )}>
              {router.name}
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              {router.ipAddress}
            </p>
          </div>
        </div>
        {!isCompact && (
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!isCompact ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-neutral-500">CPU</p>
              <div className="flex items-center gap-2">
                <span className={cn('text-lg font-bold', cpuColor)}>
                  {router.cpu}%
                </span>
                {router.cpu > 60 && (
                  <TrendingUp className={cn('w-4 h-4', cpuColor)} />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Memory</p>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {router.memory}%
              </span>
            </div>
          </div>
          
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Inbound</span>
              <span className="font-medium">{trafficInUnit}</span>
            </div>
          </div>

          <OperationalMemory router={router} />

          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-sm font-medium">{router.pppUsers}</span>
            </div>
            <RiskScoreBadge score={router.riskScore} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={cn(cpuColor, 'font-medium')}>{router.cpu}%</span>
            <span className="text-neutral-500">{router.pppUsers} users</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">{trafficInUnit}</span>
            <RiskScoreBadge score={router.riskScore} />
          </div>
        </>
      )}
    </Card>
  );
});
OptimizedRouterCard.displayName = 'OptimizedRouterCard';

// ============================================================================
// Executive Dashboard View
// ============================================================================

const ExecutiveDashboard = () => {
  const revenueData = [
    { month: 'Jan', revenue: 125000, growth: 8.2 },
    { month: 'Feb', revenue: 132000, growth: 5.6 },
    { month: 'Mar', revenue: 145000, growth: 9.8 },
    { month: 'Apr', revenue: 138000, growth: -4.8 },
    { month: 'May', revenue: 156000, growth: 13.0 },
    { month: 'Jun', revenue: 168000, growth: 7.7 },
  ];

  const slaData = [
    { metric: 'Network Uptime', value: 99.95, target: 99.9 },
    { metric: 'Ticket Resolution', value: 94, target: 90 },
    { metric: 'Billing Accuracy', value: 99.8, target: 99.5 },
    { metric: 'Customer Satisfaction', value: 4.2, target: 4.0 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '$168,000', change: '+7.7%', positive: true },
          { label: 'Active Customers', value: '12,450', change: '+5.2%', positive: true },
          { label: 'Avg Revenue/User', value: '$13.49', change: '+2.3%', positive: true },
          { label: 'Churn Rate', value: '1.2%', change: '-0.3%', positive: true },
        ].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="pt-5">
              <p className="text-sm text-neutral-500">{kpi.label}</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                {kpi.value}
              </p>
              <p className={cn(
                'text-sm font-medium mt-2',
                kpi.positive ? 'text-success-600' : 'text-error-600'
              )}>
                {kpi.change} vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader
            title="Revenue Trend"
            subtitle="Monthly recurring revenue (MRR)"
          />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v / 1000}K`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <CardHeader
            title="SLA Compliance"
            subtitle="Current period performance"
          />
          <CardContent>
            <div className="space-y-4">
              {slaData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {item.metric}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {item.value}{item.metric.includes('Satisfaction') ? '/5' : '%'}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        item.value >= item.target ? 'bg-success-500' : 'bg-warning-500'
                      )}
                      style={{ width: `${Math.min((item.value / (item.metric.includes('Satisfaction') ? 5 : 100)) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Target: {item.target}{item.metric.includes('Satisfaction') ? '/5' : '%'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Forecast */}
      <Card>
        <CardHeader
          title="Capacity Forecast"
          subtitle="90-day infrastructure projection"
          action={
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Bandwidth', current: 68, projected: '85%', timeline: '45 days' },
              { label: 'IP Addresses', current: 42, projected: '75%', timeline: '60 days' },
              { label: 'Storage', current: 55, projected: '90%', timeline: '30 days' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">{item.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {item.current}%
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Projected {item.projected} in {item.timeline}
                </p>
                <div className="mt-3 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${item.current}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// Main NOC Dashboard
// ============================================================================

export default function EnhancedNOCDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('comfortable');
  const [executiveMode, setExecutiveMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);

  // Mock data
  const routers = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: `r${i + 1}`,
      name: `RTR-${['HQ', 'BRANCH', 'DC', 'HOTSPOT', 'CLUSTER'][i % 5]}-${String(i + 1).padStart(2, '0')}`,
      ipAddress: `192.168.${Math.floor(i / 254)}.${(i % 254) + 1}`,
      status: i % 10 === 0 ? 'offline' : i % 10 === 1 ? 'degraded' : 'online',
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 70) + 20,
      trafficIn: Math.floor(Math.random() * 1000),
      trafficOut: Math.floor(Math.random() * 800),
      packetLoss: i % 10 === 1 ? Math.floor(Math.random() * 5) + 1 : 0,
      uplinkStatus: i % 10 === 0 ? 'down' : 'up',
      region: ['US-East', 'US-West', 'EU-Central', 'AP-Southeast'][i % 4],
      cluster: i % 3 === 0 ? `Cluster-${Math.floor(i / 3)}` : undefined,
      pppUsers: Math.floor(Math.random() * 500) + 50,
      riskScore: Math.floor(Math.random() * 100),
      uptime24h: 99 + Math.random(),
      incidents7d: Math.floor(Math.random() * 5),
      changes7d: Math.floor(Math.random() * 10),
    } as Router)), []);

  const activeIncident = useMemo(() => ({
    id: 'inc1',
    title: 'HQ Network Outage',
    severity: 'critical' as const,
    affectedRouters: 3,
    affectedUsers: 1250,
    affectedRegions: ['US-East', 'US-Central'],
    affectedVlans: ['VLAN-10', 'VLAN-20', 'VLAN-30'],
    affectedResellers: ['Reseller-A', 'Reseller-B'],
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active' as const,
    timeline: [
      { timestamp: new Date(Date.now() - 30 * 60 * 1000), event: 'Incident detected by monitoring system', user: 'System' },
      { timestamp: new Date(Date.now() - 28 * 60 * 1000), event: 'Alert escalated to NOC team', user: 'Automation' },
      { timestamp: new Date(Date.now() - 25 * 60 * 1000), event: 'Affected VLANs identified', user: 'admin@netflow' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000), event: 'Root cause: Core switch firmware issue', user: 'tech@netflow' },
      { timestamp: new Date(Date.now() - 10 * 60 * 1000), event: 'Rollback initiated', user: 'admin@netflow' },
    ],
  } as Incident), []);

  const correlation = useMemo(() => ({
    id: 'corr1',
    events: [
      { timestamp: new Date(Date.now() - 45 * 60 * 1000), type: 'cpu', description: 'CPU spike detected', router: 'RTR-HQ-01' },
      { timestamp: new Date(Date.now() - 40 * 60 * 1000), type: 'packet', description: 'Packet loss increased', router: 'RTR-HQ-01' },
      { timestamp: new Date(Date.now() - 35 * 60 * 1000), type: 'ppp', description: 'PPP disconnects surged', router: 'RTR-HQ-01' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'alert', description: 'Critical alert triggered' },
      { timestamp: new Date(Date.now() - 25 * 60 * 1000), type: 'action', description: 'Operator initiated restart' },
    ],
    rootCause: 'Hardware memory degradation',
    confidence: 94,
  } as CorrelationEvent), []);

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter routers
  const filteredRouters = useMemo(() => 
    routers.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ipAddress.includes(searchQuery)
    ), [routers, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    online: filteredRouters.filter(r => r.status === 'online').length,
    degraded: filteredRouters.filter(r => r.status === 'degraded').length,
    offline: filteredRouters.filter(r => r.status === 'offline').length,
    affectedUsers: filteredRouters.filter(r => r.status !== 'online').reduce((sum, r) => sum + r.pppUsers, 0),
  }), [filteredRouters]);

  if (executiveMode) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Executive Dashboard
                </h1>
                <p className="text-sm text-neutral-500">
                  Business intelligence and SLA metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ExecutiveModeToggle enabled={executiveMode} onToggle={setExecutiveMode} />
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Export Report
              </Button>
            </div>
          </div>
        </header>
        <main className="p-6">
          <ExecutiveDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Network Operations Center
                  </h1>
                  <p className="text-sm text-neutral-500">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search routers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <EnhancedSystemStatus />

              <ViewToggle
                value={viewMode}
                onChange={setViewMode}
              />
              <DataDensityToggle
                value={density}
                onChange={setDensity}
              />
              <ExecutiveModeToggle enabled={executiveMode} onToggle={setExecutiveMode} />

              <Button variant="primary" size="sm" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                {stats.offline} Alerts
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <StatusDot status="online" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                <strong className="font-semibold text-neutral-900 dark:text-white">{stats.online}</strong> Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="degraded" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                <strong className="font-semibold text-neutral-900 dark:text-white">{stats.degraded}</strong> Degraded
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="offline" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                <strong className="font-semibold text-neutral-900 dark:text-white">{stats.offline}</strong> Offline
              </span>
            </div>
            {stats.affectedUsers > 0 && (
              <>
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <div className="flex items-center gap-2 text-error-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {stats.affectedUsers.toLocaleString()} Affected
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Incident Panel */}
        <div className="mb-6">
          <IncidentLifecyclePanel 
            incident={activeIncident}
            onResolve={() => console.log('Resolve incident')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Router Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader
                title={`Routers (${filteredRouters.length})`}
                subtitle={`${stats.online} online, ${stats.offline} offline, ${stats.degraded} degraded`}
              />
              <CardContent>
                <div className={cn(
                  'grid gap-4',
                  viewMode === 'grid' 
                    ? density === 'comfortable' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-1'
                )}>
                  {filteredRouters.map(router => (
                    <OptimizedRouterCard
                      key={router.id}
                      router={router}
                      density={density}
                      onSelect={() => setSelectedRouter(router.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Correlation Events */}
            <CorrelationEventDisplay correlation={correlation} />

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Power className="w-4 h-4" />}>
                    Restart Selected Router
                  </Button>
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Layout className="w-4 h-4" />}>
                    Apply Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start" leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Send Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
