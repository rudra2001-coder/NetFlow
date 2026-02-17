"use client";

import React, { useState } from "react";
import {
    History, Search, Filter, Download,
    CheckCircle, XCircle, Clock, AlertTriangle,
    MoreVertical, Eye, RotateCcw, Activity,
    Terminal, Globe, Server
} from "lucide-react";
import {
    Card, CardHeader, Button, Badge,
    Select
} from "@/components";

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 ${className || ''}`}>{children}</div>
);

const mockExecutions = [
    {
        id: "EXE-7842-A",
        rule: "Auto-Scale Bandwidth",
        initiator: "System Trigger: Traffic Peak",
        status: "success",
        timestamp: "2 mins ago",
        duration: "1.2s",
        node: "RTR-HQ-01",
        changes: "Queue 'ISP_Fiber' limit-at set to 1G/1G"
    },
    {
        id: "EXE-7841-B",
        rule: "BGP Failover",
        initiator: "System Trigger: Link Down",
        status: "success",
        timestamp: "45 mins ago",
        duration: "2.5s",
        node: "RTR-CORE-02",
        changes: "Routing filter 'bgp-out-primary' disabled"
    },
    {
        id: "EXE-7839-C",
        rule: "Nightly Backup",
        initiator: "Scheduler",
        status: "failed",
        timestamp: "12 hours ago",
        duration: "0.2s",
        node: "RTR-MGMT-SW",
        error: "Connection timeout while requesting export"
    },
    {
        id: "EXE-7838-D",
        rule: "Force Security Update",
        initiator: "Admin: rudra",
        status: "success",
        timestamp: "1 day ago",
        duration: "15s",
        node: "Cluster: Branch Office",
        changes: "Installed routeros-7.14.3.npk"
    }
];

export default function ExecutionsPage() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <History className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Execution Logs</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Forensic history of all automated configurations and system actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                        Export Logs
                    </Button>
                    <Button variant="ghost" className="w-10 h-10 p-0 text-error-500 hover:bg-error-50">
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Runs (24h)", value: "1,284", icon: <Activity className="w-4 h-4" />, color: "text-primary-600" },
                    { label: "Success Rate", value: "99.2%", icon: <CheckCircle className="w-4 h-4" />, color: "text-success-600" },
                    { label: "Avg. Duration", value: "1.4s", icon: <Clock className="w-4 h-4" />, color: "text-warning-600" },
                    { label: "Active Jobs", value: "3", icon: <Terminal className="w-4 h-4" />, color: "text-primary-600" },
                ].map((stat, i) => (
                    <Card key={i} className="glass py-4 px-6">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold dark:text-white">{stat.value}</span>
                            <div className={stat.color}>{stat.icon}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="glass px-0 py-0">
                <CardBody className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select
                            value={filter}
                            onChange={(v) => setFilter(v)}
                            className="w-auto min-w-[140px]"
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "success", label: "Success" },
                                { value: "failed", label: "Failed" }
                            ]}
                        />
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search executions..."
                                className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                        Showing last 100 executions
                    </div>
                </CardBody>
            </Card>

            {/* Timeline Grid */}
            <div className="space-y-4">
                {mockExecutions.map((exe) => (
                    <Card key={exe.id} className="glass hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors group">
                        <CardBody className="p-5">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${exe.status === 'success' ? 'bg-success-500/10 text-success-600' : 'bg-error-500/10 text-error-600'
                                        }`}>
                                        {exe.status === 'success' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-neutral-900 dark:text-white truncate">{exe.rule}</h4>
                                        <span className="text-[10px] font-mono text-neutral-400 py-0.5 px-2 bg-neutral-100 dark:bg-neutral-800 rounded">{exe.id}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5" /> {exe.node}</span>
                                        <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300"><Globe className="w-3.5 h-3.5" /> {exe.initiator}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exe.timestamp}</span>
                                        <span className="font-mono text-neutral-400">{exe.duration}</span>
                                    </div>
                                </div>

                                {/* Content / Result */}
                                <div className="flex-1 lg:max-w-md bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-800 transition-colors">
                                    {exe.status === 'success' ? (
                                        <div className="flex items-start gap-2">
                                            <Terminal className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                                            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 leading-relaxed italic truncate">
                                                {exe.changes}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-error-500 mt-0.5 shrink-0" />
                                            <p className="text-xs font-mono text-error-600 dark:text-error-400 leading-relaxed truncate">
                                                {exe.error}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex lg:flex-col lg:items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0"><Eye className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-primary-500 hover:text-primary-600"><RotateCcw className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="text-center pt-4">
                <Button variant="ghost" className="text-neutral-500 hover:text-primary-600">
                    View Older Executions
                </Button>
            </div>
        </div>
    );
}

// Manual Trash2 import needed
const Trash2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
