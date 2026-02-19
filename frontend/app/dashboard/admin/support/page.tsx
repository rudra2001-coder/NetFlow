"use client";

import React from "react";
import {
    HelpCircle, Activity, Clock, CheckCircle2,
    AlertCircle, TrendingUp, Users, Target,
    Zap, Ghost, ShieldAlert, ArrowUpRight,
    MessageSquare, BarChart3
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress
} from "@/components";
import { cn } from "@/lib/utils";

export default function SupportDashboard() {
    const mainStats = [
        { label: "Active Tickets", value: "84", change: "+12", status: "Open", color: "indigo" },
        { label: "Resolved Today", value: "156", change: "+45", status: "Success", color: "success" },
        { label: "Critical Priority", value: "08", change: "-02", status: "Danger", color: "error" },
        { label: "Avg SLA Time", value: "14m", change: "-03m", status: "Warning", color: "warning" },
    ];

    const departmentStatus = [
        { dept: "Network Core", load: 85, tickets: 32, status: "Critical" },
        { dept: "Billing/Accounts", load: 42, tickets: 12, status: "Healthy" },
        { dept: "Field Services", load: 68, tickets: 24, status: "Moderate" },
        { dept: "General Support", load: 30, tickets: 16, status: "Healthy" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-indigo-500" />
                        Support Pulse
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Real-time SLA tracking & ticket orchestration</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-6" leftIcon={<Clock className="w-4 h-4" />}>SLA Matrix</Button>
                    <Button className="rounded-xl h-11 px-8 font-black bg-indigo-600 shadow-xl shadow-indigo-500/20 uppercase text-xs tracking-widest" leftIcon={<Zap className="w-4 h-4" />}>Live Monitor</Button>
                </div>
            </div>

            {/* Support Grit */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, idx) => (
                    <Card key={idx} className="glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardBody className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">{stat.label}</p>
                                <Badge variant={stat.status === 'Success' ? 'success' : stat.status === 'Danger' ? 'error' : stat.status === 'Warning' ? 'warning' : 'default'} className="rounded-full px-3 font-black uppercase italic text-[8px]">
                                    {stat.change}
                                </Badge>
                            </div>
                            <h2 className="text-4xl font-black dark:text-white tracking-tighter italic tabular-nums">{stat.value}</h2>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-100 flex items-center justify-center">
                                            <Users className="w-3 h-3 text-neutral-400" />
                                        </div>
                                    ))}
                                </div>
                                <Activity className={cn("w-5 h-5 opacity-20", `text-${stat.color}-500`)} />
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SLA Trajectory */}
                <Card className="lg:col-span-2 glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader
                        title="Resolution Trajectory"
                        subtitle="Real-time ticket lifecycle analytics."
                        action={<div className="flex items-center gap-2">
                            <Badge variant="status" status="online" className="font-black italic text-[9px] uppercase px-4 ring-1 ring-success-500/20">Live Feed</Badge>
                        </div>}
                    />
                    <CardBody className="p-10 h-[400px] flex flex-col justify-end">
                        <div className="flex items-end justify-between gap-6 h-full">
                            {[65, 45, 82, 35, 95, 55, 70, 88, 40, 60, 75, 90].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-[1rem] group-hover:to-indigo-400 transition-all duration-700 cursor-pointer relative shadow-lg shadow-indigo-500/10"
                                        style={{ height: `${val}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-neutral-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl">
                                            {val} Res.
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">{idx + 1}H</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Dept Load Matrix */}
                <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white">
                    <CardBody className="p-10 flex flex-col h-full">
                        <Target className="w-12 h-12 text-indigo-500 mb-6" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Departmental Heat</h3>
                        <p className="text-xs font-bold text-neutral-500 uppercase leading-relaxed mb-10 tracking-wide">
                            Active workload distribution across specialized support units.
                        </p>

                        <div className="space-y-8 flex-1">
                            {departmentStatus.map((dept, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">{dept.dept}</p>
                                            <p className="text-xs font-bold text-white mt-1 italic">{dept.tickets} Active Tickets</p>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase italic px-3 py-1 rounded-lg",
                                            dept.status === 'Critical' ? "bg-error-500 text-white" : "bg-success-500/20 text-success-500"
                                        )}>{dept.status}</span>
                                    </div>
                                    <Progress value={dept.load} className="h-2 bg-neutral-800" />
                                </div>
                            ))}
                        </div>

                        <Button className="w-full mt-12 bg-white text-neutral-900 rounded-[1.5rem] h-14 font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-indigo-50 transition-colors" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                            Rebalance Tasks
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* Emergency & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 glass border-0 shadow-2xl rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-error-500" />
                    <div className="w-20 h-20 bg-error-500/10 rounded-[2rem] flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-10 h-10 text-error-500 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <Badge variant="error" className="font-black italic text-[9px] uppercase px-4 mb-2">Security Breach Protocol</Badge>
                            <h3 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">Emergency Escalation Logic</h3>
                            <p className="text-sm font-bold text-neutral-500 leading-relaxed max-w-xl">
                                System detected 14 failed login attempts from IP <span className="text-error-500 font-black italic">142.12.99.04</span>. Escalating to Security Tier-1 automatically.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button className="bg-error-500 text-white font-black uppercase italic text-xs tracking-widest px-8 h-12 rounded-2xl shadow-xl shadow-error-500/20">Lock Identity</Button>
                            <Button variant="outline" className="glass border-0 font-black uppercase italic text-xs tracking-widest px-8 h-12 rounded-2xl">Dismiss Log</Button>
                        </div>
                    </div>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[3rem] p-10 flex flex-col justify-center text-center space-y-6">
                    <div className="w-16 h-16 bg-indigo-500 rounded-[1.8rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Support Feedback</h4>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 px-6">92% satisfaction rate in last 24H cycles.</p>
                    </div>
                    <Button variant="ghost" className="text-indigo-500 font-black uppercase italic text-xs tracking-[0.2em]">View Reviews</Button>
                </Card>
            </div>
        </div>
    );
}
