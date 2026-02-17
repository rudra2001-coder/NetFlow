"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Settings as SettingsIcon, Layout, Users, Bell, Shield, Plug,
    Terminal, ChevronRight, RefreshCw
} from "lucide-react";
import { Card, CardBody, Button } from "@/components";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const tabs = [
        { id: "general", label: "General", icon: <Layout className="w-4 h-4" />, href: "/settings/general" },
        { id: "users", label: "User Management", icon: <Users className="w-4 h-4" />, href: "/settings/users" },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, href: "/settings/notifications" },
        { id: "security", label: "Security", icon: <Shield className="w-4 h-4" />, href: "/settings/security" },
        { id: "integrations", label: "Integrations", icon: <Plug className="w-4 h-4" />, href: "/settings/integrations" },
        { id: "advanced", label: "Advanced", icon: <Terminal className="w-4 h-4" />, href: "/settings/advanced" },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                            <SettingsIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">System Settings</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Configure global parameters, manage staff access, and integrate external services.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>Reset</Button>
                    <Button className="glow-primary">Save All Changes</Button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3">
                    <Card className="glass sticky top-24">
                        <CardBody className="p-2">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const isActive = pathname === tab.href || (pathname === "/settings" && tab.id === "general");
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => router.push(tab.href)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20 translate-x-1"
                                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            )}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
