'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, Server, Users, TrendingUp, TrendingDown,
  Wifi, Bell, AlertTriangle, Zap, ArrowUpRight,
  ArrowDownRight, RefreshCw, Layers
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
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

export default function DashboardIndex() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(true);

  // Simulated live events
  const [events, setEvents] = useState([
    { id: 1, type: 'traffic', msg: 'Peak traffic detected on Core-01', time: 'Just now' },
    { id: 2, type: 'auth', msg: 'New PPPoE session: user_492', time: '2m ago' },
    { id: 3, type: 'alert', msg: 'BGP flapping on Uplink-A', time: '5m ago' },
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
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Network Overview</h1>
          <p className="text-sm text-neutral-500">Real-time performance metrics and system status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={isLive ? 'text-primary-500 border-primary-500/50' : ''}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Load', value: '42.8%', trend: '+2.4%', up: true, icon: <Activity />, color: 'primary', delay: 'stagger-1' },
          { label: 'Active Routers', value: '24/25', trend: 'Stable', up: null, icon: <Server />, color: 'success', delay: 'stagger-2' },
          { label: 'Online Users', value: '1,247', trend: '+156', up: true, icon: <Users />, color: 'info', delay: 'stagger-3' },
          { label: 'Active Alerts', value: '3', trend: '-2', up: false, icon: <Bell />, color: 'warning', delay: 'stagger-4' },
        ].map((stat, i) => (
          <Card key={i} className={`stats-card glass overflow-hidden animate-slideUp ${stat.delay}`}>
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                {stat.up !== null && (
                  <div className={`flex items-center text-xs font-medium ${stat.up ? 'text-success-600' : 'text-error-600'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500 w-full opacity-30`} />
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 glass animate-slideUp stagger-2">
          <CardHeader
            title="Traffic Analysis"
            subtitle="Combined upload/download throughput across all interfaces"
            action={
              <div className="flex gap-2">
                <Badge variant="info" className="animate-pulse">Real-time</Badge>
              </div>
            }
          />
          <CardBody className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="traffic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTraffic)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Live Feed */}
        <Card className="glass animate-slideUp stagger-3">
          <CardHeader title="Live Event Feed" subtitle="Latest system & network activity" />
          <CardBody className="p-0">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {event.type === 'traffic' && <Activity className="w-4 h-4 text-primary-500" />}
                      {event.type === 'auth' && <Users className="w-4 h-4 text-success-500" />}
                      {event.type === 'alert' && <AlertTriangle className="w-4 h-4 text-warning-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{event.msg}</p>
                      <p className="text-xs text-neutral-500">{event.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/audit')}>
                View Activity Logs
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp stagger-4">
        {[
          { title: 'Enhanced NOC', desc: 'Full-screen monitoring', icon: <Activity />, path: '/dashboard/enhanced-noc' },
          { title: 'Command Center', desc: 'Remote execution', icon: <Zap />, path: '/dashboard/command-center' },
          { title: 'Analytics', desc: 'Performance reports', icon: <TrendingUp />, path: '/dashboard/analytics' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.path)}
            className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-left group"
          >
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
