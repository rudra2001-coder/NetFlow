'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Server, Users, TrendingUp, TrendingDown,
  Wifi, Bell, AlertTriangle, Zap, ArrowUpRight,
  ArrowDownRight, RefreshCw, Layers, CheckCircle2, Clock,
  Gauge, Shield, CreditCard, FileText, WifiOff, Ticket
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts';

const dummyData = [
  { time: '10:00', traffic: 400, load: 240 },
  { time: '11:00', traffic: 300, load: 139 },
  { time: '12:00', traffic: 200, load: 980 },
  { time: '13:00', traffic: 278, load: 390 },
  { time: '14:00', traffic: 189, load: 480 },
  { time: '15:00', traffic: 239, load: 380 },
  { time: '16:00', traffic: 349, load: 430 },
];

const performanceData = [
  { time: '10:00', uptime: 99.8, availability: 99.7 },
  { time: '11:00', uptime: 99.9, availability: 99.8 },
  { time: '12:00', uptime: 99.5, availability: 99.4 },
  { time: '13:00', uptime: 99.8, availability: 99.7 },
  { time: '14:00', uptime: 99.9, availability: 99.9 },
  { time: '15:00', uptime: 100, availability: 99.9 },
  { time: '16:00', uptime: 99.8, availability: 99.8 },
];

