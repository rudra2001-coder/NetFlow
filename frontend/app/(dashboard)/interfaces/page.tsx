"use client";

import React, { useState, useMemo } from "react";
import {
    Activity, ArrowUpRight, ArrowDownRight,
    RefreshCw, Search, Filter, HardDrive,
    Zap, Cpu, Globe, Link, Link2,
    Settings, Shield, Clock, Plus,
    MoreHorizontal, CheckCircle2, XCircle,
    AlertTriangle, Server, Layers
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress, Input, Select,
    Alert, Dropdown
} from "@/components";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";

// ============================================================================
// Forensic Interface Data Simulation
// ============================================================================

const interfaceStats = [
    {
        id: "eth1",
        name: "ether1-WAN",
        type: "Ethernet",
        status: "up",
        speed: "1 Gbps",
        tx: 450.5,
        rx: 120.2,
        txErrors: 0,
        rxErrors: 0,
        mtu: 1500,
        mac: "E4:8D:8C:00:11:22",
        lastChange: "12 days ago",
        sparkline: [
            { t: 0, val: 300 }, { t: 1, val: 450 }, { t: 2, val: 280 },
            { t: 3, val: 560 }, { t: 4, val: 420 }, { t: 5, val: 450 }
        ]
    },
    {
        id: "sfp1",
        name: "sfp-sfpplus1",
        type: "SFP+",
        status: "up",
        speed: "10 Gbps",
        tx: 2500.8,
        rx: 1800.5,
        txErrors: 2,
        rxErrors: 0,
        mtu: 9000,
        mac: "E4:8D:8C:00:33:44",
        lastChange: "45 days ago",
        sparkline: [
            { t: 0, val: 2100 }, { t: 1, val: 2500 }, { t: 2, val: 2300 },
            { t: 3, val: 2700 }, { t: 4, val: 2600 }, { t: 5, val: 2500 }
        ]
    },
    {
        id: "eth2",
        name: "ether2-LAN",
        type: "Ethernet",
        status: "down",
        speed: "1 Gbps",
        tx: 0,
        rx: 0,
        txErrors: 45,
        rxErrors: 12,
        mtu: 1500,
        mac: "E4:8D:8C:00:55:66",
        lastChange: "2 hours ago",
        sparkline: [
            { t: 0, val: 100 }, { t: 1, val: 50 }, { t: 2, val: 0 },
            { t: 3, val: 0 }, { t: 4, val: 0 }, { t: 5, val: 0 }
        ]
    },
    {
        id: "vlan10",
        name: "vlan-billing",
        type: "VLAN",
        status: "up",
        speed: "N/A",
        tx: 25.4,
        rx: 12.8,
        txErrors: 0,
        rxErrors: 0,
        mtu: 1500,
        mac: "E4:8D:8C:00:11:22",
        lastChange: "12 days ago",
        sparkline: [
            { t: 0, val: 15 }, { t: 1, val: 25 }, { t: 2, val: 22 },
            { t: 3, val: 30 }, { t: 4, val: 28 }, { t: 5, val: 25 }
        ]
    },
    {
        id: "br0",
        name: "bridge-local",
        type: "Bridge",
        status: "up",
        speed: "N/A",
        tx: 890.2,
        rx: 640.5,
        txErrors: 0,
        rxErrors: 0,
        mtu: 1500,
        mac: "E4:8D:8C:00:77:88",
        lastChange: "12 days ago",
        sparkline: [
            { t: 0, val: 700 }, { t: 1, val: 890 }, { t: 2, val: 820 },
            { t: 3, val: 950 }, { t: 4, val: 910 }, { t: 5, val: 890 }
        ]
    }
];

