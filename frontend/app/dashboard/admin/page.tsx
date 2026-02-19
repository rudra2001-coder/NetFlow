'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Server, Users, TrendingUp, DollarSign, AlertTriangle,
  Activity, CheckCircle2, Clock, Shield, BarChart3,
  ArrowUpRight, ArrowDownRight, Bell, Settings, Zap
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';

// Demo data
const revenueData = [
  { month: 'Jan', direct: 4200, reseller: 2400, enterprise: 2800 },
  { month: 'Feb', direct: 5100, reseller: 2800, enterprise: 3200 },
  { month: 'Mar', direct: 4800, reseller: 3100, enterprise: 3500 },
  { month: 'Apr', direct: 6200, reseller: 3800, enterprise: 4200 },
  { month: 'May', direct: 5900, reseller: 3500, enterprise: 3900 },
  { month: 'Jun', direct: 7100, reseller: 4200, enterprise: 4800 },
];

const userGrowthData = [
  { time: '10:00', users: 2400 },
  { time: '11:00', time: 3100 },
  { time: '12:00', users: 3800 },
  { time: '13:00', users: 4200 },
  { time: '14:00', users: 3900 },
  { time: '15:00', users: 4500 },
  { time: '16:00', users: 5200 },
];

const subscriptionData = [
  { name: 'Premium', value: 45, color: '#3b82f6' },
  { name: 'Standard', value: 35, color: '#10b981' },
  { name: 'Basic', value: 20, color: '#f59e0b' },
];

const adminEvents = [
  { id: 1, type: 'user', msg: 'New reseller registered: TechNet Solutions', time: 'Just now', severity: 'info' },
  { id: 2, type: 'payment', msg: 'Payment received from Reseller #42: $5,200', time: '15m ago', severity: 'success' },
  { id: 3, type: 'system', msg: 'Database backup completed successfully', time: '1h ago', severity: 'success' },
  { id: 4, type: 'alert', msg: 'License expiring soon for 3 resellers', time: '2h ago', severity: 'warning' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header - Enhanced */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">System overview and business intelligence</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$127,500', trend: '+12.5%', up: true, icon: <DollarSign className="w-5 h-5" />, color: 'green', bgGradient: 'from-green-500 to-emerald-600' },
          { label: 'Active Resellers', value: '28', trend: '+3', up: true, icon: <Users className="w-5 h-5" />, color: 'blue', bgGradient: 'from-blue-500 to-cyan-600' },
          { label: 'Total Users', value: '4,247', trend: '+156', up: true, icon: <Activity className="w-5 h-5" />, color: 'purple', bgGradient: 'from-purple-500 to-pink-600' },
          { label: 'System Uptime', value: '99.98%', trend: 'Excellent', up: null, icon: <CheckCircle2 className="w-5 h-5" />, color: 'cyan', bgGradient: 'from-cyan-500 to-blue-600' },
        ].map((stat, i) => (
          <Card 
            key={i} 
            className={`overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-${stat.color}-500/10 animate-slideUp ${['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'][i]} bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-950`}
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

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-2">
          <CardHeader
            title="Revenue Analysis"
            subtitle="Monthly revenue by segment"
            action={
              <Badge className="bg-green-500/20 text-green-500 border border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            }
          />
          <CardBody className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="direct" stackId="a" fill="#3b82f6" />
                <Bar dataKey="reseller" stackId="a" fill="#10b981" />
                <Bar dataKey="enterprise" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Subscription Distribution */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-3">
          <CardHeader 
            title="Subscriptions" 
            subtitle="Active plans distribution"
          />
          <CardBody className="flex items-center justify-center h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
          <CardBody className="p-4 border-t border-white/10 space-y-2">
            {subscriptionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Admin Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Events */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-3">
          <CardHeader 
            title="Admin Activity Log" 
            subtitle="Recent system events"
            action={<Bell className="w-4 h-4 text-neutral-400" />}
          />
          <CardBody className="space-y-2 p-6">
            {adminEvents.map((event, idx) => (
              <div 
                key={event.id}
                className="p-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-lg bg-white/10">
                    {event.type === 'user' && <Users className="w-4 h-4 text-blue-400" />}
                    {event.type === 'payment' && <DollarSign className="w-4 h-4 text-green-400" />}
                    {event.type === 'system' && <Shield className="w-4 h-4 text-cyan-400" />}
                    {event.type === 'alert' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{event.msg}</p>
                    <p className="text-xs text-neutral-400 mt-1">{event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* System Health */}
        <Card className="border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl dark:from-neutral-900 dark:to-neutral-950 bg-gradient-to-br animate-slideUp stagger-4">
          <CardHeader 
            title="System Health" 
            subtitle="Infrastructure metrics"
            action={<Shield className="w-4 h-4 text-green-400" />}
          />
          <CardBody className="space-y-4">
            {[
              { label: 'API Server Status', status: 'healthy', value: '5/5 healthy', icon: '🟢' },
              { label: 'Database Performance', status: 'healthy', value: '1,200 ops/s', icon: '🟢' },
              { label: 'Cache Memory', status: 'warning', value: '78% utilized', icon: '🟡' },
              { label: 'Backup Status', status: 'healthy', value: '4h ago', icon: '🟢' },
              { label: 'License Expiring', status: 'warning', value: '3 resellers', icon: '🟡' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.label}</p>
                    <p className={`text-xs ${item.status === 'healthy' ? 'text-green-400' : 'text-orange-400'}`}>
                      {item.status === 'healthy' ? '✓ Healthy' : '⚠ Action needed'}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideUp stagger-5">
        {[
          { title: 'User Management', desc: 'Manage resellers & users', icon: <Users className="w-5 h-5" />, path: '/dashboard/admin/profiles', bgGradient: 'from-blue-500 to-cyan-600' },
          { title: 'Billing & Revenue', desc: 'Financial reports', icon: <DollarSign className="w-5 h-5" />, path: '/dashboard/admin/billing', bgGradient: 'from-green-500 to-emerald-600' },
          { title: 'System Settings', desc: 'Configuration & policies', icon: <Settings className="w-5 h-5" />, path: '/dashboard/admin/settings', bgGradient: 'from-purple-500 to-pink-600' },
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
