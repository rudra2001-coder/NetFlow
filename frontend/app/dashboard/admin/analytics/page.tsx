"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Activity, Wifi, Users, Clock,
  Calendar, Filter, Download, RefreshCw, BarChart3, LineChart as LineChartIcon,
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Select, Tabs } from "@/components";
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
