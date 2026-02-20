"use client";

import React from "react";
import {
    BarChart3, Target, ShieldCheck, Activity,
    Trophy, Users, Zap, Clock,
    CheckCircle2, AlertCircle, TrendingUp,
    Star, Flame, ArrowUpRight, ArrowDownRight,
    PieChart, Brain
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress, Avatar
} from "@/components";
import { cn } from "@/lib/utils";

export default function StaffPerformance() {
    const leaderBoard = [
        { id: "E1", name: "John Wick", rank: 1, resolved: 245, rating: 4.9, status: "A+", trend: 'up' },
        { id: "E2", name: "Sarah Connor", rank: 2, resolved: 212, rating: 4.8, status: "A", trend: 'up' },
        { id: "E3", name: "Elliot Alderson", rank: 3, resolved: 198, rating: 4.7, status: "A", trend: 'down' },
        { id: "E4", name: "Ada Lovelace", rank: 4, resolved: 176, rating: 4.9, status: "A+", trend: 'up' },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-500" />
                        Staff Intel Matrix
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Resolution metrics & personnel efficiency tracking</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-6" leftIcon={<Trophy className="w-4 h-4" />}>Rewards Hub</Button>
                    <Button className="rounded-xl h-11 px-8 font-black bg-indigo-600 shadow-xl shadow-indigo-500/20 uppercase text-xs tracking-widest" leftIcon={<Brain className="w-4 h-4" />}>AI Review</Button>
                </div>
            </div>

            {/* Performance Grit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Leaderboard */}
                <Card className="md:col-span-2 glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader
                        title="Resolution Elite"
                        subtitle="Top-performing agents by ticket clearance."
                        action={<Badge variant="info" className="rounded-full px-4 font-black uppercase italic text-[10px]">Leaderboard Live</Badge>}
                    />
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-400 text-[11px] font-black uppercase tracking-[0.2em] italic">
                                        <th className="px-10 py-6">Identity Unit</th>
                                        <th className="px-6 py-6">Cleared Tickets</th>
                                        <th className="px-6 py-6">Satisfaction Sat.</th>
                                        <th className="px-6 py-6">Grade Matrix</th>
                                        <th className="px-10 py-6 text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-bold">
                                    {leaderBoard.map((agent, idx) => (
                                        <tr key={agent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-black italic text-indigo-500 text-lg tabular-nums">#0{agent.rank}</div>
                                                    <Avatar name={agent.name} className="h-10 w-10 rounded-xl" />
                                                    <span className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm tabular-nums dark:text-white">{agent.resolved}</td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-warning-500 fill-warning-500" />
                                                    <span className="text-xs font-black dark:text-white">{agent.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <Badge variant="info" className="rounded-xl px-4 font-black uppercase italic text-[10px] bg-indigo-500/10 text-indigo-500 border-0">{agent.status}</Badge>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {agent.trend === 'up' ? <ArrowUpRight className="w-5 h-5 text-success-500 float-right" /> : <ArrowDownRight className="w-5 h-5 text-error-500 float-right" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {/* Efficiency Stats */}
                <div className="space-y-6">
                    <Card className="glass border-0 shadow-2xl rounded-[3rem] p-10 flex flex-col justify-center text-center space-y-4 bg-gradient-to-br from-indigo-600/10 to-transparent">
                        <Flame className="w-12 h-12 text-error-500 mx-auto animate-bounce" />
                        <h4 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">Velocity Peak</h4>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-4 leading-relaxed">System handled 2.4x more load than last cycle.</p>
                        <div className="pt-6">
                            <h2 className="text-5xl font-black dark:text-white tabular-nums italic tracking-tighter">98.4%</h2>
                            <p className="text-[10px] font-black text-success-500 uppercase italic mt-1">Efficiency Delta</p>
                        </div>
                    </Card>

                    <Card className="glass border-0 shadow-2xl rounded-[3rem] p-10 relative overflow-hidden group">
                        <PieChart className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/10 group-hover:scale-125 transition-transform" />
                        <div className="relative z-10">
                            <h4 className="text-lg font-black dark:text-white uppercase italic tracking-tighter mb-8">Workload Distribution</h4>
                            <div className="space-y-6">
                                {[
                                    { label: "Critical Resolve", value: 84, color: "error" },
                                    { label: "Feature Requests", value: 62, color: "success" },
                                    { label: "Account Support", value: 34, color: "info" },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                            <span>{item.label}</span>
                                            <span className={`text-${item.color}-500`}>{item.value}%</span>
                                        </div>
                                        <Progress value={item.value} className="h-1.5 bg-neutral-100 dark:bg-neutral-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Resolution History / Forensic Audit */}
            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader
                    title="Forensic Resolution History"
                    subtitle="Immutable record of closed tickets and solved protocols."
                    action={<div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-9 border-0 glass text-[9px] font-black uppercase tracking-widest px-4">Export Log</Button>
                    </div>}
                />
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-400 text-[11px] font-black uppercase tracking-[0.2em] italic border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-10 py-6">Ticket</th>
                                    <th className="px-6 py-6">Resolved By</th>
                                    <th className="px-6 py-6">Duration</th>
                                    <th className="px-6 py-6">Methodology</th>
                                    <th className="px-10 py-6 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: "TKT-4075", title: "API Gateway 502", solver: "John Wick", duration: "18m", method: "Redundant Path Config", verification: "Automated" },
                                    { id: "TKT-4072", title: "IP Pool Exhaustion", solver: "Sarah Connor", duration: "45m", method: "Subnet Expansion", verification: "Manual" },
                                    { id: "TKT-4069", title: "MAC Auth Failure", solver: "Elliot Alderson", duration: "12m", method: "Cache Purge", verification: "Automated" },
                                ].map((log, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all border-b border-neutral-100 dark:border-neutral-800">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black dark:text-white uppercase italic">{log.title}</span>
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{log.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <Avatar name={log.solver} size="xs" className="h-6 w-6 rounded-lg" />
                                                <span className="text-xs font-black dark:text-white uppercase italic">{log.solver}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-xs font-black tabular-nums italic text-neutral-400">{log.duration}</td>
                                        <td className="px-6 py-6">
                                            <Badge variant="default" className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1 font-black text-[9px] uppercase italic text-neutral-500">{log.method}</Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <Badge variant="success" className="rounded-full px-4 font-black uppercase italic text-[8px]">{log.verification}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* AI Review Engine unchanged */}
            <Card className="glass border-0 shadow-2xl rounded-[4rem] p-12 flex flex-col md:flex-row items-center gap-12 bg-neutral-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5">
                    <Zap className="w-64 h-64" />
                </div>
                <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-500/40 relative">
                    <Brain className="w-16 h-16 text-white" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success-500 rounded-2xl flex items-center justify-center border-4 border-neutral-900 shadow-xl">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                    <div>
                        <Badge variant="info" className="bg-indigo-500 text-white border-0 font-black italic uppercase text-[10px] px-6 py-1.5 mb-4">AI Orchestration</Badge>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4">Synthetic Performance Audit</h3>
                        <p className="text-xs font-bold text-neutral-400 uppercase leading-relaxed max-w-2xl tracking-wide">
                            The system is analyzing resolution quality and customer sentiment using Natural Language Processing. Current staff morale projection is <span className="text-success-500 font-black italic underline decoration-2 underline-offset-4">OPTIMAL</span>.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Button className="bg-white text-neutral-900 font-black uppercase italic text-xs tracking-widest px-10 h-14 rounded-[2rem] shadow-2xl hover:bg-indigo-50">Generate Report</Button>
                        <Button variant="outline" className="border-primary-500/20 glass text-white font-black uppercase italic text-xs tracking-widest px-10 h-14 rounded-[2rem]">Protocol Settings</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
