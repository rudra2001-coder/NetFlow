"use client";

import React, { useState } from "react";
import {
    Activity, Terminal, Mail, Plug, Plus,
    ExternalLink, RefreshCw, Zap, Globe,
    MessageSquare, ShieldCheck, Wifi,
    ArrowUpRight, Smartphone, BarChart2
} from "lucide-react";
import { Card, CardBody, Badge, Button, Input, Alert } from "@/components";
import { cn } from "@/lib/utils";

export default function IntegrationSettings() {
    const [testingId, setTestingId] = useState<string | null>(null);

    const integrations = [
        {
            id: 'mk',
            name: "MikroTik Core API",
            desc: "Primary backbone communication for subscriber orchestration.",
            icon: <Activity className="w-6 h-6 text-primary-500" />,
            status: "Connected",
            metrics: { latency: "12ms", uptime: "99.9%", load: "Low" }
        },
        {
            id: 'slack',
            name: "Slack Notify",
            desc: "High-priority incident propagation to administrative channels.",
            icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
            status: "Disconnected",
            metrics: { latency: "-", uptime: "0%", load: "-" }
        },
        {
            id: 'mail',
            name: "SMTP Relay",
            desc: "Transactional email delivery for invoices and alerts.",
            icon: <Mail className="w-6 h-6 text-blue-500" />,
            status: "Configured",
            metrics: { latency: "145ms", uptime: "100%", load: "Optimal" }
        },
        {
            id: 'hook',
            name: "Bilateral Webhooks",
            desc: "Push event triggers to downstream automation systems.",
            icon: <Plug className="w-6 h-6 text-teal-500" />,
            status: "Active",
            metrics: { latency: "88ms", uptime: "98.5%", load: "High" }
        },
        {
            id: 'sms',
            name: "SMS Gateway",
            desc: "OTP and emergency broadcast delivery service.",
            icon: <Smartphone className="w-6 h-6 text-orange-500" />,
            status: "Configured",
            metrics: { latency: "2s", uptime: "95.2%", load: "Low" }
        },
        {
            id: 'mon',
            name: "Prometheus OSS",
            desc: "Time-series data aggregation and metric storage.",
            icon: <BarChart2 className="w-6 h-6 text-error-500" />,
            status: "Connected",
            metrics: { latency: "5ms", uptime: "100%", load: "Low" }
        },
    ];

    const handleTest = (id: string) => {
        setTestingId(id);
        setTimeout(() => setTestingId(null), 2000);
    };

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                        <Plug className="w-6 h-6 text-primary-500" />
                        Integrations Hub
                    </h3>
                    <p className="text-sm font-bold text-neutral-500">Orchestrate third-party connectivity and external data streams.</p>
                </div>
                <Button variant="outline" className="rounded-xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-6" rightIcon={<ExternalLink className="w-4 h-4" />}>Browse SDKs</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((svc) => (
                    <Card key={svc.id} className="glass border-0 shadow-lg group hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
                        {svc.status === 'Connected' && (
                            <div className="absolute top-0 right-0 p-1 bg-success-500 text-white rounded-bl-xl shadow-lg animate-pulse">
                                <Wifi className="w-3 h-3" />
                            </div>
                        )}
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-3xl group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-inner">
                                    {svc.icon}
                                </div>
                                <Badge
                                    variant={svc.status === 'Connected' || svc.status === 'Active' ? 'success' : 'default'}
                                    className="rounded-full px-3 font-black uppercase italic text-[9px]"
                                >
                                    {svc.status}
                                </Badge>
                            </div>

                            <h4 className="text-lg font-black dark:text-white mb-2 uppercase tracking-tight">{svc.name}</h4>
                            <p className="text-xs font-bold text-neutral-500 leading-relaxed mb-6 h-12 overflow-hidden">{svc.desc}</p>

                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {Object.entries(svc.metrics).map(([key, val], idx) => (
                                    <div key={idx} className="p-2 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-700 text-center">
                                        <p className="text-[8px] font-black uppercase text-neutral-400 leading-none mb-1">{key}</p>
                                        <p className="text-[10px] font-black dark:text-white">{val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="flex-1 rounded-xl h-10 border-0 glass shadow-lg font-bold">Manage</Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-10 px-4 rounded-xl font-black text-primary-500 hover:bg-primary-500 hover:text-white transition-all",
                                        testingId === svc.id && "animate-spin cursor-not-allowed pointer-events-none"
                                    )}
                                    onClick={() => handleTest(svc.id)}
                                >
                                    {testingId === svc.id ? <RefreshCw className="w-4 h-4" /> : "Test"}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                <Card className="glass border-dashed border-2 border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem] group hover:border-primary-500 transition-colors">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        <Plus className="w-8 h-8 text-neutral-400 group-hover:text-primary-500" />
                    </div>
                    <h4 className="font-black dark:text-white uppercase tracking-tighter italic">Expand Cluster</h4>
                    <p className="text-[10px] font-bold text-neutral-500 max-w-[180px] mt-2 leading-snug">Attach advanced monitoring or payment adapters to your core logic engine.</p>
                    <Button variant="ghost" className="mt-6 text-primary-500 font-black uppercase tracking-widest text-xs" rightIcon={<ArrowUpRight className="w-4 h-4" />}>Marketplace</Button>
                </Card>
            </div>
        </div>
    );
}