export default function DashboardIndex() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(true);

  // Simulated live events
  const [events, setEvents] = useState([
    { id: 1, type: 'traffic', msg: 'Peak traffic detected on Core-01', time: 'Just now', severity: 'info' },
    { id: 2, type: 'auth', msg: 'New PPPoE session: user_492', time: '2m ago', severity: 'success' },
    { id: 3, type: 'alert', msg: 'BGP flapping on Uplink-A', time: '5m ago', severity: 'warning' },
  ]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      // Simulate real-time updates eventually
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Area - Enhanced */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Network Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Real-time performance metrics and system status</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className={isLive ? 'text-blue-500 border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20' : ''}
            onClick={() => setIsLive(!isLive)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLive ? 'animate-spin' : ''}`} />
            {isLive ? 'Live Monitoring' : 'Paused'}
          </Button>
          <Button size="sm" onClick={() => router.push('/dashboard/noc')}>
            <Layers className="w-4 h-4 mr-2" />
            Full NOC View
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar - Operator Workflow First */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Quick Actions</h3>
          <span className="text-xs text-neutral-500">Most used operator workflows</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => router.push('/accounting/payments/new')}>
            <CreditCard className="w-4 h-4 mr-1.5" />
            Record Payment
          </Button>
          <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => router.push('/ppp')}>
            <Users className="w-4 h-4 mr-1.5" />
            View Customers
          </Button>
          <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => router.push('/billing')}>
            <FileText className="w-4 h-4 mr-1.5" />
            Generate Bill
          </Button>
          <Button size="sm" variant="outline" className="border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => router.push('/routers')}>
            <WifiOff className="w-4 h-4 mr-1.5" />
            Manage Network
          </Button>
          <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => router.push('/support/tickets')}>
            <Ticket className="w-4 h-4 mr-1.5" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Quick Stats - Enhanced Design */}
      {/* Row 1: Customer Stats - Per UI Blueprint */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Customer-Focused Stats - Per UI Blueprint */}
        {[
          { label: 'Total Customers', value: '2,456', trend: '+124', up: true, icon: <Users className="w-4 h-4" />, color: 'blue', bgGradient: 'from-blue-500 to-blue-600' },
          { label: 'Active', value: '2,189', trend: '+89', up: true, icon: <CheckCircle2 className="w-4 h-4" />, color: 'green', bgGradient: 'from-green-500 to-emerald-600' },
          { label: 'Suspended', value: '156', trend: '-12', up: false, icon: <AlertTriangle className="w-4 h-4" />, color: 'red', bgGradient: 'from-red-500 to-orange-600' },
          { label: 'Online Now', value: '1,247', trend: '+156', up: true, icon: <Wifi className="w-4 h-4" />, color: 'cyan', bgGradient: 'from-cyan-500 to-blue-600' },
          { label: 'Total Due', value: '$12.4K', trend: '+8%', up: true, icon: <CreditCard className="w-4 h-4" />, color: 'orange', bgGradient: 'from-orange-500 to-amber-600' },
          { label: 'Today Collection', value: '$2,840', trend: '+15%', up: true, icon: <TrendingUp className="w-4 h-4" />, color: 'emerald', bgGradient: 'from-emerald-500 to-green-600' },
        ].map((stat, i) => (
          <Card 
            key={`customer-${i}`} 
            className={`overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-950`}
          >
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.bgGradient} text-white shadow-md`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                  stat.up === null
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    : stat.up 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stat.up === null ? stat.trend : stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Network Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Load', value: '42.8%', trend: '+2.4%', up: true, icon: <Gauge className="w-5 h-5" />, color: 'blue', delay: 'stagger-1', bgGradient: 'from-blue-500 to-blue-600' },
          { label: 'Active Routers', value: '24/25', trend: 'Stable', up: null, icon: <Server className="w-5 h-5" />, color: 'green', delay: 'stagger-2', bgGradient: 'from-green-500 to-emerald-600' },
          { label: 'Online Users', value: '1,247', trend: '+156', up: true, icon: <Users className="w-5 h-5" />, color: 'cyan', delay: 'stagger-3', bgGradient: 'from-cyan-500 to-blue-600' },
          { label: 'Active Alerts', value: '3', trend: '-2', up: false, icon: <AlertTriangle className="w-5 h-5" />, color: 'orange', delay: 'stagger-4', bgGradient: 'from-orange-500 to-red-600' },
        ].map((stat, i) => (
          <Card 
            key={i} 
            className={`stats-card overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-${stat.color}-500/10 animate-slideUp ${stat.delay} bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-950`}
          >
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} text-white shadow-lg shadow-${stat.color}-500/30`}>
                  {stat.icon}
                </div>
                {stat.up !== null && (
                  <div className={`flex items-center text-sm font-semibold px-3 py-1 rounded-lg ${
                    stat.up 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {stat.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Analysis Chart */}
        <Card className="lg:col-span-2 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-2">
          <CardHeader
            title="Traffic Analysis"
            subtitle="Upload/Download throughput over 6 hours"
            action={
              <div className="flex gap-2">
                <Badge className="bg-blue-500/20 text-blue-500 border border-blue-500/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            }
          />
          <CardBody className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="traffic"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTraffic)"
                />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={0.8}
                  fill="url(#colorLoad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Live Event Feed */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-3">
          <CardHeader 
            title="Live Events" 
            subtitle={`${events.length} recent activities`}
            action={<Clock className="w-4 h-4 text-neutral-400" />}
          />
          <CardBody className="p-0">
            <div className="space-y-2 px-6 py-4">
              {events.map((event, idx) => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-white/10">
                      {event.type === 'traffic' && <Activity className="w-4 h-4 text-blue-400" />}
                      {event.type === 'auth' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {event.type === 'alert' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate group-hover:text-blue-400 transition-colors">{event.msg}</p>
                      <p className="text-xs text-neutral-400 mt-1">{event.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gradient-to-r from-white/5 to-transparent border-t border-white/5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5" 
                onClick={() => router.push('/audit')}
              >
                View All Activity Logs →
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-3">
          <CardHeader 
            title="System Health" 
            subtitle="Core infrastructure status"
            action={<Shield className="w-4 h-4 text-green-400" />}
          />
          <CardBody className="space-y-4">
            {[
              { label: 'API Latency', value: '45ms', status: 'healthy', icon: '⚡' },
              { label: 'Database Connections', value: '127/200', status: 'healthy', icon: '🗄️' },
              { label: 'Cache Hit Rate', value: '94.2%', status: 'healthy', icon: '💾' },
              { label: 'Worker Queue', value: '12 tasks', status: 'warning', icon: '⚙️' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.label}</p>
                    <p className={`text-xs ${item.status === 'healthy' ? 'text-green-400' : 'text-orange-400'}`}>
                      {item.status === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Performance Trends */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-4">
          <CardHeader 
            title="Performance Trends" 
            subtitle="Uptime & availability metrics"
            action={<TrendingUp className="w-4 h-4 text-blue-400" />}
          />
          <CardBody className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 0, left: -40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[98, 100]} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="uptime"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  name="Uptime %"
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Availability %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp stagger-5">
        {[
          { title: 'Enhanced NOC', desc: 'Full-screen monitoring', icon: <Server className="w-5 h-5" />, path: '/dashboard/enhanced-noc', bgGradient: 'from-blue-500 to-cyan-600' },
          { title: 'Command Center', desc: 'Remote execution & control', icon: <Zap className="w-5 h-5" />, path: '/dashboard/command-center', bgGradient: 'from-purple-500 to-pink-600' },
          { title: 'Analytics', desc: 'Performance reports', icon: <TrendingUp className="w-5 h-5" />, path: '/dashboard/analytics', bgGradient: 'from-green-500 to-emerald-600' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.path)}
            className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 p-4 text-left hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-400 transition-colors">{item.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${item.bgGradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
