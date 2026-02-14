'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusDot } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Activity,
  Server,
  Users,
  AlertTriangle,
  Zap,
  RefreshCw,
  Settings,
  Bell,
  ChevronRight,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Search,
  Command,
  Eye,
  MoreVertical,
  Power,
  MessageSquare,
  History,
  Layout,
  Minus,
  Plus,
  Grid3X3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Types
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
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  routerId: string;
  routerName: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  affectedRouters: number;
  affectedUsers: number;
  startTime: Date;
  status: 'active' | 'investigating' | 'resolved';
}

// Mock Data
const mockRouters: Router[] = Array.from({ length: 50 }, (_, i) => ({
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
}));

const mockAlerts: Alert[] = [
  { id: 'a1', severity: 'critical', title: 'Router Offline', routerId: 'r1', routerName: 'RTR-HQ-01', timestamp: new Date(Date.now() - 2 * 60 * 1000), acknowledged: false },
  { id: 'a2', severity: 'critical', title: 'High CPU Usage', routerId: 'r2', routerName: 'RTR-BRANCH-15', timestamp: new Date(Date.now() - 15 * 60 * 1000), acknowledged: true },
  { id: 'a3', severity: 'warning', title: 'Packet Loss Detected', routerId: 'r3', routerName: 'RTR-DC-03', timestamp: new Date(Date.now() - 32 * 60 * 1000), acknowledged: false },
  { id: 'a4', severity: 'warning', title: 'Memory Usage High', routerId: 'r4', routerName: 'RTR-HOTSPOT-08', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), acknowledged: false },
  { id: 'a5', severity: 'info', title: 'Configuration Synced', routerId: 'r5', routerName: 'RTR-CLUSTER-01', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), acknowledged: true },
];

// Components
function IncidentBanner({ 
  incidents, 
  onDismiss 
}: { 
  incidents: Incident[]; 
  onDismiss: () => void 
}) {
  const activeIncident = incidents.find(i => i.status === 'active');
  
  if (!activeIncident) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-error-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">INCIDENT ACTIVE</span>
            </div>
            <span className="text-error-100">|</span>
            <span>{activeIncident.title}</span>
            <Badge variant="error" size="sm">
              {activeIncident.affectedRouters} routers
            </Badge>
            <Badge variant="warning" size="sm">
              {activeIncident.affectedUsers.toLocaleString()} users affected
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-error-700"
              onClick={() => {/* Open incident panel */}}
            >
              View Details
            </Button>
            <button 
              onClick={onDismiss}
              className="p-1 hover:bg-error-700 rounded transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataDensityToggle({ 
  value, 
  onChange 
}: { 
  value: 'comfortable' | 'compact'; 
  onChange: (v: 'comfortable' | 'compact') => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <button
        onClick={() => onChange('comfortable')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          value === 'comfortable'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        )}
      >
        <Minus className="w-3 h-3" />
        <span className="hidden sm:inline">Comfortable</span>
      </button>
      <button
        onClick={() => onChange('compact')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          value === 'compact'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        )}
      >
        <Plus className="w-3 h-3" />
        <span className="hidden sm:inline">Compact</span>
      </button>
    </div>
  );
}

function ViewToggle({ 
  value, 
  onChange 
}: { 
  value: 'list' | 'grid'; 
  onChange: (v: 'list' | 'grid') => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <button
        onClick={() => onChange('list')}
        className={cn(
          'p-1.5 rounded-md transition-all',
          value === 'list'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        )}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'p-1.5 rounded-md transition-all',
          value === 'grid'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
        )}
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
    </div>
  );
}

