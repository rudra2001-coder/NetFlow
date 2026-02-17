"use client";

import React, { useState } from "react";
import {
    Settings, Plus, Zap, Bell, Shield,
    Play, Pause, Trash2, Edit3,
    ArrowRight, Activity, Cpu, Database
} from "lucide-react";
import {
    Card, CardHeader, Button, Badge,
    Select, Alert
} from "@/components";

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 ${className || ''}`}>{children}</div>
);

const mockRules = [
    {
        id: "RL-102",
        name: "Auto-Scale Bandwidth",
        description: "Temporarily increase bandwidth limit when usage exceeds 90% for 5 mins.",
        trigger: "Traffic Peak",
        action: "Update Simple Queue",
        status: "active",
        lastRun: "45 mins ago",
        category: "Traffic Optimization"
    },
    {
        id: "RL-105",
        name: "Detect BGP Flapping",
        description: "Notify admin and shift traffic to backup if BGP peering flips 3 times in 1 min.",
        trigger: "BGP Event",
        action: "Slack Notification",
        status: "paused",
        lastRun: "3 days ago",
        category: "Reliability"
    },
    {
        id: "RL-108",
        name: "Security Isolation",
        description: "Quarantine clients reaching known command & control IP ranges.",
        trigger: "DNS Log Match",
        action: "Add to Address List",
        status: "active",
        lastRun: "12 hours ago",
        category: "Security"
    }
];

export default function RulesPage() {
    const [rules, setRules] = useState(mockRules);

    const toggleStatus = (id: string) => {
        setRules(rules.map(r =>
            r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
        ));
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Automation Rules</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Define intelligent responses to network events and system triggers.
                    </p>
                </div>
                <Button className="glow-primary" leftIcon={<Plus className="w-4 h-4" />}>
                    Create New Rule
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {rules.map((rule) => (
                    <Card key={rule.id} className="glass flex flex-col h-full hover:shadow-xl transition-all duration-300">
                        <CardBody className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <Badge
                                    variant={rule.status === 'active' ? 'default' : 'info'}
                                    className={rule.status === 'active' ? 'bg-primary-50 text-primary-600 border-primary-100' : ''}
                                >
                                    {rule.category}
                                </Badge>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => toggleStatus(rule.id)}>
                                        {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-success-500" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0"><Edit3 className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{rule.name}</h3>
                            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                                {rule.description}
                            </p>

                            <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 mb-4 font-mono text-xs">
                                <div className="flex items-center gap-1.5 text-primary-600 font-bold shrink-0">
                                    <Shield className="w-3 h-3" /> IF
                                </div>
                                <span className="text-neutral-700 dark:text-neutral-300 truncate">{rule.trigger}</span>
                                <ArrowRight className="w-3 h-3 text-neutral-400" />
                                <div className="flex items-center gap-1.5 text-success-600 font-bold shrink-0">
                                    <Zap className="w-3 h-3" /> THEN
                                </div>
                                <span className="text-neutral-700 dark:text-neutral-300 truncate">{rule.action}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-500 mt-auto pt-4 border-t border-dotted border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" />
                                    Last run: {rule.lastRun}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="default" className="text-[10px] lowercase">{rule.id}</Badge>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Logic Builder Preview */}
            <Card className="glass overflow-hidden">
                <CardHeader
                    title="Rule Builder Preview"
                    subtitle="A visual way to architect complex network logic."
                />
                <CardBody className="pt-0">
                    <div className="p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
                                <Cpu className="w-10 h-10" />
                            </div>
                            <span className="text-sm font-bold dark:text-white text-center">Trigger Phase<br /><span className="text-xs font-normal text-neutral-500">(Event Source)</span></span>
                        </div>

                        <div className="flex items-center gap-1 text-neutral-300">
                            <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-800" />
                            <ArrowRight className="w-4 h-4" />
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-warning-100 dark:bg-warning-900/30 rounded-2xl flex items-center justify-center text-warning-600 shadow-inner">
                                <Database className="w-10 h-10" />
                            </div>
                            <span className="text-sm font-bold dark:text-white text-center">Condition Phase<br /><span className="text-xs font-normal text-neutral-500">(Logic Filter)</span></span>
                        </div>

                        <div className="flex items-center gap-1 text-neutral-300">
                            <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-800" />
                            <ArrowRight className="w-4 h-4" />
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-2xl flex items-center justify-center text-success-600 shadow-inner">
                                <Zap className="w-10 h-10" />
                            </div>
                            <span className="text-sm font-bold dark:text-white text-center">Action Phase<br /><span className="text-xs font-normal text-neutral-500">(Execution)</span></span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Alert variant="info" className="bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30">
                            <div className="flex items-start gap-3">
                                <Bell className="w-5 h-5 text-primary-600 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-primary-900 dark:text-primary-100 mb-1">Advanced Trigger Support</h4>
                                    <p className="text-xs text-primary-700 dark:text-primary-300/80">You can now use Custom Webhooks as triggers for automation rules, allowing external systems to drive network changes.</p>
                                </div>
                            </div>
                        </Alert>
                        <Alert variant="success" className="bg-success-50/50 border-success-100 dark:bg-success-900/10 dark:border-success-900/30">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-success-600 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-success-900 dark:text-success-100 mb-1">Safety Guards Enabled</h4>
                                    <p className="text-xs text-success-700 dark:text-success-300/80">Rules are automatically rate-limited to prevent configuration loops. All changes are logged for forensic audit.</p>
                                </div>
                            </div>
                        </Alert>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
