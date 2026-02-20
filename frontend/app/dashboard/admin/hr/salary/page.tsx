"use client";

import React from "react";
import {
    Tag, Layers, Settings2, ShieldCheck,
    ArrowUpRight, Info, Plus, ChevronRight,
    TrendingUp, Calculator, PieChart, Wallet,
    CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress, Toggle,
    Select, Alert
} from "@/components";
import { cn } from "@/lib/utils";

export default function SalaryMatrix() {
    const payGrades = [
        { grade: "Grade A+", base: "$12,000 - $25,000", components: 12, employees: 8, status: "Active", color: "primary" },
        { grade: "Grade A", base: "$8,000 - $11,999", components: 10, employees: 24, status: "Active", color: "indigo" },
        { grade: "Grade B+", base: "$5,000 - $7,999", components: 8, employees: 42, status: "Active", color: "purple" },
        { grade: "Grade B", base: "$3,000 - $4,999", components: 6, employees: 128, status: "Review", color: "neutral" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Layers className="w-8 h-8 text-primary-500" />
                        Salary Structure Matrix
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Definition of pay grades and global compensation logic</p>
                </div>
                <Button className="rounded-2xl h-11 px-8 font-black bg-primary-600 shadow-2xl shadow-primary-500/20 uppercase text-xs tracking-widest" leftIcon={<Plus className="w-4 h-4" />}>Define New Grade</Button>
            </div>

            {/* Matrix Core Grit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pay Grade Navigation */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {payGrades.map((grade, idx) => (
                        <Card key={idx} className="glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                            <CardBody className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "p-4 rounded-3xl shadow-inner",
                                        grade.color === 'primary' ? "bg-primary-500/10 text-primary-500" :
                                            grade.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500" :
                                                "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                    )}>
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <Badge variant={grade.status === 'Active' ? 'success' : 'default'} className="rounded-full px-3 font-black uppercase italic text-[9px]">{grade.status}</Badge>
                                </div>
                                <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter mb-2">{grade.grade}</h3>
                                <p className="text-sm font-black text-neutral-400 italic mb-6">Base Range: <span className="dark:text-white tabular-nums">{grade.base}</span></p>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800/50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none mb-1">Components</p>
                                        <p className="text-sm font-black dark:text-white">{grade.components} Items</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none mb-1">Adherents</p>
                                        <p className="text-sm font-black dark:text-white">{grade.employees} Personnel</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Global Orchestration Control */}
                <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-primary-950 text-white relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Calculator className="w-32 h-32" />
                    </div>
                    <CardBody className="p-10 flex flex-col h-full relative z-10">
                        <Sparkles className="w-10 h-10 text-primary-400 mb-6" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Calculation Engine</h3>
                        <p className="text-xs font-bold text-primary-200/60 uppercase leading-relaxed mb-10 tracking-wide">
                            Configure global parameters for taxes, insurance, and retirement contributions across all grades.
                        </p>

                        <div className="space-y-8 flex-1">
                            <div className="space-y-4">
                                <Toggle label="Statutory PF Enforce" description="Mandatory 12% contribution." defaultChecked />
                                <Toggle label="Professional Tax (Tiered)" description="State-mandated calculation." defaultChecked />
                                <Toggle label="HRA Automation" description="Auto-calculate 40% of Basic." />
                            </div>

                            <div className="pt-6 border-t border-primary-500/20">
                                <label className="text-[10px] font-black uppercase text-primary-400 tracking-widest mb-4 block">Regional Tax Scale</label>
                                <Select
                                    options={[{ value: 'std', label: 'STANDARD (15.5%)' }, { value: 'prm', label: 'PREMIUM (18.2%)' }]}
                                    className="bg-primary-900 border-primary-800 text-white"
                                />
                            </div>
                        </div>

                        <Button className="w-full mt-12 bg-white text-primary-950 rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary-50 transition-colors">
                            Apply Global Sync
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* Allowance Hub */}
            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader
                    title="Component Definitions"
                    subtitle="Detailed breakdown of all earnings and deductions."
                    action={<Button variant="outline" size="sm" className="rounded-xl border-0 glass font-black uppercase text-[10px] tracking-widest" leftIcon={<Settings2 className="w-3 h-3" />}>Manage Rules</Button>}
                />
                <CardBody className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Earnings */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase text-success-500 italic tracking-widest">
                                <TrendingUp className="w-4 h-4" /> Earnings Cluster
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { name: "Basic Salary", type: "Fixed", percent: 50 },
                                    { name: "HRA", type: "% of Basic", percent: 40 },
                                    { name: "Special Allowance", type: "Variable", percent: 10 },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-100 dark:border-neutral-800 group hover:border-success-500/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black dark:text-white uppercase italic">{item.name}</span>
                                            <Badge variant="default" className="text-[8px] font-black uppercase rounded-lg">{item.type}</Badge>
                                        </div>
                                        <Progress value={item.percent} className="h-1 bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase text-error-500 italic tracking-widest">
                                <PieChart className="w-4 h-4" /> Deduction Matrix
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { name: "Provident Fund", type: "Statutory", percent: 12 },
                                    { name: "Professional Tax", type: "Fixed", percent: 5 },
                                    { name: "Income Tax (TDS)", type: "Slab-based", percent: 15 },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-100 dark:border-neutral-800 group hover:border-error-500/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black dark:text-white uppercase italic">{item.name}</span>
                                            <Badge variant="default" className="text-[8px] font-black uppercase rounded-lg">{item.type}</Badge>
                                        </div>
                                        <Progress value={item.percent * 3} className="h-1 bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Intelligence Insights */}
                        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 shadow-inner rounded-[2.5rem] flex flex-col justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                                <Sparkles className="w-8 h-8 text-primary-500" />
                            </div>
                            <h4 className="font-black dark:text-white uppercase italic tracking-tighter">AI Salary Optimizer</h4>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase leading-relaxed tracking-widest px-4">
                                Analyzing market standards and inflation metrics to suggest grade adjustments for 2026.
                            </p>
                            <Button variant="outline" className="mt-4 rounded-xl border-0 glass font-black uppercase tracking-widest text-[10px] text-primary-500">Launch Analysis</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
