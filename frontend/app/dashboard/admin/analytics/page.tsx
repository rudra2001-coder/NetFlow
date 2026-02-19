"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Activity, Wifi, Users, Clock,
  Calendar, Filter, Download, RefreshCw, BarChart3, LineChart as LineChartIcon,
  Server, Cpu, Database, Zap, ArrowUpRight, DollarSign, PieChart,
  ChevronRight, MoreVertical, Globe, Shield, Settings
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader,
  Select, Tabs, Badge, Progress, Dropdown
} from "@/components";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

// ============================================================================
// Pro-Level Mock Data
// ============================================================================

const trafficData = [
  { time: "00:00", inbound: 120, outbound: 80, latency: 12 },
  { time: "04:00", inbound: 80, outbound: 50, latency: 10 },
  { time: "08:00", inbound: 450, outbound: 320, latency: 18 },
  { time: "12:00", inbound: 680, outbound: 520, latency: 25 },
  { time: "16:00", inbound: 890, outbound: 720, latency: 30 },
  { time: "20:00", inbound: 750, outbound: 580, latency: 22 },
  { time: "23:59", inbound: 320, outbound: 240, latency: 15 },
];

const revenueTrend = [
  { date: "Mon", cash: 4500, mfs: 8200, forecast: 11000 },
  { date: "Tue", cash: 3800, mfs: 9100, forecast: 11500 },
  { date: "Wed", cash: 5200, mfs: 7800, forecast: 12000 },
  { date: "Thu", cash: 6100, mfs: 11200, forecast: 13500 },
  { date: "Fri", cash: 4900, mfs: 12400, forecast: 15000 },
  { date: "Sat", cash: 7200, mfs: 15600, forecast: 21000 },
  { date: "Sun", cash: 8500, mfs: 16800, forecast: 24000 },
];

const hardwareStats = [
  { name: "CPU Load", value: 42, color: "#3b82f6", icon: <Cpu className="w-4 h-4" /> },
  { name: "Memory", value: 68, color: "#8b5cf6", icon: <Database className="w-4 h-4" /> },
  { name: "Disk Usage", value: 25, color: "#10b981", icon: <Server className="w-4 h-4" /> },
];

