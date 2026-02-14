'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusDot } from '@/components/ui/Badge';
import {
  Activity,
  Server,
  Users,
  AlertTriangle,
  Zap,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

// Mock data for the dashboard
const routerStats = {
  total: 156,
  online: 142,
  degraded: 8,
  offline: 6,
};

const pppStats = {
  total: 12450,
  active: 8934,
  trend: '+5.2%',
};

const trafficData = [
  { time: '00:00', inbound: 240, outbound: 180 },
  { time: '04:00', inbound: 180, outbound: 120 },
  { time: '08:00', inbound: 450, outbound: 320 },
  { time: '12:00', inbound: 680, outbound: 520 },
  { time: '16:00', inbound: 820, outbound: 640 },
  { time: '20:00', inbound: 650, outbound: 480 },
  { time: '23:59', inbound: 380, outbound: 280 },
];

const alertSummary = {
  critical: 3,
  warning: 12,
  info: 28,
};

const recentAlerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'Router Offline',
    router: 'RTR-HQ-01',
    time: '2 min ago',
    acknowledged: false,
  },
  {
    id: 2,
    severity: 'warning',
    title: 'High CPU Usage',
    router: 'RTR-BRANCH-15',
    time: '15 min ago',
    acknowledged: true,
  },
  {
    id: 3,
    severity: 'critical',
    title: 'Bandwidth Threshold Exceeded',
    router: 'RTR-DC-03',
    time: '32 min ago',
    acknowledged: false,
  },
  {
    id: 4,
    severity: 'info',
    title: 'Configuration Synced',
    router: 'RTR-HOTSPOT-08',
    time: '1 hour ago',
    acknowledged: true,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'config',
    action: 'Template Applied',
    target: 'Firewall Rules v2.1',
    user: 'admin@netflow',
    time: '5 min ago',
  },
  {
    id: 2,
    type: 'ppp',
    action: 'User Suspended',
    target: 'user-3421@example.com',
    user: 'system',
    time: '12 min ago',
  },
  {
    id: 3,
    type: 'router',
    action: 'Firmware Updated',
    target: 'RTR-BRANCH-22',
    user: 'tech@netflow',
    time: '28 min ago',
  },
  {
    id: 4,
    type: 'automation',
    action: 'Auto-Renewal Executed',
    target: '15 PPP Accounts',
    user: 'scheduler',
    time: '1 hour ago',
  },
];

const routerStatusData = [
  { name: 'Online', value: routerStats.online, color: '#22c55e' },
  { name: 'Degraded', value: routerStats.degraded, color: '#eab308' },
  { name: 'Offline', value: routerStats.offline, color: '#ef4444' },
];

const automationStatus = [
  { name: 'Running', count: 3, status: 'success' },
  { name: 'Scheduled', count: 8, status: 'info' },
  { name: 'Failed', count: 1, status: 'error' },
];

export default function CommandCenterPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
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
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Real-time infrastructure monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Context Switcher */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Global</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 rotate-90" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  Acme ISP
                </span>
              </div>

              {/* Time Display */}
              <div className="text-right">
                <div className="text-lg font-mono font-semibold text-neutral-900 dark:text-white">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(currentTime)}
                </div>
              </div>

              {/* Actions */}
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Router Count */}
          <Card hover>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Total Routers
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    {routerStats.total}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="online" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {routerStats.online}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="degraded" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {routerStats.degraded}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="offline" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {routerStats.offline}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <Server className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 pb-5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                View all routers
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* PPP Sessions */}
          <Card hover>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Active PPP Sessions
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    {pppStats.active.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <TrendingUp className="w-4 h-4 text-success-500" />
                    <span className="text-sm text-success-600 dark:text-success-400 font-medium">
                      {pppStats.trend}
                    </span>
                    <span className="text-sm text-neutral-500">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                  <Users className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 pb-5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Manage PPP users
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Traffic Overview */}
          <Card hover>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Current Traffic
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    1.24 Gbps
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        820 Mbps
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4 text-accent-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        640 Mbps
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-xl">
                  <Zap className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 pb-5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                View analytics
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Alert Summary */}
          <Card hover className="border-l-4 border-l-warning-500">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Active Alerts
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    {alertSummary.critical + alertSummary.warning}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="error" size="sm">
                      {alertSummary.critical} Critical
                    </Badge>
                    <Badge variant="warning" size="sm">
                      {alertSummary.warning} Warning
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 pb-5 pt-0">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                View all alerts
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Traffic Chart */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Traffic Overview"
              subtitle="24-hour inbound/outbound traffic"
              action={
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <select className="text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 border-0">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                </div>
              }
            />
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v} Mbps`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="inbound"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#inboundGradient)"
                      name="Inbound"
                    />
                    <Area
                      type="monotone"
                      dataKey="outbound"
                      stroke="#d946ef"
                      strokeWidth={2}
                      fill="url(#outboundGradient)"
                      name="Outbound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Router Status Pie Chart */}
          <Card>
            <CardHeader
              title="Router Health"
              subtitle="Status distribution"
            />
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={routerStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {routerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {routerStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <Card>
            <CardHeader
              title="Recent Alerts"
              subtitle="Latest system notifications"
              action={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-colors',
                      alert.acknowledged
                        ? 'bg-neutral-50 dark:bg-neutral-900/50'
                        : 'bg-neutral-100 dark:bg-neutral-800'
                    )}
                  >
                    <div className="mt-0.5">
                      {alert.severity === 'critical' ? (
                        <XCircle className="w-5 h-5 text-error-500" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-warning-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-info-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                          {alert.title}
                        </p>
                        <span className="text-xs text-neutral-500">{alert.time}</span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {alert.router}
                      </p>
                      {!alert.acknowledged && (
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle="System operations timeline"
              action={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="relative pl-6">
                    {/* Timeline connector */}
                    {index < recentActivity.length - 1 && (
                      <div className="absolute left-[5px] top-6 w-0.5 h-full bg-neutral-200 dark:bg-neutral-700" />
                    )}
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white dark:border-neutral-900" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {activity.target}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">{activity.user}</span>
                        <span className="text-xs text-neutral-300">•</span>
                        <span className="text-xs text-neutral-400">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Status */}
        <div className="mt-6">
          <Card>
            <CardHeader
              title="Automation Status"
              subtitle="Active scheduled tasks and workflows"
            />
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {automationStatus.map((item) => (
                  <div
                    key={item.name}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg border',
                      item.status === 'success' && 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
                      item.status === 'info' && 'bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800',
                      item.status === 'error' && 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        item.status === 'success' && 'bg-success-500',
                        item.status === 'info' && 'bg-info-500',
                        item.status === 'error' && 'bg-error-500'
                      )}
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {item.count}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Manage Automations
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
