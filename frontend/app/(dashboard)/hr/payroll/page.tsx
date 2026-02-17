"use client";

import React from "react";
import {
    CreditCard, DollarSign, TrendingUp, Users,
    Calendar, ArrowUpRight, ArrowDownRight,
    PieChart, BarChart3, Wallet, ShieldCheck,
    Download, RefreshCw, Filter
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress, Alert
} from "@/components";
import { cn } from "@/lib/utils";

export default function PayrollDashboard() {
    const disbursementStats = [
        { label: "Net Disbursement", value: "$442,900.00", change: "+12.5%", trending: "up", color: "primary" },
        { label: "Tax Liability", value: "$88,200.00", change: "+2.1%", trending: "up", color: "error" },
        { label: "Overhead (Ops)", value: "$12,450.00", change: "-4.3%", trending: "down", color: "success" },
        { label: "Retained Earnings", value: "$1.2M", change: "+8.9%", trending: "up", color: "info" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-primary-500" />
                        Payroll Command
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Global Salary Orchestration & Tax Nexus</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-6" leftIcon={<Filter className="w-4 h-4" />}>Cycle: Q1 2026</Button>
                    <Button className="rounded-xl h-11 px-8 font-black bg-primary-600 shadow-xl shadow-primary-500/20 uppercase text-xs tracking-widest" leftIcon={<CreditCard className="w-4 h-4" />}>Run Payroll Hub</Button>
                </div>
            </div>

            {/* Financial Pulse Grit */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {disbursementStats.map((stat, idx) => (
                    <Card key={idx} className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <CardBody className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">{stat.label}</p>
                                <div className={cn(
                                    "p-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-inner",
                                    stat.trending === 'up' ? "bg-success-500/10 text-success-600" : "bg-error-500/10 text-error-600"
                                )}>
                                    {stat.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <h2 className="text-3xl font-black dark:text-white tracking-tighter italic tabular-nums">{stat.value}</h2>
                            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase">Projected Stability</span>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200" />
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Disbursement Timeline */}
                <Card className="lg:col-span-2 glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader
                        title="Disbursement Trajectory"
                        subtitle="Monthly salary flow and tax obligation matrix."
                        action={<Button variant="ghost" size="sm" className="text-primary-500 font-bold uppercase tracking-widest text-[10px]">Matrix Logs</Button>}
                    />
                    <CardBody className="p-8 h-[400px] flex flex-col justify-end">
                        <div className="flex items-end justify-between gap-4 h-full">
                            {[45, 66, 82, 55, 95, 70, 88, 40, 60, 75, 50, 90].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-600/20 to-primary-500 rounded-t-xl group-hover:to-primary-400 transition-all duration-500 cursor-pointer relative"
                                        style={{ height: `${val}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-neutral-900 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                            $ {val * 10}k
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Compliance & Tax Shield */}
                <Card className="glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white border-primary-500/20">
                    <CardBody className="p-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <ShieldCheck className="w-10 h-10 text-primary-500" />
                            <Badge variant="success" className="bg-primary-500 text-white border-0 font-black italic uppercase text-[10px] px-4 py-1">Compliant</Badge>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Tax Infrastructure</h3>
                        <p className="text-xs font-bold text-neutral-500 uppercase leading-relaxed mb-10 tracking-wide">
                            All statutory deductions and corporate contributions are synchronized with Global Revenue Services.
                        </p>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <span>Federal Withholding</span>
                                    <span className="text-primary-400">82%</span>
                                </div>
                                <Progress value={82} className="h-2.5 bg-neutral-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <span>Social Security</span>
                                    <span className="text-success-400">95%</span>
                                </div>
                                <Progress value={95} className="h-2.5 bg-neutral-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <span>Health Pool (Insurance)</span>
                                    <span className="text-blue-400">64%</span>
                                </div>
                                <Progress value={64} className="h-2.5 bg-neutral-800" />
                            </div>
                        </div>

                        <Button className="w-full mt-10 bg-white text-neutral-900 rounded-[1.25rem] h-14 font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary-50 transition-colors" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                            File Quarterly Report
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* Upcoming Cycle Hub */}
            <Card className="glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader
                    title="Active Payroll Cycle"
                    subtitle="February 2026 Batch #004"
                    action={<div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl glass border-0"><RefreshCw className="w-4 h-4 text-neutral-400" /></Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl glass border-0"><Download className="w-4 h-4 text-neutral-400" /></Button>
                    </div>}
                />
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/10 text-neutral-400 text-[11px] font-black uppercase tracking-[0.2em] italic">
                                    <th className="px-8 py-5">Personnel Group</th>
                                    <th className="px-6 py-5">Headcount</th>
                                    <th className="px-6 py-5">Total Gross</th>
                                    <th className="px-6 py-5">Execution Status</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 font-bold">
                                {[
                                    { group: "Engineering-01", count: 42, gross: "$188,400.00", status: "Ready" },
                                    { group: "Field-Operations", count: 128, gross: "$152,900.00", status: "Verifying" },
                                    { group: "Global-Support", count: 85, gross: "$92,100.00", status: "On-Hold" },
                                    { group: "Executive-Tier", count: 12, gross: "$65,000.00", status: "Approved" },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-inner">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{row.group}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm tabular-nums dark:text-neutral-400">{row.count}</td>
                                        <td className="px-6 py-6 text-sm tabular-nums dark:text-white">{row.gross}</td>
                                        <td className="px-6 py-6">
                                            <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'On-Hold' ? 'error' : 'default'} className="rounded-full px-4 font-black uppercase italic text-[9px]">
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] text-primary-500">View Batch</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
