"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Settings as SettingsIcon, Layout, Users, Bell, Shield, Plug,
    Terminal, ChevronRight, RefreshCw, Activity, Database, Server, Cpu
} from "lucide-react";
import { Card, CardBody, Button, Badge } from "@/components";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { id: "general", label: "General", icon: <Layout className="w-4 h-4" />, href: "/settings/general" },
        { id: "users", label: "User Management", icon: <Users className="w-4 h-4" />, href: "/settings/users" },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, href: "/settings/notifications" },
        { id: "security", label: "Security & Forensic", icon: <Shield className="w-4 h-4" />, href: "/settings/security" },
        { id: "integrations", label: "Integrations Hub", icon: <Plug className="w-4 h-4" />, href: "/settings/integrations" },
        { id: "system", label: "System Governance", icon: <Activity className="w-4 h-4" />, href: "/settings/system" },
        { id: "advanced", label: "Advanced Dev", icon: <Terminal className="w-4 h-4" />, href: "/settings/advanced" },
    ];

    const healthMetrics = [
        { label: "Database", status: "Optimal", color: "success", icon: <Database className="w-3 h-3" />, value: "1.2ms" },
        { label: "Redis Cache", status: "98% Hit", color: "success", icon: <Server className="w-3 h-3" />, value: "0.4ms" },
        { label: "API Gateway", status: "Stable", color: "success", icon: <Activity className="w-3 h-3" />, value: "45ms" },
        { label: "Logic Engine", status: "Healthy", color: "primary", icon: <Cpu className="w-3 h-3" />, value: "8%" },
    ];

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-neutral-900 text-white rounded-[2rem] shadow-2xl shadow-neutral-900/20 group hover:scale-110 transition-transform cursor-pointer">
                        <SettingsIcon className="w-8 h-8 group-hover:rotate-90 transition-transform duration-700" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">System Governance</h1>
                            <Badge variant="info" className="rounded-full bg-primary-500/10 text-primary-600 border-0 font-black italic px-3">SUPERADMIN</Badge>
                        </div>
                        <p className="text-sm font-bold text-neutral-500 max-w-xl leading-snug">
                            Master control nexus for global parameters, security forensic oversight, and network integration orchestration.
                        </p>
                    </div>
                </div>

                {/* Health Discovery Ticker */}
                <Card className="glass border-0 shadow-xl overflow-hidden min-w-[320px] lg:min-w-[450px]">
                    <CardBody className="p-1 px-4 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
                        {healthMetrics.map((metric, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 shrink-0">
                                <div className={cn(
                                    "p-1.5 rounded-lg flex items-center justify-center",
                                    metric.color === 'success' ? 'bg-success-500/10 text-success-600' : 'bg-primary-500/10 text-primary-600'
                                )}>
                                    {metric.icon}
                                </div>
                                <div className="flex flex-col min-w-[70px]">
                                    <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">{metric.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black dark:text-white">{metric.status}</span>
                                        <span className="text-[10px] font-bold text-neutral-400 italic">({metric.value})</span>
                                    </div>
                                </div>
                                {i < healthMetrics.length - 1 && <div className="w-[1px] h-6 bg-neutral-100 dark:bg-neutral-800" />}
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3">
                    <div className="sticky top-24 space-y-4">
                        <Card className="glass border-0 shadow-2xl p-2 rounded-[2rem] overflow-hidden">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const isActive = pathname === tab.href || (pathname === "/settings" && tab.id === "general");
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => router.push(tab.href)}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black transition-all duration-300 group",
                                                isActive
                                                    ? "bg-neutral-900 text-white shadow-2xl shadow-neutral-900/30 scale-[1.02] z-10"
                                                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                isActive ? "bg-white/10 text-white" : "bg-neutral-100 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700"
                                            )}>
                                                {React.cloneElement(tab.icon as React.ReactElement, { className: "w-5 h-5" })}
                                            </div>
                                            <span className="uppercase tracking-widest">{tab.label}</span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-6 bg-primary-500 rounded-full animate-glow" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Quick Auth Info */}
                        <div className="p-6 bg-primary-600 rounded-[2rem] shadow-xl shadow-primary-500/20 text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-70">Session Health</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span className="text-sm font-black italic">Encrypted Secure Socket</span>
                            </div>
                            <p className="text-[10px] mt-2 font-bold opacity-60">Last sync: Just now via TLS 1.3</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-8 animate-slideUp">
                    {children}
                </div>
            </div>
        </div>
    );
}
