"use client";

import React, { useState } from "react";
import {
    FileText, Plus, Search, Filter, Copy,
    Trash2, Edit3, Share2, Code, Zap,
    CheckCircle, Clock, Server, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card, CardHeader, Button, Badge,
    Select, StatCard
} from "@/components";

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 ${className || ''}`}>{children}</div>
);

const mockTemplates = [
    {
        id: "TPL-001",
        name: "Enterprise Firewall Base",
        type: "Security",
        lastUsed: "2 hours ago",
        routers: 12,
        version: "v2.4",
        content: "add chain=forward action=drop connection-state=invalid comment=\"drop invalid connections\"\nadd chain=input action=accept protocol=icmp comment=\"allow icmp\"\nadd chain=input action=accept connection-state=established,related comment=\"allow established/related\""
    },
    {
        id: "TPL-002",
        name: "VoIP Priority QoS",
        type: "Performance",
        lastUsed: "1 day ago",
        routers: 45,
        version: "v1.8",
        content: "/queue tree\nadd name=VoIP_Priority parent=global priority=1 packet-mark=voip_packets\nadd name=Other_Traffic parent=global priority=8 packet-mark=no-mark"
    },
    {
        id: "TPL-003",
        name: "BGP Peer Optimization",
        type: "Routing",
        lastUsed: "5 mins ago",
        routers: 4,
        version: "v3.1",
        content: "/routing bgp peer\nset [find name=upstream] out-filter=bgp-out-primary in-filter=bgp-in-primary\nset [find name=backup] out-filter=bgp-out-backup in-filter=bgp-in-backup"
    }
];

export default function TemplatesPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Configuration Templates</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Reusable Mikrotik configuration logic and boilerplates for your fleet.
                    </p>
                </div>
                <Button className="glow-primary" leftIcon={<Plus className="w-4 h-4" />}>
                    New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Template List & Filters */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass px-0 py-0">
                        <CardBody className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <div className="space-y-4">
                        {mockTemplates.map((tpl) => (
                            <Card
                                key={tpl.id}
                                className={cn(
                                    "glass cursor-pointer transition-all border-l-4",
                                    selectedTemplate.id === tpl.id ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10" : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                                )}
                                onClick={() => setSelectedTemplate(tpl)}
                            >
                                <CardBody className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="default" size="sm">{tpl.type}</Badge>
                                        <span className="text-[10px] font-mono text-neutral-400">{tpl.id}</span>
                                    </div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{tpl.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <Server className="w-3 h-3" /> {tpl.routers} Routers
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {tpl.lastUsed}
                                        </span>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right: Template Details & Preview */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedTemplate && (
                        <Card className="glass overflow-hidden shadow-2xl">
                            <CardHeader
                                title={selectedTemplate.name}
                                subtitle={`Version ${selectedTemplate.version} • Created by Admin`}
                                action={
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0"><Edit3 className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0"><Copy className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-error-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                }
                            />
                            <CardBody className="space-y-6 pt-0">
                                {/* Code Editor Preview */}
                                <div className="relative group">
                                    <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                                            <Share2 className="w-3.5 h-3.5 mr-1" /> Compare
                                        </Button>
                                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg">
                                            <Zap className="w-3.5 h-3.5 mr-1" /> Deploy
                                        </Button>
                                    </div>
                                    <div className="bg-neutral-950 rounded-xl p-6 font-mono text-sm overflow-x-auto border border-neutral-800 shadow-inner">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                            </div>
                                            <span className="text-neutral-500 text-xs ml-2">mikrotik_script.rsc</span>
                                        </div>
                                        <pre className="text-emerald-400 leading-relaxed">
                                            {selectedTemplate.content}
                                        </pre>
                                    </div>
                                </div>

                                {/* Assignment Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Active Deployments</p>
                                        <div className="flex items-center gap-2">
                                            <Server className="w-4 h-4 text-primary-500" />
                                            <span className="text-xl font-bold dark:text-white">{selectedTemplate.routers}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Success Rate</p>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-success-500" />
                                            <span className="text-xl font-bold dark:text-white">99.8%</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Complexity</p>
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-warning-500" />
                                            <span className="text-xl font-bold dark:text-white">Medium</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Deployment History</h5>
                                    <div className="space-y-3">
                                        {[
                                            { node: "RTR-HQ-01", status: "success", time: "2h ago" },
                                            { node: "RTR-BRANCH-04", status: "success", time: "5h ago" },
                                            { node: "RTR-MGMT-SW", status: "failed", time: "1d ago" },
                                        ].map((h, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${h.status === 'success' ? 'bg-success-500' : 'bg-error-500'}`} />
                                                    <span className="dark:text-neutral-300 font-medium">{h.node}</span>
                                                </div>
                                                <span className="text-neutral-500 text-xs">{h.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
