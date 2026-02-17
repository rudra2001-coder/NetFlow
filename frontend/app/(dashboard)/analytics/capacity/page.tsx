"use client";

import React from "react";
import {
    Activity, TrendingUp,
    ShieldAlert, Cpu, Database,
    ArrowRight, Brain, Target,
    Layers, MoreHorizontal
} from "lucide-react";
import {
    Card, Button, Badge, Progress, Alert
} from "@/components";
import {
    ResponsiveContainer, Line, ComposedChart,
    Area
} from "recharts";

const forecastLineData = [
    { month: "Jan", actual: 45, forecast: null, limit: 100 },
    { month: "Feb", actual: 48, forecast: null, limit: 100 },
    { month: "Mar", actual: 55, forecast: null, limit: 100 },
    { month: "Apr", actual: 62, forecast: null, limit: 100 },
    { month: "May", actual: 68, forecast: 72, limit: 100 },
    { month: "Jun", actual: null, forecast: 78, limit: 100 },
    { month: "Jul", actual: null, forecast: 85, limit: 100 },
    { month: "Aug", actual: null, forecast: 92, limit: 100 },
    { month: "Sep", actual: null, forecast: 98, limit: 100 },
    { month: "Oct", actual: null, forecast: 105, limit: 100 },
];

const saturationMetrics = [
    { name: "Core Switch Fabric", current: 68, projected3mo: 85, projected6mo: 110, icon: <Layers className="w-4 h-4" /> },
    { name: "Upstream IP Transit", current: 42, projected3mo: 58, projected6mo: 75, icon: <Activity className="w-4 h-4" /> },
    { name: "DHCP Pool (IPv4)", current: 82, projected3mo: 94, projected6mo: 105, icon: <Database className="w-4 h-4" /> },
    { name: "Edge Router CPU", current: 55, projected3mo: 72, projected6mo: 88, icon: <Cpu className="w-4 h-4" /> },
];

export default function CapacityForecast() {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Predictive Capacity Engine
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Infrastructure lifecycle forecasting</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="info" className="h-11 px-6 rounded-2xl font-black text-[10px] tracking-widest uppercase italic shadow-lg flex items-center gap-2">
                        <Target className="w-4 h-4" /> ML Confidence: 94.2%
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Alert variant="danger" className="bg-red-500/10 border-red-500/20 rounded-[2rem] p-8">
                    <div className="flex items-start gap-6 relative overflow-hidden group w-full">
                        <div className="w-16 h-16 bg-red-500 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-2xl">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-black text-red-600 uppercase italic tracking-tighter mb-2">Saturation Breach Detected</h4>
                            <p className="text-xs font-bold text-red-500/80 uppercase tracking-widest leading-relaxed">
                                DHCP POOL is projected to reach 100% capacity in 42 days.
                            </p>
                            <Button variant="ghost" className="mt-4 p-0 h-auto text-red-600 font-black uppercase tracking-widest text-[9px] hover:bg-transparent flex items-center gap-2">
                                Review Expansion Protocol <ArrowRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </Alert>

                <Alert variant="info" className="bg-indigo-500/10 border-indigo-500/20 rounded-[2rem] p-8">
                    <div className="flex items-start gap-6 relative overflow-hidden group w-full">
                        <div className="w-16 h-16 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-2xl">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-black text-indigo-600 uppercase italic tracking-tighter mb-2">Growth Acceleration</h4>
                            <p className="text-xs font-bold text-indigo-500/80 uppercase tracking-widest leading-relaxed">
                                Core fabric utilization has accelerated by 14% WoW.
                            </p>
                            <Button variant="ghost" className="mt-4 p-0 h-auto text-indigo-600 font-black uppercase tracking-widest text-[9px] hover:bg-transparent flex items-center gap-2">
                                View Forecast <ArrowRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </Alert>
            </div>

            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Saturation Forecast</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={forecastLineData}>
                            <Area type="monotone" dataKey="actual" fill="#3b82f6" fillOpacity={0.1} stroke="none" />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={4} />
                            <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <Card className="lg:col-span-2 glass border-0 shadow-2xl rounded-[3rem] overflow-hidden p-8">
                    <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter mb-6">Component Exhaustion Matrix</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4">Load</th>
                                    <th className="px-6 py-4">+3 Mo</th>
                                    <th className="px-6 py-4">+6 Mo</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {saturationMetrics.map((met, i) => (
                                    <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{met.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-24">
                                                <span className="text-xs font-black dark:text-white">{met.current}%</span>
                                                <Progress value={met.current} className="h-1.5 mt-1" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info" className="rounded-lg px-2 font-black text-[9px] uppercase italic">{met.projected3mo}%</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={met.projected6mo > 100 ? 'error' : 'warning'} className="rounded-lg px-2 font-black text-[9px] uppercase italic">{met.projected6mo}%</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="space-y-8">
                    <Card className="glass border-0 shadow-2xl rounded-[3rem] p-8 bg-indigo-600 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 italic mb-6">Expansion Strategy</h4>
                            <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10 mb-6">
                                <h3 className="text-lg font-black uppercase italic leading-tight">Install 100G Uplink</h3>
                            </div>
                            <Button className="rounded-2xl h-14 w-full bg-white text-indigo-900 font-black uppercase tracking-widest text-xs">Generate RFC</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
