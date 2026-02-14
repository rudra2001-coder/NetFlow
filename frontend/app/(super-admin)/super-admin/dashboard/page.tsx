/**
 * Super Admin Dashboard - SaaS Owner Dashboard
 * Shows global metrics across all ISPs/tenants
 * Dark + Red accent theme
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, 
  Router, 
  Users, 
  DollarSign, 
  Cpu, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';

// Stat Card Component for Super Admin
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'red' | 'orange' | 'amber' | 'emerald' | 'blue' | 'purple';
}

const StatCard = ({ title, value, change, changeLabel, icon, color }: StatCardProps) => {
  const colorClasses = {
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };

  const iconBgClasses = {
    red: 'bg-red-500/20',
    orange: 'bg-orange-500/20',
    amber: 'bg-amber-500/20',
    emerald: 'bg-emerald-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-slate-500 ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ISP List Component
const ISPList = () => {
  const isps = [
    { name: 'FastNet ISP', status: 'active', routers: 12, users: 1240, plan: 'Enterprise', revenue: 4500 },
    { name: 'CityConnect', status: 'active', routers: 8, users: 890, plan: 'Professional', revenue: 2800 },
    { name: 'RuralLink', status: 'active', routers: 5, users: 450, plan: 'Basic', revenue: 1200 },
    { name: 'MetroNet', status: 'suspended', routers: 3, users: 0, plan: 'Basic', revenue: 0 },
    { name: 'SkyBroadband', status: 'active', routers: 15, users: 2100, plan: 'Enterprise', revenue: 6200 },
  ];

  const statusColors = {
    active: 'bg-emerald-500',
    suspended: 'bg-red-500',
    pending: 'bg-amber-500',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">ISP Management</h3>
          <p className="text-sm text-slate-500">All registered ISPs</p>
        </div>
        <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {isps.map((isp, index) => (
          <div key={index} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColors[isp.status as keyof typeof statusColors]}`} />
                <div>
                  <p className="text-white font-medium">{isp.name}</p>
                  <p className="text-xs text-slate-500">{isp.plan} Plan</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-white">{isp.routers} routers</p>
                  <p className="text-xs text-slate-500">{isp.users.toLocaleString()} users</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-400 font-medium">${isp.revenue.toLocaleString()}/mo</p>
                </div>
                <button className="p-1 text-slate-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Global Traffic Chart
const GlobalTrafficChart = () => {
  const [data] = useState([
    { time: 'Mon', traffic: 1200, isps: 45 },
    { time: 'Tue', traffic: 1800, isps: 46 },
    { time: 'Wed', traffic: 2100, isps: 46 },
    { time: 'Thu', traffic: 2400, isps: 47 },
    { time: 'Fri', traffic: 2200, isps: 47 },
    { time: 'Sat', traffic: 1600, isps: 47 },
    { time: 'Sun', traffic: 1400, isps: 47 },
  ]);

  const maxTraffic = Math.max(...data.map(d => d.traffic));

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Global Traffic Overview</h3>
          <p className="text-sm text-slate-500">Total bandwidth across all ISPs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-400">Traffic (TB)</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 flex items-end gap-4">
        {data.map((item, index) => (
          <div key={item.time} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-1">
              <div
                className="w-full bg-gradient-to-t from-red-500/80 to-orange-500/60 rounded-t transition-all duration-500"
                style={{ height: `${(item.traffic / maxTraffic) * 160}px` }}
              />
            </div>
            <span className="text-xs text-slate-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// System Resources Component
const SystemResources = () => {
  const resources = [
    { name: 'API Server', cpu: 45, memory: 62, status: 'healthy' },
    { name: 'Database Cluster', cpu: 32, memory: 78, status: 'healthy' },
    { name: 'Redis Cache', cpu: 15, memory: 45, status: 'healthy' },
    { name: 'Worker Nodes', cpu: 68, memory: 55, status: 'warning' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">System Resources</h3>
          <p className="text-sm text-slate-500">Infrastructure health</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Healthy</span>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.name} className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <span className="text-white font-medium">{resource.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                resource.status === 'healthy' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {resource.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">CPU</span>
                  <span className="text-xs text-white">{resource.cpu}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      resource.cpu > 80 ? 'bg-red-500' : resource.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${resource.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Memory</span>
                  <span className="text-xs text-white">{resource.memory}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      resource.memory > 80 ? 'bg-red-500' : resource.memory > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${resource.memory}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent System Events
const RecentSystemEvents = () => {
  const events = [
    { type: 'isp_created', message: 'New ISP registered: FastNet ISP', time: '5 min ago', severity: 'info' },
    { type: 'payment', message: 'Payment received: CityConnect $2,800', time: '15 min ago', severity: 'success' },
    { type: 'alert', message: 'High CPU on Worker Node 3', time: '1 hour ago', severity: 'warning' },
    { type: 'suspension', message: 'ISP suspended: MetroNet (payment overdue)', time: '2 hours ago', severity: 'error' },
    { type: 'backup', message: 'Database backup completed', time: '3 hours ago', severity: 'info' },
  ];

  const severityColors = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const severityIcons = {
    info: Globe,
    success: DollarSign,
    warning: AlertTriangle,
    error: AlertTriangle,
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">System Events</h3>
          <p className="text-sm text-slate-500">Recent platform activity</p>
        </div>
        <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
          View Audit Logs
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => {
          const Icon = severityIcons[event.severity as keyof typeof severityIcons];
          return (
            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColors[event.severity as keyof typeof severityColors]}`}>
              <Icon className="w-4 h-4 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-white">{event.message}</p>
                <p className="text-xs text-slate-500 mt-1">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Revenue Overview
const RevenueOverview = () => {
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 58000 },
    { month: 'Jun', revenue: 72000 },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Monthly recurring revenue</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">$72,000</p>
          <p className="text-xs text-emerald-400">+12% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {monthlyRevenue.map((item) => (
          <div key={item.month} className="text-center">
            <div 
              className="h-20 bg-gradient-to-t from-purple-500/60 to-purple-500/20 rounded-lg mb-2 flex items-end justify-center pb-2"
              style={{ height: `${(item.revenue / 72000) * 80}px` }}
            >
              <span className="text-xs text-white font-medium">${(item.revenue / 1000).toFixed(0)}k</span>
            </div>
            <span className="text-xs text-slate-500">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Super Admin Dashboard Component
export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalIsps: 47,
    totalRouters: 234,
    totalActivePPP: 15678,
    systemCpu: 34,
    monthlyRevenue: 72000,
    suspendedAccounts: 3,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Global Dashboard
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
              Super Admin
            </span>
          </h1>
          <p className="text-slate-400">System-wide overview across all tenants</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total ISPs"
          value={stats.totalIsps}
          change={8}
          changeLabel="this month"
          icon={<Building2 className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Total Routers"
          value={stats.totalRouters}
          change={12}
          changeLabel="global"
          icon={<Router className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Active PPP"
          value={stats.totalActivePPP.toLocaleString()}
          change={15}
          changeLabel="all tenants"
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="System CPU"
          value={`${stats.systemCpu}%`}
          icon={<Cpu className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(0)}k`}
          change={12}
          changeLabel="MRR"
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Suspended"
          value={stats.suspendedAccounts}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlobalTrafficChart />
        <RevenueOverview />
      </div>

      {/* Management Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ISPList />
        <SystemResources />
      </div>

      {/* Events Row */}
      <RecentSystemEvents />
    </div>
  );
}