export default function InterfaceCommandCenter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");

    const filteredInterfaces = useMemo(() => {
        return interfaceStats.filter(intf => {
            const matchesSearch = intf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                intf.mac.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "all" || intf.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchQuery, filterType]);

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-500" />
                        Infrastructure Link Matrix
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Physical & Logical Interface Orchestration</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest" leftIcon={<RefreshCw className="w-4 h-4" />}>Resync Pulse</Button>
                    <Button className="rounded-2xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 font-black uppercase text-xs tracking-widest" leftIcon={<Plus className="w-4 h-4" />}>Provision Link</Button>
                </div>
            </div>

            {/* Link Health Tickers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Aggregate Throughput", val: "3.2 Gbps", trend: "+12%", color: "text-emerald-500", icon: <Zap className="w-5 h-5" /> },
                    { label: "Active Physical Links", val: "12 / 16", trend: "Normal", color: "text-blue-500", icon: <Link2 className="w-5 h-5" /> },
                    { label: "CRC Error Pulse", val: "0.02%", trend: "Critical", color: "text-red-500", icon: <AlertTriangle className="w-5 h-5" /> },
                    { label: "Logical Overhead", val: "450 Mbps", trend: "Balanced", color: "text-purple-500", icon: <Layers className="w-5 h-5" /> },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-0 shadow-xl rounded-[2rem] group hover:-translate-y-1 transition-all">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{stat.label}</span>
                                <div className={cn("p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800", stat.color)}>{stat.icon}</div>
                            </div>
                            <h3 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{stat.val}</h3>
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className={cn("text-[10px] font-bold", stat.trend === 'Critical' ? 'text-red-500' : 'text-emerald-500')}>{stat.trend} State</span>
                                <Badge variant="info" className="text-[8px] font-black">SYSTEM</Badge>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-neutral-900/50 p-4 rounded-[2rem] border border-white/10 glass">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search by ID, Name or MAC..."
                        className="pl-12 h-12 rounded-2xl border-0 bg-neutral-100 dark:bg-neutral-800 focus:ring-2 focus:ring-emerald-500 w-full font-bold text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select
                        value={filterType}
                        onChange={(val) => setFilterType(val)}
                        options={[
                            { label: "All Types", value: "all" },
                            { label: "Ethernet", value: "Ethernet" },
                            { label: "SFP+", value: "SFP+" },
                            { label: "VLAN", value: "VLAN" },
                            { label: "Bridge", value: "Bridge" },
                        ]}
                        className="h-12 min-w-[150px] rounded-2xl border-0 bg-neutral-100 dark:bg-neutral-800 font-bold text-xs uppercase"
                    />
                    <Button variant="outline" className="h-12 rounded-2xl border-0 glass font-black uppercase text-xs tracking-widest px-6" leftIcon={<Filter className="w-4 h-4" />}>Advanced</Button>
                </div>
            </div>

            {/* Main Interface Table */}
            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <th className="px-10 py-6">Link Identity</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-6 py-6">Type</th>
                                    <th className="px-6 py-6">Tx / Rx (Real-time)</th>
                                    <th className="px-6 py-6">errors</th>
                                    <th className="px-6 py-6">Bandwidth Spark</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredInterfaces.map((intf) => (
                                    <tr key={intf.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-800/20 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                                                    intf.status === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {intf.type === 'SFP+' ? <Globe className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{intf.name}</p>
                                                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 font-mono">{intf.mac}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                {intf.status === 'up' ? (
                                                    <Badge variant="success" className="px-3 py-1 rounded-lg flex items-center gap-1.5 font-black text-[9px] uppercase italic">
                                                        <CheckCircle2 className="w-3 h-3" /> ONLINE
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="error" className="px-3 py-1 rounded-lg flex items-center gap-1.5 font-black text-[9px] uppercase italic">
                                                        <XCircle className="w-3 h-3" /> OFFLINE
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[10px] font-black dark:text-neutral-400 uppercase tracking-widest">{intf.type}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500">
                                                        <ArrowUpRight className="w-3 h-3" /> TX
                                                    </div>
                                                    <p className="text-xs font-black dark:text-white tracking-tighter">{intf.tx > 1000 ? (intf.tx / 1000).toFixed(1) + ' G' : intf.tx + ' M'}</p>
                                                </div>
                                                <div className="w-px h-8 bg-neutral-100 dark:bg-neutral-800" />
                                                <div>
                                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500">
                                                        <ArrowDownRight className="w-3 h-3" /> RX
                                                    </div>
                                                    <p className="text-xs font-black dark:text-white tracking-tighter">{intf.rx > 1000 ? (intf.rx / 1000).toFixed(1) + ' G' : intf.rx + ' M'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase">
                                                    <span className="text-neutral-400">ERR:</span>
                                                    <span className={cn(intf.txErrors + intf.rxErrors > 0 ? "text-red-500 animate-pulse" : "text-emerald-500")}>
                                                        {intf.txErrors + intf.rxErrors}
                                                    </span>
                                                </div>
                                                <Progress value={intf.txErrors + intf.rxErrors > 0 ? 35 : 0} variant={intf.txErrors + intf.rxErrors > 0 ? "danger" : "success"} className="h-1" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="h-10 w-24">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={intf.sparkline}>
                                                        <defs>
                                                            <linearGradient id={`grad-${intf.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={intf.status === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor={intf.status === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <Area
                                                            type="monotone"
                                                            dataKey="val"
                                                            stroke={intf.status === 'up' ? "#10b981" : "#ef4444"}
                                                            strokeWidth={2}
                                                            fillOpacity={1}
                                                            fill={`url(#grad-${intf.id})`}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Dropdown
                                                trigger={
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                }
                                                items={[
                                                    { label: 'Link Detail', icon: <Activity className="w-4 h-4" />, onClick: () => { } },
                                                    { label: 'Diagnostic RFC', icon: <Shield className="w-4 h-4" />, onClick: () => { } },
                                                    { label: 'Reset Protocol', icon: <RefreshCw className="w-4 h-4" />, onClick: () => { } },
                                                    { label: 'Admin Down', icon: <XCircle className="w-4 h-4 text-red-500" />, onClick: () => { }, danger: true },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Hardware Forensics & Bridge Mapping */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <Card className="glass border-0 shadow-2xl rounded-[3rem] p-8">
                    <CardHeader
                        title="Link Negotiation Metrics"
                        subtitle="Detailed forensic hardware handshake status."
                    />
                    <CardBody className="grid grid-cols-2 gap-6 mt-6">
                        <div className="p-6 rounded-[2rem] bg-neutral-100/50 dark:bg-neutral-800/50 border border-white/5">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">MTU Configuration</p>
                            <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">1500 <span className="text-xs font-bold text-neutral-500">Bytes</span></h4>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-neutral-100/50 dark:bg-neutral-800/50 border border-white/5">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Duplex Handshake</p>
                            <h4 className="text-xl font-black text-emerald-500 uppercase italic tracking-tighter">Full <span className="text-xs font-bold text-neutral-500">Duplex</span></h4>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-neutral-100/50 dark:bg-neutral-800/50 border border-white/5">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Hardware Offloading</p>
                            <h4 className="text-xl font-black text-blue-500 uppercase italic tracking-tighter">Enabled <span className="text-xs font-bold text-neutral-500">L3 HW</span></h4>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-neutral-100/50 dark:bg-neutral-800/50 border border-white/5">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Power Consumption</p>
                            <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">4.2 <span className="text-xs font-bold text-neutral-500">Watts</span></h4>
                        </div>
                    </CardBody>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[3rem] p-8 bg-gradient-to-br from-emerald-600 to-emerald-900 text-white relative overflow-hidden group">
                    <div className="absolute bottom-[-40px] right-[-40px] opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <Zap className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 italic mb-6">Logical Architecture</h4>
                        <Alert variant="info" className="bg-white/10 border-white/10 mb-6 rounded-[2rem]">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                                4 VLANs currently bridged to <span className="text-white font-black underline">bridge-local</span> spanning 6 physical ports.
                            </p>
                        </Alert>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
                                    <span className="text-xs font-black uppercase tracking-tighter">VLAN-10-MGMT</span>
                                </div>
                                <Badge className="bg-white/20 text-white border-0 font-black text-[8px]">PRIMARY</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
                                    <span className="text-xs font-black uppercase tracking-tighter">VLAN-20-CUST</span>
                                </div>
                                <Badge className="bg-white/20 text-white border-0 font-black text-[8px]">ISOLATED</Badge>
                            </div>
                        </div>
                        <Button className="mt-8 h-14 w-full bg-white text-emerald-900 font-black uppercase tracking-widest text-xs rounded-2xl">View Bridge Topology</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
