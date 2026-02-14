/**
 * Admin Dashboard - ISP Level Dashboard
 * Shows metrics for a single organization/ISP
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Wifi, 
  Router, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Clock,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
}

const StatCard = ({ title, value, change, changeLabel, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  };

  const iconBgClasses = {
    blue: 'bg-blue-500/20',
    emerald: 'bg-emerald-500/20',
    amber: 'bg-amber-500/20',
    red: 'bg-red-500/20',
    purple: 'bg-purple-500/20',
    cyan: 'bg-cyan-500/20',
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
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
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

// Traffic Chart Component
const TrafficChart = () => {
  const [data] = useState([
    { time: '00:00', download: 120, upload: 45 },
    { time: '04:00', download: 80, upload: 30 },
    { time: '08:00', download: 250, upload: 120 },
    { time: '12:00', download: 380, upload: 180 },
    { time: '16:00', download: 420, upload: 200 },
    { time: '20:00', download: 350, upload: 150 },
    { time: '24:00', download: 180, upload: 70 },
  ]);

  const maxValue = Math.max(...data.map(d => d.download + d.upload));

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Live Traffic</h3>
          <p className="text-sm text-slate-500">Bandwidth usage over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-400">Download</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-400">Upload</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 flex items-end gap-2">
        {data.map((item, index) => (
          <div key={item.time} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-1">
              <div
                className="w-full bg-blue-500/60 rounded-t transition-all duration-500"
                style={{ height: `${(item.download / maxValue) * 150}px` }}
              />
              <div
                className="w-full bg-emerald-500/60 rounded-b transition-all duration-500"
                style={{ height: `${(item.upload / maxValue) * 150}px` }}
              />
            </div>
            <span className="text-xs text-slate-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Router Health Component
const RouterHealth = () => {
  const routers = [
    { name: 'Core-Router-01', status: 'online', cpu: 45, memory: 62, uptime: '45d 12h' },
    { name: 'Edge-Router-02', status: 'online', cpu: 32, memory: 48, uptime: '30d 8h' },
    { name: 'Access-Router-03', status: 'warning', cpu: 78, memory: 85, uptime: '15d 4h' },
    { name: 'Backup-Router-04', status: 'offline', cpu: 0, memory: 0, uptime: '0d 0h' },
  ];

  const statusColors = {
    online: 'bg-emerald-500',
    warning: 'bg-amber-500',
    offline: 'bg-red-500',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Router Health</h3>
          <p className="text-sm text-slate-500">System resource monitoring</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
          {routers.filter(r => r.status === 'online').length}/{routers.length} Online
        </span>
      </div>

      <div className="space-y-4">
        {routers.map((router) => (
          <div key={router.name} className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColors[router.status as keyof typeof statusColors]}`} />
                <span className="text-white font-medium">{router.name}</span>
              </div>
              <span className="text-xs text-slate-500">Uptime: {router.uptime}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">CPU</span>
                  <span className="text-xs text-white">{router.cpu}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${router.cpu > 80 ? 'bg-red-500' : router.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${router.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Memory</span>
                  <span className="text-xs text-white">{router.memory}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${router.memory > 80 ? 'bg-red-500' : router.memory > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${router.memory}%` }}
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

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    { action: 'PPP User Created', user: 'john_doe', time: '2 min ago', type: 'create' },
    { action: 'Router Rebooted', user: 'Core-Router-01', time: '15 min ago', type: 'system' },
    { action: 'Profile Updated', user: 'premium_10mb', time: '1 hour ago', type: 'update' },
    { action: 'User Disconnected', user: 'jane_smith', time: '2 hours ago', type: 'disconnect' },
    { action: 'Invoice Generated', user: 'INV-2024-001', time: '3 hours ago', type: 'billing' },
  ];

  const typeColors = {
    create: 'text-emerald-400 bg-emerald-500/10',
    system: 'text-blue-400 bg-blue-500/10',
    update: 'text-amber-400 bg-amber-500/10',
    disconnect: 'text-red-400 bg-red-500/10',
    billing: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Recent Activity</h3>
          <p className="text-sm text-slate-500">Latest system events</p>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[activity.type as keyof typeof typeColors]}`}>
                {activity.action}
              </span>
              <span className="text-sm text-slate-300">{activity.user}</span>
            </div>
            <span className="text-xs text-slate-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// PPP Logins Component
const PPPLogins = () => {
  const logins = [
    { user: 'ahmad_khan', ip: '192.168.1.101', router: 'Core-Router-01', time: '10:45 AM' },
    { user: 'sara_ahmed', ip: '192.168.1.102', router: 'Edge-Router-02', time: '10:42 AM' },
    { user: 'mohammed_ali', ip: '192.168.1.103', router: 'Core-Router-01', time: '10:38 AM' },
    { user: 'fatima_zahra', ip: '192.168.1.104', router: 'Access-Router-03', time: '10:35 AM' },
    { user: 'omar_faruk', ip: '192.168.1.105', router: 'Edge-Router-02', time: '10:30 AM' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Recent PPP Logins</h3>
          <p className="text-sm text-slate-500">Last 10 user connections</p>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-800">
              <th className="pb-3 text-xs font-medium text-slate-400">User</th>
              <th className="pb-3 text-xs font-medium text-slate-400">IP Address</th>
              <th className="pb-3 text-xs font-medium text-slate-400">Router</th>
              <th className="pb-3 text-xs font-medium text-slate-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {logins.map((login, index) => (
              <tr key={index} className="border-b border-slate-800/50 last:border-0">
                <td className="py-3 text-sm text-white">{login.user}</td>
                <td className="py-3 text-sm text-slate-400 font-mono">{login.ip}</td>
                <td className="py-3 text-sm text-slate-400">{login.router}</td>
                <td className="py-3 text-sm text-slate-500">{login.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activePPP: 1089,
    offlineUsers: 158,
    revenue: 45680,
    onlineRouters: 8,
    alerts: 3,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Overview of your ISP operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Refresh</span>
          </button>
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12}
          changeLabel="vs last month"
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active PPP"
          value={stats.activePPP.toLocaleString()}
          change={8}
          changeLabel="online now"
          icon={<Wifi className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Offline Users"
          value={stats.offlineUsers}
          change={-5}
          changeLabel="vs yesterday"
          icon={<UserX className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change={15}
          changeLabel="this month"
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Online Routers"
          value={stats.onlineRouters}
          icon={<Router className="w-6 h-6" />}
          color="cyan"
        />
        <StatCard
          title="Alerts"
          value={stats.alerts}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart />
        <RouterHealth />
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <PPPLogins />
      </div>
    </div>
  );
}