function RouterCard({ 
  router, 
  density 
}: { 
  router: Router; 
  density: 'comfortable' | 'compact';
}) {
  const cpuColor = router.cpu > 80 ? 'text-error-500' : router.cpu > 60 ? 'text-warning-500' : 'text-success-500';
  const trafficInUnit = router.trafficIn >= 1000 ? `${(router.trafficIn / 1000).toFixed(1)} Gbps` : `${router.trafficIn} Mbps`;
  const trafficOutUnit = router.trafficOut >= 1000 ? `${(router.trafficOut / 1000).toFixed(1)} Gbps` : `${router.trafficOut} Mbps`;

  return (
    <Card 
      hover 
      padding={density === 'compact' ? 'sm' : 'md'}
      className={cn(
        'transition-all duration-200',
        router.status === 'offline' && 'border-error-300 dark:border-error-700',
        router.status === 'degraded' && 'border-warning-300 dark:border-warning-700',
        density === 'compact' && 'p-3'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusDot status={router.status} pulse={router.status === 'synchronizing'} />
          <div>
            <h3 className={cn(
              'font-semibold text-neutral-900 dark:text-white',
              density === 'compact' && 'text-sm'
            )}>
              {router.name}
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              {router.ipAddress}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {density === 'comfortable' ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-neutral-500">CPU</p>
              <div className="flex items-center gap-2">
                <span className={cn('text-lg font-bold', cpuColor)}>
                  {router.cpu}%
                </span>
                {router.cpu > 60 && (
                  router.cpu > 80 ? <TrendingUp className="w-4 h-4 text-error-500" /> : <TrendingUp className="w-4 h-4 text-warning-500" />
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Outbound</span>
              <span className="font-medium">{trafficOutUnit}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-sm font-medium">{router.pppUsers}</span>
            </div>
            <Badge 
              size="sm" 
              variant={router.uplinkStatus === 'up' ? 'success' : 'error'}
            >
              {router.uplinkStatus.toUpperCase()}
            </Badge>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={cn(cpuColor, 'font-medium')}>{router.cpu}% CPU</span>
            <span className="text-neutral-500">{router.pppUsers} users</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">↑ {trafficInUnit}</span>
            <span className="text-neutral-500">↓ {trafficOutUnit}</span>
          </div>
        </>
      )}
    </Card>
  );
}

function SystemStatusIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'incident'>('operational');
  const [subsystems, setSubsystems] = useState([
    { name: 'API', status: 'healthy' },
    { name: 'Database', status: 'healthy' },
    { name: 'WebSocket', status: 'healthy' },
    { name: 'Workers', status: 'healthy' },
    { name: 'Redis', status: 'healthy' },
  ]);

  const statusColors = {
    operational: 'bg-success-500',
    degraded: 'bg-warning-500',
    incident: 'bg-error-500',
  };

  const statusLabels = {
    operational: 'System Operational',
    degraded: 'System Degraded',
    incident: 'Incident Active',
  };

  return (
    <div className={cn('relative', className)}>
      <button
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
      >
        <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
        <span className="text-xs text-neutral-500 hidden lg:inline">
          {statusLabels[status]}
        </span>
      </button>

      {/* Dropdown Panel */}
      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-4 hidden group-hover:block z-50">
        <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
          System Health
        </h4>
        <div className="space-y-2">
          {subsystems.map(sub => (
            <div key={sub.name} className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                {sub.name}
              </span>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  sub.status === 'healthy' ? 'bg-success-500' : 'bg-warning-500'
                )} />
                <span className="text-xs text-neutral-500 capitalize">
                  {sub.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NeedsAttentionPanel({ 
  items, 
  onDismiss 
}: { 
  items: { type: string; count: number; severity: 'high' | 'medium' | 'low' }[];
  onDismiss: (type: string) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Needs Attention"
        subtitle="Items requiring action"
        action={
          <Button variant="ghost" size="sm">
            View All
          </Button>
        }
      />
      <CardContent>
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.type}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                'bg-neutral-50 dark:bg-neutral-800/50',
                item.severity === 'high' && 'border-l-4 border-l-error-500',
                item.severity === 'medium' && 'border-l-4 border-l-warning-500',
                item.severity === 'low' && 'border-l-4 border-l-info-500'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  item.severity === 'high' && 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
                  item.severity === 'medium' && 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
                  item.severity === 'low' && 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400'
                )}>
                  {item.type.includes('Router') ? (
                    <Server className="w-4 h-4" />
                  ) : item.type.includes('User') ? (
                    <Users className="w-4 h-4" />
                  ) : item.type.includes('Alert') ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {item.type}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.count} items
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDismiss(item.type)}>
                Dismiss
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Historical Pattern Sparkline
function StatusSparkline({ 
  data, 
  status 
}: { 
  data: number[]; 
  status: 'online' | 'offline' | 'degraded';
}) {
  const color = status === 'online' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#eab308';
  
  return (
    <svg className="w-16 h-6" viewBox="0 0 64 24">
      <path
        d={`M0,${24 - data[0] * 24 / 100} ${data.map((v, i) => 
          `L${(i + 1) * (64 / (data.length - 1))},${24 - v * 24 / 100}`
        ).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NOCDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouters, setSelectedRouters] = useState<string[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'inc1',
      title: 'HQ Network Outage',
      severity: 'critical',
      affectedRouters: 3,
      affectedUsers: 1250,
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active',
    },
  ]);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [routers] = useState<Router[]>(mockRouters);

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter routers
  const filteredRouters = useMemo(() => {
    return routers.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ipAddress.includes(searchQuery) ||
      r.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routers, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const online = filteredRouters.filter(r => r.status === 'online').length;
    const degraded = filteredRouters.filter(r => r.status === 'degraded').length;
    const offline = filteredRouters.filter(r => r.status === 'offline').length;
    const totalUsers = filteredRouters.reduce((sum, r) => sum + r.pppUsers, 0);
    const affectedUsers = filteredRouters
      .filter(r => r.status !== 'online')
      .reduce((sum, r) => sum + r.pppUsers, 0);

    return { online, degraded, offline, totalUsers, affectedUsers };
  }, [filteredRouters]);

  // Incidents
  const criticalAlertCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <div className={cn(
      'min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-all',
      incidents.length > 0 && incidents[0].status === 'active' && 'pt-10'
    )}>
      {/* Incident Banner */}
      <IncidentBanner 
        incidents={incidents} 
        onDismiss={() => setIncidents([])}
      />

      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
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
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search routers, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-neutral-400 bg-neutral-200 dark:bg-neutral-700 rounded">
                  ⌘K
                </kbd>
              </div>

              {/* System Status */}
              <SystemStatusIndicator />

              {/* View Controls */}
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <DataDensityToggle value={density} onChange={setDensity} />

              {/* Actions */}
              <Button variant="outline" size="sm" leftIcon={<Command className="w-4 h-4" />}>
                Console
              </Button>
              <Button variant="primary" size="sm" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                {criticalAlertCount > 0 ? `${criticalAlertCount} Alerts` : 'All Clear'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
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
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                <strong className="font-semibold text-neutral-900 dark:text-white">{stats.totalUsers.toLocaleString()}</strong> Active Users
              </span>
            </div>
            {stats.affectedUsers > 0 && (
              <>
                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                <div className="flex items-center gap-2 text-error-600">
                  <AlertTriangle className="w-4 h-4" />
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Alerts Panel */}
            <Card>
              <CardHeader
                title="Active Alerts"
                subtitle="Prioritized by severity"
                action={
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                }
              />
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg transition-colors',
                        alert.acknowledged
                          ? 'bg-neutral-50 dark:bg-neutral-800/50'
                          : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                      )}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        alert.severity === 'critical' && 'bg-error-500',
                        alert.severity === 'warning' && 'bg-warning-500',
                        alert.severity === 'info' && 'bg-info-500'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {alert.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {alert.routerName} • {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                        </p>
                      </div>
                      {!alert.acknowledged ? (
                        <Button variant="ghost" size="sm">
                          Acknowledge
                        </Button>
                      ) : (
                        <Badge variant="success" size="sm">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Router Grid/List */}
            <Card>
              <CardHeader
                title={`Routers (${filteredRouters.length})`}
                subtitle={`${stats.online} online, ${stats.offline} offline, ${stats.degraded} degraded`}
                action={
                  <div className="flex items-center gap-2">
                    <select className="text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 border-0">
                      <option>All Regions</option>
                      <option>US-East</option>
                      <option>US-West</option>
                      <option>EU-Central</option>
                      <option>AP-Southeast</option>
                    </select>
                    <select className="text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 border-0">
                      <option>All Status</option>
                      <option>Online</option>
                      <option>Degraded</option>
                      <option>Offline</option>
                    </select>
                  </div>
                }
              />
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className={cn(
                    'grid gap-4',
                    density === 'comfortable' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  )}>
                    {filteredRouters.map(router => (
                      <RouterCard key={router.id} router={router} density={density} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredRouters.map(router => (
                      <div
                        key={router.id}
                        className={cn(
                          'flex items-center gap-4 p-3 rounded-lg transition-colors',
                          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                          router.status === 'offline' && 'bg-error-50 dark:bg-error-900/20',
                          router.status === 'degraded' && 'bg-warning-50 dark:bg-warning-900/20'
                        )}
                      >
                        <StatusDot status={router.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white truncate">
                              {router.name}
                            </span>
                            {router.cluster && (
                              <Badge size="sm" variant="default">
                                {router.cluster}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 font-mono">
                            {router.ipAddress} • {router.region}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">CPU</p>
                            <p className={cn(
                              'font-medium',
                              router.cpu > 80 ? 'text-error-500' : router.cpu > 60 ? 'text-warning-500' : 'text-success-500'
                            )}>
                              {router.cpu}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">Traffic</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {router.trafficIn >= 1000 ? `${(router.trafficIn / 1000).toFixed(1)}G` : `${router.trafficIn}M`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">Users</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {router.pppUsers}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Needs Attention */}
            <NeedsAttentionPanel
              items={[
                { type: 'Offline Routers', count: stats.offline, severity: 'high' },
                { type: 'Degraded Routers', count: stats.degraded, severity: 'medium' },
                { type: 'Expiring Users (7d)', count: 45, severity: 'medium' },
                { type: 'Failed Automations', count: 3, severity: 'low' },
                { type: 'Critical Alerts', count: criticalAlertCount, severity: 'high' },
              ]}
              onDismiss={(type) => console.log('Dismissed:', type)}
            />

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
                  <Button variant="outline" className="w-full justify-start" leftIcon={<History className="w-4 h-4" />}>
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader
                title="Recent Activity"
                action={
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                }
              />
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Template Applied', target: 'Firewall Rules v2.1', time: '5 min ago', type: 'success' },
                    { action: 'Router Restarted', target: 'RTR-BRANCH-22', time: '12 min ago', type: 'info' },
                    { action: 'User Suspended', target: 'user-3421', time: '28 min ago', type: 'warning' },
                    { action: 'Alert Acknowledged', target: 'RTR-HQ-01', time: '1 hour ago', type: 'default' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5',
                        item.type === 'success' && 'bg-success-500',
                        item.type === 'warning' && 'bg-warning-500',
                        item.type === 'info' && 'bg-info-500',
                        item.type === 'default' && 'bg-neutral-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 dark:text-white">
                          {item.action}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {item.target}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
