"use client";

import React, { useState } from "react";
import {
    FileText, Download, Calendar, Filter, BarChart3,
    TrendingUp, Users, CreditCard, Activity, ArrowUpRight,
    ChevronDown, Share2, Printer
} from "lucide-react";
import {
    Card, CardHeader, Button, Badge,
    Select, StatCard
} from "@/components";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 ${className || ''}`}>{children}</div>
);

const mockTrafficData = [
    { time: '00:00', download: 400, upload: 240 },
    { time: '04:00', download: 300, upload: 198 },
    { time: '08:00', download: 900, upload: 500 },
    { time: '12:00', download: 1200, upload: 800 },
    { time: '16:00', download: 1500, upload: 1100 },
    { time: '20:00', download: 1100, upload: 700 },
    { time: '23:59', download: 600, upload: 400 },
];

const mockRevenueData = [
    { month: 'Jan', revenue: 4500, users: 120 },
    { month: 'Feb', revenue: 5200, users: 135 },
    { month: 'Mar', revenue: 4800, users: 140 },
    { month: 'Apr', revenue: 6100, users: 155 },
    { month: 'May', revenue: 5900, users: 160 },
    { month: 'Jun', revenue: 7200, users: 185 },
];

export default function ReportsPage() {
    const [reportType, setReportType] = useState("traffic");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (format: string) => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert(`Report exported as ${format.toUpperCase()}`);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Analytics & Reports</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Generate deep insights from your network traffic and billing data.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        leftIcon={<Printer className="w-4 h-4" />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                    <div className="relative group">
                        <Button
                            className="glow-primary"
                            leftIcon={<Download className="w-4 h-4" />}
                            loading={isExporting}
                        >
                            Export Report
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800">Portable Document (PDF)</button>
                            <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800">Excel Spreadsheet (CSV)</button>
                            <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Direct Data (JSON)</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Traffic"
                    value="14.2 TB"
                    change={12.5}
                    trend="up"
                    icon={<Activity className="w-5 h-5" />}
                />
                <StatCard
                    title="Avg. Bandwidth"
                    value="850 Mbps"
                    change={5.2}
                    trend="up"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Active Sessions"
                    value="1,284"
                    change={-2.1}
                    trend="down"
                    icon={<Users className="w-5 h-5" />}
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$12,450"
                    change={18.3}
                    trend="up"
                    icon={<CreditCard className="w-5 h-5" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="glass sticky top-24">
                        <CardHeader title="Report Settings" />
                        <CardBody className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Time Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="primary" size="sm" className="w-full">Last 24h</Button>
                                    <Button variant="outline" size="sm" className="w-full">7 Days</Button>
                                    <Button variant="outline" size="sm" className="w-full">30 Days</Button>
                                    <Button variant="outline" size="sm" className="w-full">Custom</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Metric Category</label>
                                <Select
                                    value={reportType}
                                    onChange={(val) => setReportType(val)}
                                    options={[
                                        { value: "traffic", label: "Network Traffic" },
                                        { value: "billing", label: "Billing & Revenue" },
                                        { value: "performance", label: "Router Performance" },
                                        { value: "users", label: "User Adoption" },
                                    ]}
                                />
                            </div>

                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <Button variant="ghost" className="w-full text-primary-500" leftIcon={<Share2 className="w-4 h-4" />}>
                                    Share Dashboard
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Charts and Data */}
                <div className="lg:col-span-9 space-y-6">
                    {reportType === "traffic" ? (
                        <Card className="glass">
                            <CardHeader
                                title="Traffic Throughput (Real-time)"
                                subtitle="Aggregated download and upload speeds across all active ISP routers."
                                action={<Badge variant="success" dot={true}>Live Feed</Badge>}
                            />
                            <CardBody className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockTrafficData}>
                                        <defs>
                                            <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                                        <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="download" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorDownload)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="upload" stroke="var(--accent-500)" fillOpacity={1} fill="url(#colorUpload)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                    ) : (
                        <Card className="glass">
                            <CardHeader title="Revenue & Growth" subtitle="Monitoring financial growth and active user acquisition." />
                            <CardBody className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockRevenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="revenue" fill="var(--primary-500)" radius={[6, 6, 0, 0]} />
                                        <Bar yAxisId="right" dataKey="users" fill="var(--accent-500)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                    )}

                    {/* Detailed Data Table (UI only) */}
                    <Card className="glass overflow-hidden">
                        <CardHeader
                            title="Recent Top Consumers"
                            subtitle="Users with highest bandwidth utilization in the selected period."
                        />
                        <CardBody className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">User Identity</th>
                                        <th className="px-6 py-4">Total Usage</th>
                                        <th className="px-6 py-4">Peak Speed</th>
                                        <th className="px-6 py-4 text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {[
                                        { name: "John@Fiber", usage: "1.2 TB", peak: "450 Mbps", trend: "up" },
                                        { name: "TechHub_HQ", usage: "950 GB", peak: "980 Mbps", trend: "up" },
                                        { name: "Res_User_42", usage: "850 GB", peak: "50 Mbps", trend: "down" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium dark:text-white">{row.name}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-neutral-600 dark:text-neutral-400">{row.usage}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-neutral-600 dark:text-neutral-400">{row.peak}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant={row.trend === 'up' ? 'error' : 'success'} size="sm">
                                                    {row.trend === 'up' ? '+15%' : '-5%'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
