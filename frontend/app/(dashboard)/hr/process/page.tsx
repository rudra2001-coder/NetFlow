"use client";

import React, { useState } from "react";
import {
    Cpu, Zap, ShieldCheck, CreditCard,
    ArrowRight, RefreshCw, CheckCircle2,
    AlertTriangle, History, Download,
    Terminal, Lock, Fingerprint, Activity,
    Flame, DollarSign, Send
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Progress, Alert
} from "@/components";
import { cn } from "@/lib/utils";

export default function PayrollProcessing() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const steps = [
        { id: 1, label: "Verification", desc: "Identity & Attendance Sync", icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 2, label: "Computation", desc: "Tax & Allowance Matrix", icon: <Cpu className="w-4 h-4" /> },
        { id: 3, label: "Transmission", desc: "Global Bank Disbursement", icon: <Zap className="w-4 h-4" /> },
    ];

    const handleProcess = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            setIsProcessing(false);
        }, 3000);
    };

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-primary-500" />
                        Disbursement Orchestrator
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Multi-stage financial transmission & ledger sync</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-6" leftIcon={<History className="w-4 h-4" />}>Audit Logs</Button>
                    <Badge variant="error" className="h-11 flex items-center gap-2 px-6 rounded-xl border-0 glass font-black uppercase italic text-xs tracking-widest animate-pulse">
                        <Flame className="w-4 h-4" /> LIVE: Batch #004
                    </Badge>
                </div>
            </div>

            {/* Processing Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stepper Logic */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                        <CardBody className="p-8 space-y-8">
                            {steps.map((step) => (
                                <div key={step.id} className="relative">
                                    <div className={cn(
                                        "flex items-start gap-4 transition-all duration-500",
                                        currentStep >= step.id ? "opacity-100" : "opacity-30"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500",
                                            currentStep === step.id ? "bg-primary-500 text-white scale-110" :
                                                currentStep > step.id ? "bg-success-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                        )}>
                                            {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest leading-none mb-1">Phase 0{step.id}</p>
                                            <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{step.label}</p>
                                            <p className="text-[9px] font-bold text-neutral-500 uppercase mt-1">{step.desc}</p>
                                        </div>
                                    </div>
                                    {step.id < 3 && (
                                        <div className={cn(
                                            "absolute left-6 top-14 w-0.5 h-10 transition-colors duration-500",
                                            currentStep > step.id ? "bg-success-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-neutral-200 dark:bg-neutral-800"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-primary-900/10 border-primary-500/20">
                        <CardBody className="p-8 text-center space-y-4">
                            <Fingerprint className="w-12 h-12 mx-auto text-primary-500 opacity-20" />
                            <h4 className="text-lg font-black uppercase italic tracking-tighter text-primary-500">Security Vault</h4>
                            <p className="text-[10px] font-bold opacity-60 leading-relaxed italic uppercase dark:text-white">Transaction clearance requires multi-signature validation for sums exceeding $100k.</p>
                            <Button className="w-full bg-primary-600 text-white rounded-xl font-black h-11 uppercase text-[10px] tracking-widest shadow-lg shadow-primary-500/20">Verify Key</Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Action Hub */}
                <div className="lg:col-span-3 space-y-8">
                    <Card className="glass border-0 shadow-[0_0_50px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden min-h-[500px] flex flex-col relative">
                        {isProcessing && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/20 dark:bg-neutral-900/40 backdrop-blur-xl animate-fadeIn">
                                <div className="relative">
                                    <div className="w-32 h-32 border-4 border-primary-500/20 rounded-full animate-spin border-t-primary-500" />
                                    <Cpu className="absolute inset-0 m-auto w-10 h-10 text-primary-500 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Syncing Financial Matrix</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-2">Connecting to Federal Reserve Node...</p>
                                </div>
                            </div>
                        )}

                        <CardHeader
                            title="Execution Console"
                            subtitle="Current Batch: FEB-2026-CORE-STAFF"
                            action={<Badge variant="info" className="rounded-full px-4 font-black uppercase italic text-[10px]">Tier 1 Priority</Badge>}
                        />
                        <CardBody className="p-10 flex-1 flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                <div className="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3">Total Disbursement</p>
                                    <h4 className="text-3xl font-black dark:text-white tabular-nums italic">$442.9k</h4>
                                    <Progress value={currentStep * 33} className="h-1.5 mt-4 bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                                <div className="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3">Personnel Count</p>
                                    <h4 className="text-3xl font-black dark:text-white tabular-nums italic">283</h4>
                                    <div className="flex -space-x-3 mt-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-xl border-2 border-white dark:border-neutral-900 bg-neutral-200" />
                                        ))}
                                        <div className="w-8 h-8 rounded-xl border-2 border-white dark:border-neutral-900 bg-primary-600 flex items-center justify-center text-[10px] font-black text-white">+278</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-primary-600 rounded-[2rem] shadow-2xl shadow-primary-500/30 text-white relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Zap className="w-24 h-24" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-primary-200 tracking-widest mb-3">Estimated Time</p>
                                    <h4 className="text-3xl font-black tabular-nums italic">14.2s</h4>
                                    <p className="text-[10px] font-bold text-primary-100 uppercase mt-4 flex items-center gap-2 italic">
                                        <Activity className="w-3 h-3" /> High Thruput Mode
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 bg-neutral-50 dark:bg-neutral-950/50 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-inner flex flex-col justify-center text-center space-y-6">
                                <CreditCard className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 opacity-50" />
                                <div>
                                    <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Ready for Financial Transmission</h3>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest max-w-sm mx-auto mt-2 leading-relaxed">
                                        All salary components have been verified against the Grade Matrix. Proceed with transmission to primary bank gateway.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={handleProcess}
                                        className="h-16 px-12 rounded-[2rem] bg-success-600 shadow-2xl shadow-success-500/20 font-black uppercase tracking-[0.3em] text-xs italic"
                                        leftIcon={<Send className="w-4 h-4" />}
                                    >
                                        Execute Disbursement
                                    </Button>
                                    <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-0 glass font-black uppercase tracking-widest text-xs text-neutral-500">Recalculate Batch</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
