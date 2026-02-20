"use client";

import React, { useState } from "react";
import {
    User, Mail, Phone, Shield, Lock, Bell, Moon, Sun,
    Camera, LogOut, CheckCircle2, AlertCircle, History,
    Settings, Globe, Smartphone, Key, Fingerprint, Activity
} from "lucide-react";
import {
    Button, Card, CardBody, CardHeader,
    Input, Badge, Modal, Select, Progress, Toggle
} from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Pro-Level Mock Data
// ============================================================================

const recentActivity = [
    { id: 1, action: "Updated Router Configuration", target: "RTR-CORE-01", time: "12 minutes ago", status: "success" },
    { id: 2, action: "Terminated Active Session", target: "user_pppoe_99", time: "1 hour ago", status: "success" },
    { id: 3, action: "Modified Billing Profile", target: "Business_Pro_50M", time: "3 hours ago", status: "info" },
    { id: 4, action: "System Backup Triggered", target: "Cloud-Storage-B2", time: "Yesterday", status: "warning" },
];

// ============================================================================
// Main Component
// ============================================================================

export default function UserProfileHub() {
    const [isSaving, setIsSaving] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(75);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
            {/* Glass-Identity Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 p-8 shadow-2xl shadow-primary-500/20 group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-full border-4 border-white/30 backdrop-blur-xl overflow-hidden shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500">
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                <User className="w-16 h-16 text-white/80" />
                            </div>
                        </div>
                        <button className="absolute bottom-1 right-1 p-2.5 bg-white rounded-xl text-primary-600 shadow-xl hover:scale-110 transition-transform dark:bg-neutral-800">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">Rudra ISP Admin</h1>
                            <Badge variant="success" className="bg-white/20 text-white border-white/30 backdrop-blur-md rounded-full px-3 py-1 font-black">SUPERADMIN</Badge>
                        </div>
                        <p className="text-white/70 font-medium max-w-md">Orchestating high-speed connectivity and network integrity since 2021.</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors">
                                <Mail className="w-4 h-4 text-white/60" />
                                <span className="text-sm font-bold text-white">admin@netflow.local</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-colors">
                                <Activity className="w-4 h-4 text-white/60" />
                                <span className="text-sm font-bold text-white">Dhaka, BD (UTC+6)</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-3">
                        <Button className="bg-white text-primary-600 hover:bg-white/90 shadow-xl rounded-2xl h-12 px-6 font-black ring-offset-primary-500">
                            Export My Data
                        </Button>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-2xl h-12 px-6 font-black backdrop-blur-md">
                            View API Dashboard
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-400/30 transition-all duration-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Information Hub */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="glass border-0 shadow-2xl relative overflow-hidden">
                        <CardHeader
                            title="Unified Information Hub"
                            subtitle="Manage your primary administrative identity and contact details."
                            action={<Button size="sm" variant="ghost" className="text-primary-500 font-bold hover:bg-primary-50"><History className="w-4 h-4 mr-2" /> Restore Cache</Button>}
                        />
                        <CardBody className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="Full Display Name" defaultValue="NetFlow Administrator" leftIcon={<User className="w-4 h-4" />} className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                <Input label="Administrative Email" defaultValue="admin@netflow.local" leftIcon={<Mail className="w-4 h-4" />} type="email" className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                <Input label="Direct SMS/Support Phone" placeholder="+880 1XXX-XXXXXX" leftIcon={<Phone className="w-4 h-4" />} className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                <Select
                                    label="Administrative Department"
                                    value="eng"
                                    options={[
                                        { value: "eng", label: "Network Engineering" },
                                        { value: "ops", label: "Global Operations" },
                                        { value: "sys", label: "System Architecture" },
                                    ]}
                                    className="h-12"
                                />
                                <div className="col-span-1 md:col-span-2">
                                    <Input label="Short Bio / Support Note" placeholder="Lead system admin responsible for infrastructure scaling..." className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                                <Button variant="outline" className="h-12 px-8 rounded-2xl font-bold border-0 bg-neutral-100 dark:bg-neutral-800">Reset Changes</Button>
                                <Button onClick={handleSave} loading={isSaving} className="h-12 px-10 rounded-2xl font-black shadow-lg shadow-primary-500/20">
                                    Commit Identity Updates
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-2xl overflow-hidden">
                        <CardHeader
                            title="Security Command & Access"
                            subtitle="Enforce credential integrity and manage secure login methods."
                        />
                        <CardBody className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Key className="w-4 h-4 text-primary-500" />
                                        Modify Authentication Keys
                                    </h4>
                                    <div className="space-y-4">
                                        <Input label="Current Administrative Password" type="password" leftIcon={<Shield className="w-4 h-4" />} className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                        <div className="space-y-2">
                                            <Input
                                                label="New Master Password"
                                                type="password"
                                                leftIcon={<Lock className="w-4 h-4" />}
                                                className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50"
                                            />
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Complexity</span>
                                                <span className="text-[10px] font-black text-success-600">STRONG</span>
                                            </div>
                                            <Progress value={passwordStrength} size="sm" variant="success" className="h-1.5" />
                                        </div>
                                        <Input label="Confirm Master Password" type="password" leftIcon={<CheckCircle2 className="w-4 h-4" />} className="h-12 rounded-2xl border-0 bg-neutral-50 dark:bg-neutral-800/50" />
                                    </div>
                                    <Button className="w-full h-12 rounded-2xl font-black shadow-xl shadow-primary-500/10" variant="outline">Update Credentials</Button>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Fingerprint className="w-4 h-4 text-purple-500" />
                                        MFA & Device Binding
                                    </h4>
                                    <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-500/20">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm text-primary-600">
                                                <Smartphone className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black dark:text-white">Authenticator App</p>
                                                <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">Bound to iPhone 15 Pro • dhaka_pop_01</p>
                                            </div>
                                            <Badge variant="success">ACTIVE</Badge>
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full rounded-xl h-10 border-primary-500/30 text-primary-600 font-bold hover:bg-primary-500 hover:text-white transition-all">Re-sync Device</Button>
                                    </div>
                                    <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-700 mt-4">
                                        <p className="text-xs text-neutral-500 text-center font-medium italic">Recovery codes were last generated 4 months ago.</p>
                                        <Button size="sm" variant="ghost" className="w-full mt-2 text-primary-500 font-black">Generate New Codes</Button>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Activity & Prefs */}
                <div className="space-y-8">
                    <Card className="glass border-0 shadow-2xl">
                        <CardHeader
                            title="Interactive Preferences"
                            subtitle="Customize your administrative environment."
                        />
                        <CardBody className="p-6 space-y-5">
                            <div className="space-y-4">
                                <Toggle
                                    label="Dark Interaction"
                                    description="OLED Optimized UI"
                                    defaultChecked
                                    className="p-4 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl transition-all hover:shadow-md border border-neutral-100 dark:border-neutral-700/50"
                                />
                                <Toggle
                                    label="Critical Alerts"
                                    description="Priority Push Events"
                                    defaultChecked
                                    className="p-4 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl transition-all hover:shadow-md border-2 border-primary-500/10"
                                />
                                <Toggle
                                    label="Public Presence"
                                    description="Show Online Status"
                                    className="p-4 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl transition-all hover:shadow-md border border-neutral-100 dark:border-neutral-700/50"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-2xl relative overflow-hidden group">
                        <CardHeader
                            title="Audit Activity Log"
                            subtitle="Registry of your recent terminal and system events."
                        />
                        <CardBody className="p-4 pt-0">
                            <div className="relative">
                                {/* Vertical Timeline Line */}
                                <div className="absolute left-6 top-0 bottom-4 w-[2px] bg-neutral-100 dark:bg-neutral-800" />

                                <div className="space-y-6 relative ml-1 pt-4">
                                    {recentActivity.map((log) => (
                                        <div key={log.id} className="flex gap-4 group/item">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-sm transition-all group-hover/item:scale-110 border-4 border-white dark:border-neutral-900",
                                                log.status === 'success' ? "bg-success-500 text-white" :
                                                    log.status === 'info' ? "bg-primary-500 text-white" : "bg-warning-500 text-white"
                                            )}>
                                                {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                                    log.status === 'info' ? <Activity className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-xs font-black dark:text-white truncate">{log.action}</p>
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap ml-2">{log.time}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter opacity-70">TARGET: {log.target}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary-500 transition-colors py-4">View All Registry Events <ChevronRight className="w-3 h-3 ml-1" /></Button>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-2xl bg-error-50 dark:bg-error-900/10 border-2 border-error-500/10 group overflow-hidden">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-error-500 shadow-xl group-hover:rotate-12 transition-transform">
                                    <LogOut className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-error-600 dark:text-error-400">Session Termination</h4>
                                    <p className="text-[10px] font-bold text-error-600/60 dark:text-error-400/60 uppercase tracking-tighter mt-1">End all active instances</p>
                                </div>
                                <Button variant="ghost" className="h-10 w-10 p-2 rounded-xl text-error-500 hover:bg-error-500 hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
}
