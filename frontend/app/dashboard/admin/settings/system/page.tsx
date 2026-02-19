"use client";

import React from "react";
import {
    Database, Server, ShieldCheck, Zap,
    Activity, HardDrive, RefreshCw, Lock,
    Eye, AlertTriangle
} from "lucide-react";
import {
    Card, CardBody, CardHeader,
    Button, Badge, Progress, Toggle, Alert
} from "@/components";
import { cn } from "@/lib/utils";

export default function SystemGovernance() {
    const dbMetrics = [
        { label: "Active Pools", value: "8/10", status: "Optimal" },
        { label: "Query Latency", value: "1.2ms", status: "Stable" },
        { label: "Peak Load", value: "12%", status: "Nominal" },
    ];

    const cacheMetrics = [
        { label: "Hit Rate", value: "98.2%", status: "High" },
        { label: "Memory Usage", value: "256MB", status: "Healthy" },
        { label: "Evictions", value: "0/sec", status: "Perfect" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            <Alert variant="info" title="Operational Integrity Protocol">
                The system is currently operating at <b>Tier 1 Efficiency</b>. All critical clusters are reporting healthy heartbeats.
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Database Infrastructure */}
                <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader
                        title="Database Cluster"
                        subtitle="PostgreSQL instance health and query optimization matrix."
                        action={
                            <div className="p-2 bg-success-500/10 text-success-600 rounded-xl">
                                <Database className="w-5 h-5" />
                            </div>
                        }
                    />
                    <CardBody className="space-y-6 p-8">
                        <div className="grid grid-cols-3 gap-4">
                            {dbMetrics.map((m, i) => (
                                <div key={i} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">{m.label}</p>
                                    <p className="text-lg font-black dark:text-white leading-none">{m.value}</p>
                                    <p className="text-[9px] font-bold text-success-600 mt-1 uppercase italic">{m.status}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Storage Capacity</span>
                                <span className="text-xs font-black dark:text-white">45.2 GB / 100 GB</span>
                            </div>
                            <Progress value={45} className="h-2 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-0 glass shadow-lg" leftIcon={<RefreshCw className="w-4 h-4" />}>Optimize Pools</Button>
                            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-0 glass shadow-lg"><Eye className="w-4 h-4" /></Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Redis Cache Persistence */}
                <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader
                        title="Redis Persistence"
                        subtitle="Global session cache and throughput orchestration."
                        action={
                            <div className="p-2 bg-primary-500/10 text-primary-600 rounded-xl">
                                <Zap className="w-5 h-5" />
                            </div>
                        }
                    />
                    <CardBody className="space-y-6 p-8">
                        <div className="grid grid-cols-3 gap-4">
                            {cacheMetrics.map((m, i) => (
                                <div key={i} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">{m.label}</p>
                                    <p className="text-lg font-black dark:text-white leading-none">{m.value}</p>
                                    <p className="text-[9px] font-bold text-primary-600 mt-1 uppercase italic">{m.status}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-primary-900 text-white rounded-2xl flex items-center justify-between shadow-xl shadow-primary-500/20">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Persistent Keys</p>
                                <p className="text-xl font-black italic">14,282 Nodes</p>
                            </div>
                            <HardDrive className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-0 glass shadow-lg" leftIcon={<RefreshCw className="w-4 h-4" />}>Flush Buffers</Button>
                            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-0 glass shadow-lg"><Activity className="w-4 h-4" /></Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Global Matrix & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader
                        title="Security Layer Matrix"
                        subtitle="Global rate limiting and IP orchestration protocols."
                    />
                    <CardBody className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Toggle label="Enhanced Rate Limiting" description="Protect against DDoS via session throttling." defaultChecked />
                            <Toggle label="Geo-IP Isolation" description="Restrict administrative access to specific regions." />
                            <Toggle label="Forensic Payload Logging" description="Record raw HTTP bodies for security audits." />
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-neutral-900 rounded-2xl border border-white/10 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <Lock className="w-5 h-5 text-warning-500" />
                                    <span className="text-sm font-black text-white uppercase italic tracking-widest">Master Key Rotation</span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-bold mb-4 leading-relaxed">Rotate all global encryption keys and force-invalidate every active session.</p>
                                <Button className="w-full rounded-xl bg-warning-600 hover:bg-warning-500 font-black h-11 shadow-lg shadow-warning-600/20">Initialize Rotation</Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-error-500/5 border-error-500/10">
                    <CardHeader
                        title="Emergency Nexus"
                        subtitle="CRITICAL: Read before execution."
                    />
                    <CardBody className="p-8 space-y-6">
                        <div className="p-4 bg-error-500 text-white rounded-2xl shadow-xl shadow-error-500/20 text-center">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
                            <h4 className="text-lg font-black uppercase italic leading-none">Maintenance Lock</h4>
                            <p className="text-[10px] uppercase font-bold opacity-70 mt-1 tracking-widest">Master Kill Switch</p>
                        </div>
                        <p className="text-xs font-bold text-neutral-500 text-center leading-relaxed px-4">
                            Activating Maintenance Mode will disconnect all clients and disable core logic processing.
                        </p>
                        <div className="pt-4 border-t border-error-500/10">
                            <Toggle label="Engage Global Lock" className="text-error-600 font-black uppercase tracking-widest" />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
