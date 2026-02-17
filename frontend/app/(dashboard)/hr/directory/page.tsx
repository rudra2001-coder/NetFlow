"use client";

import React, { useState } from "react";
import {
    Users, UserPlus, Search, Filter,
    MoreHorizontal, Mail, Phone, MapPin,
    Briefcase, CreditCard, ShieldCheck,
    ArrowUpRight, Download, Edit3, Trash2,
    CheckCircle2, AlertCircle, X, ChevronRight,
    Building2, Star, DollarSign
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Input, Avatar,
    Select, Modal, Toggle, Alert
} from "@/components";
import { cn } from "@/lib/utils";

export default function EmployeeDirectory() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    const employees = [
        { id: "EMP-101", name: "Rudra", role: "Super Admin", dept: "Executive", salary: "$12,500", status: "Active", grade: "A", joined: "Jan 2024" },
        { id: "EMP-102", name: "Sarah Connor", role: "Field Engineer", dept: "Operations", salary: "$8,200", status: "Field-Ops", grade: "B", joined: "Mar 2024" },
        { id: "EMP-103", name: "John Wick", role: "Security Architect", dept: "Security", salary: "$15,000", status: "Active", grade: "A+", joined: "Dec 2023" },
        { id: "EMP-104", name: "Elliot Alderson", role: "Systems Admin", dept: "Engineering", salary: "$9,500", status: "Remote", grade: "B+", joined: "Feb 2024" },
        { id: "EMP-105", name: "Ada Lovelace", role: "Algorithm Dev", dept: "Engineering", salary: "$14,200", status: "Active", grade: "A", joined: "Nov 2023" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header / Command Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-500" />
                        Personnel Nexus
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Lifecycle orchestration & salary distribution matrix</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Identity..."
                            className="h-11 w-64 pl-10 pr-4 bg-white dark:bg-neutral-900 glass border-0 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:uppercase placeholder:italic"
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-2xl h-11 px-8 font-black bg-primary-600 shadow-2xl shadow-primary-500/20 uppercase text-xs tracking-widest"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                        Onboard Agent
                    </Button>
                </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-800/50 rounded-3xl glass shadow-inner border border-white/5">
                <div className="flex items-center gap-1">
                    {['All Personnel', 'Active Duty', 'Remote', 'Field Ops', 'Contractors'].map((tab, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                idx === 0 ? "bg-white dark:bg-neutral-900 shadow-lg text-primary-600" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 px-2">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" leftIcon={<Filter className="w-4 h-4 text-neutral-400" />} />
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" leftIcon={<Download className="w-4 h-4 text-neutral-400" />} />
                </div>
            </div>

            {/* Personnel Matrix (Table) */}
            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardBody className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-400 text-[11px] font-black uppercase tracking-[0.2em] italic border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-10 py-6">Identity Matrix</th>
                                    <th className="px-6 py-6">Department</th>
                                    <th className="px-6 py-6">Pay Grade</th>
                                    <th className="px-6 py-6">Monthly Salary</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-10 py-6 text-right">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all duration-300 group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar name={emp.name} className="h-12 w-12 rounded-2xl ring-2 ring-white/10 shadow-xl" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter leading-none mb-1">{emp.name}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" /> {emp.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant="default" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl px-3 font-black uppercase text-[9px] tracking-widest italic">{emp.dept}</Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-warning-500 fill-warning-500" />
                                                <span className="text-xs font-black dark:text-white">{emp.grade}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black dark:text-white tabular-nums italic">{emp.salary}</p>
                                            <p className="text-[9px] font-bold text-success-500 uppercase">+ Allowance</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant={emp.status === 'Active' ? 'success' : 'default'} className="rounded-full px-4 font-black uppercase italic text-[9px]">
                                                {emp.status}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl glass hover:bg-white dark:hover:bg-neutral-800 shadow-xl"><Edit3 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl glass hover:bg-white dark:hover:bg-neutral-800 text-error-500 shadow-xl"><Trash2 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl glass hover:bg-white dark:hover:bg-neutral-800 shadow-xl"><ChevronRight className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Onboarding Modal (The Extreme UI Heavy Part) */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Personnel Onboarding Protocol"
                size="xl"
                className="bg-transparent border-0 shadow-none p-0 overflow-visible"
            >
                <div className="relative">
                    {/* Metal/Glass Background Overlay handled by parent modal usually, but we inject custom styles */}
                    <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden p-0 relative">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:bg-error-500 hover:text-white transition-all shadow-inner">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-12 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-[2.5rem] border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 group hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-all shadow-inner">
                                    <UserPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase mt-2">Avatar</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">New Agent Profile</h2>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1">Initializing identity matrix for core staff induction.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <Input label="Full Identity Name" placeholder="AGENT NAME" className="rounded-2xl h-14 font-black uppercase italic placeholder:text-neutral-500/50" />
                                    <Input label="Secure Communication (Email)" type="email" placeholder="IDENTITY@NETFLOW.LOCAL" className="rounded-2xl h-14 font-black uppercase italic" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Department Unit"
                                            options={[{ value: 'eng', label: 'ENG-UNIT' }, { value: 'ops', label: 'FIELD-OPS' }, { value: 'exc', label: 'EXECUTIVE' }]}
                                        />
                                        <Select
                                            label="Access Role"
                                            options={[{ value: 'sa', label: 'SUPER-ADMIN' }, { value: 'tc', label: 'TECHNICIAN' }, { value: 'su', label: 'SUPPORT' }]}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-inner">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-4 block">Salary Configuration (Base)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 translate-y-[-2px]">
                                                <DollarSign className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <input type="number" defaultValue="5000" className="w-full bg-transparent border-0 p-0 text-3xl font-black dark:text-white italic focus:ring-0 tabular-nums" />
                                                <p className="text-[9px] font-black text-neutral-400 uppercase mt-1 tracking-widest">Adjust Monthly Scale</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Select
                                        label="Intelligence Grade (Pay Grade)"
                                        options={[{ value: 'ap', label: 'GRADE A+' }, { value: 'a', label: 'GRADE A' }, { value: 'b', label: 'GRADE B' }]}
                                    />
                                    <div className="flex items-center justify-between p-4 bg-primary-900 rounded-[1.5rem] border border-primary-500/20 shadow-2xl">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-primary-400" />
                                            <span className="text-[10px] font-black text-white uppercase italic tracking-widest">Enforce 2FA Mandate</span>
                                        </div>
                                        <Toggle label="Enforce 2FA" defaultChecked />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                                <Button className="h-16 flex-1 rounded-[2rem] bg-primary-600 shadow-2xl shadow-primary-500/20 font-black uppercase tracking-[0.3em] text-xs italic">Confirm Induction</Button>
                                <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-0 glass font-black uppercase tracking-widest text-xs text-neutral-500" onClick={() => setIsAddModalOpen(false)}>Abort</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Decorative UI elements like scanners or labels could go here for "Extreme Design" */}
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden xl:block">
                        <div className="rotate-90 origin-center">
                            <span className="text-[40px] font-black text-neutral-100 dark:text-neutral-800/20 tracking-tighter uppercase whitespace-nowrap">PERSONNEL PROTOCOL 004</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
