"use client";

import React, { useState } from "react";
import {
    TrendingUp, Activity, Globe, Zap,
    ArrowUpRight, ArrowDownRight, RefreshCw,
    Filter, Download, PieChart, BarChart3,
    Clock, Shield, Cpu, Database, Server,
    Share2, Youtube, Gamepad2, Lock, Monitor
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Select, Progress
} from "@/components";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
    BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";

// ============================================================================
// Pro-Level Forensic Traffic Data
// ============================================================================

const trafficPulse = [
    { time: "00:00", down: 2.4, up: 0.8, latency: 12 },
    { time: "02:00", down: 1.8, up: 0.5, latency: 10 },
    { time: "04:00", down: 1.2, up: 0.3, latency: 11 },
    { time: "06:00", down: 4.5, up: 1.2, latency: 14 },
    { time: "08:00", down: 8.9, up: 2.8, latency: 18 },
    { time: "10:00", down: 12.4, up: 3.5, latency: 22 },
    { time: "12:00", down: 15.6, up: 4.2, latency: 25 },
    { time: "14:00", down: 14.8, up: 4.0, latency: 24 },
    { time: "16:00", down: 18.2, up: 5.1, latency: 28 },
    { time: "18:00", down: 22.5, up: 6.8, latency: 32 },
    { time: "20:00", down: 21.4, up: 6.5, latency: 30 },
    { time: "22:00", down: 14.5, up: 3.8, latency: 20 },
];

const protocolStats = [
    { name: "Web (HTTP/S)", value: 45, color: "#3b82f6", icon: <Globe className="w-4 h-4" /> },
    { name: "Streaming", value: 30, color: "#ef4444", icon: <Youtube className="w-4 h-4" /> },
    { name: "Gaming", value: 15, color: "#10b981", icon: <Gamepad2 className="w-4 h-4" /> },
    { name: "VPN/Secure", value: 7, color: "#8b5cf6", icon: <Lock className="w-4 h-4" /> },
    { name: "Others", value: 3, color: "#6b7280", icon: <Share2 className="w-4 h-4" /> },
];

const nodeTraffic = [
    { name: "POP-HQ-01", traffic: 4500, load: 78 },
    { name: "POP-NY-Edge", traffic: 3200, load: 45 },
    { name: "POP-LDN-Core", traffic: 5800, load: 92 },
    { name: "POP-TKY-DC", traffic: 2100, load: 30 },
];

export default function TrafficAnalysis() {
    const [timeframe, setTimeframe] = useState("24h");

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary-500" />
                        Forensic Traffic Matrix
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Real-time throughput & protocol orchestration</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl shadow-inner border border-white/5">
                        {['24h', '7d', '30d'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    timeframe === t ? "bg-white dark:bg-neutral-900 shadow-lg text-primary-600" : "text-neutral-500"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" className="rounded-2xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest" leftIcon={<RefreshCw className="w-4 h-4" />}>Reset Pulse</Button>
                </div>
            </div>

            {/* Live Ticker Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Aggregate Ingress", val: "22.5 Gbps", trend: "+12%", icon: <ArrowDownRight className="text-success-500" /> },
                    { label: "Aggregate Egress", val: "6.8 Gbps", trend: "+8%", icon: <ArrowUpRight className="text-primary-500" /> },
                    { label: "Global Latency", val: "24ms", trend: "-2ms", icon: <Clock className="text-warning-500" /> },
                    { label: "Core Utilization", val: "68%", trend: "Stable", icon: <Cpu className="text-purple-500" /> },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-0 shadow-xl group hover:-translate-y-2 transition-all duration-500 rounded-[2rem]">
                        <CardBody className="p-6">
                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-4 flex items-center justify-between">
                                {stat.label}
                                {stat.icon}
                            </p>
                            <h3 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{stat.val}</h3>
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-success-500">{stat.trend} from prev window</span>
                                <Badge variant="info" className="text-[8px] font-black rounded-lg">LIVE</Badge>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Main Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader
                        title="Throughput Waveform"
                        subtitle="Real-time inbound vs outbound transmission density."
                        action={<Badge variant="info" className="rounded-xl px-4 animate-pulse">SENSORS ACTIVE</Badge>}
                    />
                    <CardBody className="p-8">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficPulse}>
                                    <defs>
                                        <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.2} />
                                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.8)",
                                            border: "none",
                                            borderRadius: "20px",
                                            color: "#fff",
                                            fontWeight: "900",
                                            fontSize: "12px",
                                            backdropFilter: "blur(10px)"
                                        }}
                                    />
                                    <Area type="monotone" dataKey="down" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDown)" name="Ingress (Gbps)" />
                                    <Area type="monotone" dataKey="up" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorUp)" name="Egress (Gbps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                <div className="space-y-8">
                    <Card className="glass border-0 shadow-2xl rounded-[3rem] p-8">
                        <h4 className="text-[11px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-8 italic">Protocol Distribution</h4>
                        <div className="flex justify-center mb-8 relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black dark:text-white uppercase italic leading-none">45%</span>
                                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mt-1">Primary Feed</span>
                            </div>
                            <div className="h-64 w-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie
                                            data={protocolStats}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {protocolStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {protocolStats.map((p, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                            {p.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{p.name}</span>
                                    </div>
                                    <span className="text-xs font-black dark:text-white italic">{p.value}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* High-Impact Tickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader title="POP Saturation" subtitle="Current load across global POP nodes." />
                    <CardBody className="p-8 space-y-6">
                        {nodeTraffic.map((node, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="dark:text-white">{node.name}</span>
                                    <span className="text-primary-500">{node.load}%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            node.load > 85 ? "bg-error-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary-500"
                                        )}
                                        style={{ width: `${node.load}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[3rem] bg-gradient-to-br from-neutral-900 to-black text-white p-10 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-[-50px] right-[-50px] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                        <Zap className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <Badge variant="warning" className="rounded-xl px-4 font-black mb-6 animate-bounce">SLA THRESHOLD WARNING</Badge>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none text-white">Capacity Breach <br /><span className="text-primary-500">Imminent in POP-LDN</span></h3>
                        <p className="text-xs font-bold text-neutral-400 leading-relaxed max-w-xs">Forecasting engine predicts a saturation breach within 4 hours based on current traffic velocity.</p>
                        <Button className="mt-8 rounded-2xl h-14 w-full bg-white text-black font-black uppercase tracking-widest text-xs">Authorize Load Balance</Button>
                    </div>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-primary-500/10 rounded-[2rem] flex items-center justify-center text-primary-500 shadow-xl shadow-primary-500/10">
                        <Download className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Export Forensic Log</h4>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 max-w-[200px] mx-auto">Generate a cryptographic audit of all traffic packets for the current window.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" className="rounded-2xl h-12 border-0 glass font-black uppercase text-[10px] tracking-widest text-neutral-500">CSV Export</Button>
                        <Button className="rounded-2xl h-12 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20">PDF Analysis</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
