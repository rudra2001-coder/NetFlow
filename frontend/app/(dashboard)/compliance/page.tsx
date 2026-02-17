"use client";

import React from "react";
import {
    Shield, CheckCircle, AlertTriangle, XCircle,
    Info, ArrowRight, Activity, Zap, ShieldCheck,
    Search, Download, RefreshCw
} from "lucide-react";
import {
    Card, CardHeader, Button, Badge,
    Progress, Alert
} from "@/components";

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`p-6 ${className || ''}`}>{children}</div>
);

export default function CompliancePage() {
    const policies = [
        { name: "Router Firmware Isolation", status: "compliant", score: 100, category: "Security" },
        { name: "Public IP Range Audit", status: "warning", score: 85, category: "Network" },
        { name: "Administrative Action Logging", status: "compliant", score: 100, category: "Governance" },
        { name: "Automated Backup Verification", status: "non-compliant", score: 40, category: "Disaster Recovery" },
        { name: "BGP Prefix Filtering", status: "compliant", score: 100, category: "Routing" },
        { name: "Customer Data Encryption", status: "compliant", score: 98, category: "Privacy" },
    ];

    const recentViolations = [
        { id: "V-293", rule: "Unauthorized Port Access", resource: "RTR-HQ-01", time: "2 hours ago", severity: "high" },
        { id: "V-291", rule: "Backup Failure", resource: "S3-STORAGE-NET", time: "5 hours ago", severity: "medium" },
        { id: "V-288", rule: "Untagged VLAN Traffic", resource: "SW-RACK-04", time: "1 day ago", severity: "low" },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Compliance & Health</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Monitor system-wide adherence to security and operational policies.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>Run Scan</Button>
                    <Button className="glow-primary" leftIcon={<Download className="w-4 h-4" />}>Download Audit</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Overall Health Score */}
                <div className="lg:col-span-1">
                    <Card className="glass h-full border-primary-500/20">
                        <CardHeader title="Global Health Score" />
                        <CardBody className="flex flex-col items-center justify-center py-12">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* Visual circle representation */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="96" cy="96" r="88"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        className="text-neutral-100 dark:text-neutral-800"
                                    />
                                    <circle
                                        cx="96" cy="96" r="88"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={552.92}
                                        strokeDashoffset={552.92 * (1 - 0.87)}
                                        className="text-primary-500 transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-neutral-900 dark:text-white">87%</span>
                                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest mt-1">Excellent</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 w-full">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Passing Rules</span>
                                    <span className="font-bold text-success-500">42/48</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Critical Issues</span>
                                    <span className="font-bold text-error-500">0</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Last Scanned</span>
                                    <span className="font-medium text-neutral-900 dark:text-white">15m ago</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                View Full Analysis
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Right: Policy Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {policies.map((policy, i) => (
                            <Card key={i} className="glass group hover:border-primary-500/30 transition-all">
                                <CardBody className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <Badge variant="default" size="sm" className="mb-2">{policy.category}</Badge>
                                            <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">{policy.name}</h4>
                                        </div>
                                        {policy.status === 'compliant' ? (
                                            <CheckCircle className="w-6 h-6 text-success-500" />
                                        ) : policy.status === 'warning' ? (
                                            <AlertTriangle className="w-6 h-6 text-warning-500" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-error-500" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-neutral-500">Status</span>
                                            <span className={
                                                policy.score >= 90 ? 'text-success-500' :
                                                    policy.score >= 70 ? 'text-warning-500' : 'text-error-500'
                                            }>{policy.score}% Compliance</span>
                                        </div>
                                        <Progress value={policy.score} variant={policy.score >= 90 ? 'success' : policy.score >= 70 ? 'warning' : 'danger'} />
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    <Alert variant="info" title="Ongoing Policy Enforcement">
                        <p className="text-sm">The compliance engine is currently background-scanning 12 router configurations for MTU consistency.</p>
                    </Alert>
                </div>
            </div>

            {/* Bottom: Recent Violations & Audit Link */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass">
                    <CardHeader
                        title="Recent Critical Violations"
                        subtitle="Breaches that require immediate administrative review."
                    />
                    <CardBody className="p-0">
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentViolations.map((v) => (
                                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={
                                            `w-10 h-10 rounded-xl flex items-center justify-center ${v.severity === 'high' ? 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400' :
                                                v.severity === 'medium' ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400' :
                                                    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                            }`
                                        }>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">{v.rule}</p>
                                            <p className="text-xs text-neutral-500">{v.resource} • {v.time}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary-500">Resolve</Button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/20 text-center">
                            <Button variant="ghost" size="sm">View All Violations</Button>
                        </div>
                    </CardBody>
                </Card>

                <Card className="glass relative overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary-600/10 to-transparent">
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6 relative">
                        <Zap className="w-8 h-8 text-primary-600 z-10 relative" />
                        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Detailed Audit History</h3>
                    <p className="text-sm text-neutral-500 max-w-sm mb-8">
                        Access the complete forensic timeline of every administrative action,
                        system event, and automation execution throughout your ISP's lifetime.
                    </p>
                    <Button
                        className="glow-primary px-8"
                        onClick={() => window.location.href = '/audit'}
                        leftIcon={<Activity className="w-4 h-4" />}
                    >
                        Open Audit Timeline
                    </Button>
                </Card>
            </div>
        </div>
    );
}
