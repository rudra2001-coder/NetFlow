"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Activity, Wifi, Users, Clock,
  Calendar, Filter, Download, RefreshCw, BarChart3, LineChart as LineChartIcon,
  Server
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Select, Tabs, Badge } from "@/components";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const trafficData = [
  { time: "00:00", inbound: 120, outbound: 80 },
  { time: "04:00", inbound: 80, outbound: 50 },
  { time: "08:00", inbound: 450, outbound: 320 },
  { time: "12:00", inbound: 680, outbound: 520 },
  { time: "16:00", inbound: 890, outbound: 720 },
  { time: "20:00", inbound: 750, outbound: 580 },
  { time: "23:59", inbound: 320, outbound: 240 },
];

const userGrowthData = [
  { month: "Jan", ppp: 450, hotspot: 120 },
  { month: "Feb", ppp: 520, hotspot: 180 },
  { month: "Mar", ppp: 610, hotspot: 250 },
  { month: "Apr", ppp: 720, hotspot: 340 },
  { month: "May", ppp: 850, hotspot: 420 },
  { month: "Jun", ppp: 980, hotspot: 510 },
];

const bandwidthByService = [
  { name: "Web Browsing", value: 35 },
  { name: "Video Streaming", value: 28 },
  { name: "Social Media", value: 15 },
  { name: "Gaming", value: 12 },
  { name: "File Sharing", value: 7 },
  { name: "Other", value: 3 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("traffic");

  const stats = useMemo(() => ({
    totalTraffic: "45.2 TB",
    avgBandwidth: "156 Mbps",
    peakUsers: 1247,
    growth: "+12.5%",
  }), []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Network performance and usage analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: "24h", label: "Last 24 Hours" },
              { value: "7d", label: "Last 7 Days" },
              { value: "30d", label: "Last 30 Days" },
              { value: "90d", label: "Last 90 Days" },
            ]}
          />
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Traffic</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalTraffic}</p>
                <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8.2% from last period
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Wifi className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Avg Bandwidth</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.avgBandwidth}</p>
                <p className="text-xs text-neutral-400 mt-1">Peak: 890 Mbps</p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Peak Users</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.peakUsers.toLocaleString()}</p>
                <p className="text-xs text-neutral-400 mt-1">Concurrently online</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Users className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">User Growth</p>
                <p className="text-3xl font-bold text-success-600">{stats.growth}</p>
                <p className="text-xs text-neutral-400 mt-1">Monthly growth rate</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: "traffic",
            label: "Traffic Analysis",
            content: <TrafficAnalysis />,
          },
          {
            id: "users",
            label: "User Growth",
            content: <UserGrowth />,
          },
          {
            id: "sessions",
            label: "Sessions",
            content: <SessionsAnalysis />,
          },
          {
            id: "services",
            label: "Services",
            content: <ServicesAnalysis />,
          },
        ]}
        defaultTab="traffic"
        onChange={setActiveTab}
      />
    </div>
  );
}