// ============================================================================
// Main Component
// ============================================================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary-500" />
            Analytics Command Center
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl tracking-tight">
            Aggregated network intelligence, financial forecasting, and global systems health monitoring.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: "24h", label: "Last 24 Hours" },
              { value: "7d", label: "Last 7 Days" },
              { value: "30d", label: "Last 30 Days" },
            ]}
            className="w-44"
          />
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl shadow-inner">
            <Button size="sm" variant="ghost" className="rounded-xl px-4">Live</Button>
            <Button size="sm" className="rounded-xl px-4 shadow-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white">Trend</Button>
          </div>
          <Button variant="outline" className="rounded-2xl h-11 h-11 w-11 p-0 border-0 glass shadow-lg"><Download className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Performance Ticker Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {hardwareStats.map((stat, i) => (
          <Card key={i} className="glass border-0 shadow-lg group hover:-translate-y-1 transition-all duration-300">
            <CardBody className="p-4 py-3 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 shadow-sm text-neutral-400 group-hover:text-primary-500 transition-colors">
                {stat.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{stat.name}</span>
                  <span className="text-sm font-black dark:text-white">{stat.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        <Card className="glass border-0 shadow-lg bg-primary-600 text-white overflow-hidden relative group">
          <CardBody className="p-4 py-3 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Uptime Score</p>
                <h4 className="text-2xl font-black italic">99.99%</h4>
              </div>
              <Zap className="w-6 h-6 opacity-30 group-hover:scale-125 transition-transform" />
            </div>
          </CardBody>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </Card>
      </div>

      {/* Core Visualization Engine */}
      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Core Overview",
            content: <ExecutiveOverview />,
          },
          {
            id: "revenue",
            label: "Revenue Hub",
            content: <RevenueHub />,
          },
          {
            id: "monitoring",
            label: "Online Monitoring",
            content: <LiveMonitoring />,
          },
          {
            id: "software",
            label: "Software Performace",
            content: <SoftwarePerformance />,
          },
        ]}
        defaultTab="overview"
        onChange={setActiveTab}
        className="mt-6"
      />
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

function ExecutiveOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <Card className="lg:col-span-2 glass border-0 shadow-2xl overflow-hidden min-h-[450px]">
        <CardHeader
          title="Real-time Network Velocity"
          subtitle="Aggregated throughput and global latency spikes"
          action={<Badge variant="info" className="rounded-full px-3 py-1 font-black animate-pulse">LIVE FEED</Badge>}
        />
        <CardBody className="p-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(229, 231, 235, 0.5)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                  name="Inbound Traffic"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card className="glass border-0 shadow-xl overflow-hidden relative">
          <CardBody className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Network Health</p>
            <div className="space-y-4">
              {[
                { label: "Packet Loss", val: "0.02%", status: "Optimal" },
                { label: "Jitter", val: "4ms", status: "Clean" },
                { label: "DNS Latency", val: "18ms", status: "Good" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-50 dark:border-neutral-700/50">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{item.label}</p>
                    <p className="text-lg font-black dark:text-white leading-tight">{item.val}</p>
                  </div>
                  <Badge variant="success" size="sm" className="rounded-full px-2">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="glass border-0 shadow-xl bg-gradient-to-br from-neutral-900 to-black text-white p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <TrendingUp className="w-8 h-8 text-primary-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">Growth Index</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">+24.8%</span>
              <span className="text-xs font-bold text-success-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                Week
              </span>
            </div>
            <p className="text-[10px] font-medium opacity-50 mt-4 leading-relaxed">System-wide scalability trending upwards based on concurrent session influx.</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-32 h-32" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function RevenueHub() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 glass border-0 shadow-2xl min-h-[450px]">
          <CardHeader
            title="Revenue Matrix & Projections"
            subtitle="Consolidated cash flow vs digital payments (MFS)"
          />
          <CardBody className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "16px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="cash" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={40} />
                  <Bar dataKey="mfs" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card className="glass border-0 shadow-lg p-6 bg-gradient-to-br from-success-500 to-success-600 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Projected Monthly</p>
            <h3 className="text-3xl font-black mt-1">$45.2K</h3>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold">
              <div className="p-1 rounded-full bg-white/20">
                <TrendingUp className="w-3 h-3" />
              </div>
              Target: Above 12%
            </div>
          </Card>
          <Card className="glass border-0 shadow-lg p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Payment Splitting</p>
            <div className="space-y-4">
              {[
                { label: "Digital Wallet", val: 65, color: "bg-primary-500" },
                { label: "Manual Invoicing", val: 25, color: "bg-purple-500" },
                { label: "On-site Cash", val: 10, color: "bg-neutral-300" }
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-black mb-1.5 uppercase tracking-tighter">
                    <span>{p.label}</span>
                    <span>{p.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
                    <div className={cn("h-full rounded-full", p.color)} style={{ width: `${p.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LiveMonitoring() {
  const liveNodes = [
    { name: "Core-Router-Alpha", status: "online", load: 24, throughput: "1.2 Gbps", node: "Headquarters" },
    { name: "Branch-Edge-01", status: "online", load: 45, throughput: "450 Mbps", node: "New York" },
    { name: "Public-Hotspot-G03", status: "warning", load: 88, throughput: "85 Mbps", node: "Retail Wing" },
    { name: "Backup-Gateway-X", status: "idle", load: 2, throughput: "0 Mbps", node: "Data Center" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="glass border-0 shadow-2xl overflow-hidden">
        <CardHeader
          title="Real-time Node Monitoring"
          subtitle="Live throughput and load balancing status across all POPs"
          action={<Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh Pulse</Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 dark:bg-neutral-800/50 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                <th className="px-6 py-4">Node Identity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Resource Load</th>
                <th className="px-6 py-4">Current Throughput</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {liveNodes.map((node, i) => (
                <tr key={i} className="group hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        node.status === 'online' ? "bg-primary-500 shadow-primary-500/20 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                      )}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black dark:text-white leading-tight">{node.name}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mt-1">{node.node}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={node.status === 'online' ? 'success' : node.status === 'warning' ? 'warning' : 'default'}>
                      {node.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-black mb-1.5 text-neutral-500 uppercase">
                        <span>CPU Load</span>
                        <span>{node.load}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            node.load > 80 ? "bg-error-500" : node.load > 50 ? "bg-warning-500" : "bg-success-500"
                          )}
                          style={{ width: `${node.load}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-primary-500">{node.throughput}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Activity className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Settings className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary-500 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></Button>
                    </div>
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

function SoftwarePerformance() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      <Card className="glass border-0 shadow-xl overflow-hidden min-h-[400px]">
        <CardHeader title="System Efficiency" subtitle="Internal processing delays and response times" />
        <CardBody className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="glass border-0 shadow-xl overflow-hidden min-h-[400px]">
        <CardHeader title="Error Distribution" subtitle="API response health and fault frequency" />
        <CardBody className="p-6 flex items-center justify-center">
          <div className="h-72 w-72 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <h4 className="text-3xl font-black mb-0">99.8%</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Success Rate</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={[
                    { name: 'Success', value: 998 },
                    { name: 'Faults', value: 2 }
                  ]}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" fillOpacity={0.8} />
                  <Cell fill="#ef4444" fillOpacity={0.8} />
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