function SessionsAnalysis() {
  const sessionData = [
    { hour: "00:00", active: 850 },
    { hour: "04:00", active: 420 },
    { hour: "08:00", active: 1100 },
    { hour: "12:00", active: 2450 },
    { hour: "16:00", active: 3100 },
    { hour: "20:00", active: 1800 },
    { hour: "23:59", active: 950 },
  ];

  const authTrendData = [
    { time: "08:00", success: 120, fail: 5 },
    { time: "10:00", success: 340, fail: 12 },
    { time: "12:00", success: 560, fail: 25 },
    { time: "14:00", success: 420, fail: 18 },
    { time: "16:00", success: 680, fail: 30 },
    { time: "18:00", success: 510, fail: 15 },
    { time: "20:00", success: 290, fail: 8 },
  ];

  const liveSessions = [
    { id: "SES-991", user: "mac-00:25:96:FF:21:44", type: "Hotspot", duration: "2h 15m", usage: "1.2 GB", ip: "10.5.50.122", node: "RTR-HQ-01" },
    { id: "SES-992", user: "user_pppoe_77", type: "PPP", duration: "14h 22m", usage: "8.5 GB", ip: "172.16.10.45", node: "RTR-BRANCH-02" },
    { id: "SES-993", user: "mac-64:D1:54:11:88:90", type: "Hotspot", duration: "0h 12m", usage: "156 MB", ip: "10.5.50.156", node: "RTR-HQ-01" },
    { id: "SES-994", user: "support_test_acct", type: "PPP", duration: "1h 05m", usage: "450 MB", ip: "172.16.10.98", node: "RTR-CORE-01" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Concurrency */}
        <Card className="lg:col-span-2 glass border-0 shadow-xl overflow-hidden">
          <CardHeader
            title="Session Concurrency"
            subtitle="Active concurrent sessions over 24 hours"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData}>
                  <defs>
                    <linearGradient id="colorSessionActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                  <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                      borderRadius: "16px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Bar dataKey="active" fill="url(#colorSessionActive)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Quick Session Stats */}
        <div className="flex flex-col gap-4">
          <Card className="glass border-0 shadow-lg flex-1 group hover:scale-[1.02] transition-transform duration-300">
            <CardBody className="flex flex-col justify-center h-full">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-3 text-primary-600 group-hover:rotate-12 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Avg Session Duration</span>
              <span className="text-3xl font-black dark:text-white">4h 12m</span>
              <div className="mt-2 flex items-center gap-2 text-success-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+15% vs last week</span>
              </div>
            </CardBody>
          </Card>
          <Card className="glass border-0 shadow-lg flex-1 group hover:scale-[1.02] transition-transform duration-300">
            <CardBody className="flex flex-col justify-center h-full">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg w-fit mb-3 text-success-600 group-hover:rotate-12 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Auth Attempts</span>
              <span className="text-3xl font-black dark:text-white">12,450</span>
              <div className="mt-2 flex items-center gap-2 text-neutral-500 font-medium font-mono">
                <Activity className="w-4 h-4 text-primary-500" />
                <span className="text-sm">99.1% Success Rate</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auth Trend Chart */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader
            title="Authentication Trend"
            subtitle="Hourly success vs failure attempts"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={authTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(229, 231, 235, 0.5)",
                      borderRadius: "16px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fail"
                    stroke="#ef4444"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <div className="w-3 h-3 rounded-full bg-success-500" /> Success
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <div className="w-3 h-1 border-t-2 border-dashed border-error-500" /> Failures
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Device Distribution */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader
            title="Device Distribution"
            subtitle="Client hardware breakdown"
          />
          <CardBody>
            <div className="space-y-6 pt-4">
              {[
                { brand: "Android Devices", count: 480, total: 950, color: "bg-success-500", icon: <TrendingUp className="w-4 h-4 text-success-600" /> },
                { brand: "iOS / Apple", count: 320, total: 950, color: "bg-primary-500", icon: <TrendingUp className="w-4 h-4 text-primary-600" /> },
                { brand: "Windows Desktop", count: 110, total: 950, color: "bg-info-500", icon: <TrendingDown className="w-4 h-4 text-info-600" /> },
                { brand: "Other / IoT", count: 40, total: 950, color: "bg-neutral-400", icon: <Activity className="w-4 h-4 text-neutral-500" /> },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{item.brand}</p>
                      <p className="text-xs text-neutral-500 font-mono">{item.count} Active</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-neutral-800 dark:text-neutral-200">{Math.round((item.count / item.total) * 100)}%</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out group-hover:brightness-110`}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Live Sessions Table */}
      <Card className="glass overflow-hidden border-0 shadow-2xl">
        <CardHeader
          title="Live Sessions"
          subtitle="Real-time connectivity monitoring across all gateways"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
              <Button size="sm" className="bg-primary-600 hover:bg-primary-700">Refresh List</Button>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-800/30">
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">User / Identifier</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Gateway</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {liveSessions.map((session) => (
                <tr key={session.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-900 dark:text-white text-sm">{session.user}</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{session.ip}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={session.type === 'PPP' ? 'ppp' : 'default'} pppStatus={session.type === 'PPP' ? 'active' : undefined}>
                      {session.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Server className="w-3.5 h-3.5" />
                      {session.node}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{session.duration}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-primary-600">{session.usage}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error-500 hover:bg-error-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Disconnect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TrafficAnalysis() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="Traffic Over Time" subtitle="Inbound vs outbound traffic" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v} Mbps`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [`${value} Mbps`]}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                  name="Inbound"
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOutbound)"
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Protocol Distribution" subtitle="Traffic by protocol type" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="inbound" fill="#3b82f6" radius={[4, 4, 0, 0]} name="TCP" />
                <Bar dataKey="outbound" fill="#22c55e" radius={[4, 4, 0, 0]} name="UDP" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function UserGrowth() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="User Growth" subtitle="PPP vs Hotspot users" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ppp"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  name="PPP Users"
                />
                <Line
                  type="monotone"
                  dataKey="hotspot"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2 }}
                  name="Hotspot Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="User Retention" subtitle="Monthly retention rate" />
        <CardBody>
          <div className="space-y-4">
            {[
              { month: "January", rate: 92, change: "+2%" },
              { month: "February", rate: 89, change: "-3%" },
              { month: "March", rate: 94, change: "+5%" },
              { month: "April", rate: 91, change: "-3%" },
              { month: "May", rate: 96, change: "+5%" },
              { month: "June", rate: 93, change: "-3%" },
            ].map((item) => (
              <div key={item.month} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-900 dark:text-white">{item.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12">{item.rate}%</span>
                  <span className={cn(
                    "text-xs font-medium",
                    item.change.startsWith("+") ? "text-success-600" : "text-error-600"
                  )}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ServicesAnalysis() {
  const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#6b7280"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="Bandwidth by Service" subtitle="Top applications by bandwidth usage" />
        <CardBody>
          <div className="space-y-4">
            {bandwidthByService.map((service, index) => (
              <div key={service.name} className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {service.name}
                    </span>
                    <span className="text-sm text-neutral-500">{service.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${service.value}%`,
                        backgroundColor: COLORS[index],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Peak Hours" subtitle="User activity by hour of day" />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
