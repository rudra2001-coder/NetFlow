"use client";

import React, { useState } from "react";
import {
    FileText, UserPlus, Search, Filter,
    MoreHorizontal, Mail, Phone, MapPin,
    AlertCircle, CheckCircle2, X, ChevronRight,
    UserCircle2, ShieldAlert, Clock, Flag,
    MessageCircle, Hash, ArrowUpRight, Check
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Button, Badge, Input, Avatar,
    Select, Modal, Toggle, Alert, Progress
} from "@/components";
import { cn } from "@/lib/utils";

export default function TicketManagement() {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    const tickets = [
        { id: "TKT-4091", title: "PPPoE Server Timeout - Node HQ", requester: "Admin Alpha", status: "Open", priority: "Critical", assigned: "Unassigned", age: "14m" },
        { id: "TKT-4088", title: "Latent Response from MikroTik-02", requester: "Sarah Jones", status: "Assigned", priority: "High", assigned: "John Wick", age: "42m" },
        { id: "TKT-4085", title: "Billing Discrepancy - Cycle 002", requester: "Rudra", status: "Pending", priority: "Medium", assigned: "Sarah Connor", age: "2h 15m" },
        { id: "TKT-4082", title: "RADIUS Secret Mismatch", requester: "Field-Ops", status: "Assigned", priority: "High", assigned: "Elliot Alderson", age: "3h 40m" },
        { id: "TKT-4079", title: "Hotspot Logo Replacement", requester: "Mark Marketing", status: "Closed", priority: "Low", assigned: "Ada Lovelace", age: "5h 12m" },
    ];

    const employees = [
        { id: "E1", name: "John Wick", role: "Security Architect", currentTasks: 4 },
        { id: "E2", name: "Sarah Connor", role: "Network Tech", currentTasks: 2 },
        { id: "E3", name: "Elliot Alderson", role: "Sys Admin", currentTasks: 1 },
        { id: "E4", name: "Ada Lovelace", role: "Developer", currentTasks: 0 },
    ];

    const openAssignModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsAssignModalOpen(true);
    };

    const openResolveModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsResolveModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-500" />
                        Ticket Command
                    </h1>
                    <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">Lifecycle orchestration & task delegation matrix</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find Ticket Identity..."
                            className="h-11 w-64 pl-10 pr-4 bg-white dark:bg-neutral-900 glass border-0 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:uppercase placeholder:italic"
                        />
                    </div>
                    <Button className="rounded-2xl h-11 px-8 font-black bg-indigo-600 shadow-xl shadow-indigo-500/20 uppercase text-xs tracking-widest" leftIcon={<Hash className="w-4 h-4" />}>Scan Protocol</Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-800/50 rounded-3xl glass shadow-inner border border-white/5">
                <div className="flex items-center gap-1">
                    {['All Tickets', 'Critical Duty', 'My Assignments', 'Awaiting Verification', 'Archive'].map((tab, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                idx === 0 ? "bg-white dark:bg-neutral-900 shadow-lg text-indigo-600" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 px-2">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" leftIcon={<Filter className="w-4 h-4 text-neutral-400" />} />
                </div>
            </div>

            {/* Ticket Matrix */}
            <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <CardBody className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-400 text-[11px] font-black uppercase tracking-[0.2em] italic border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-10 py-6">Ticket Identity</th>
                                    <th className="px-6 py-6">Priority Unit</th>
                                    <th className="px-6 py-6">Personnel Assigned</th>
                                    <th className="px-6 py-6">Age / SLA</th>
                                    <th className="px-6 py-6">Lifecycle Status</th>
                                    <th className="px-10 py-6 text-right">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {tickets.map((tkt) => (
                                    <tr key={tkt.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all duration-300 group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    tkt.priority === 'Critical' ? "bg-error-500/10 text-error-500" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                                )}>
                                                    <Hash className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter leading-none mb-1">{tkt.title}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                        <UserCircle2 className="w-3 h-3" /> {tkt.requester} <span className="mx-1 opacity-20">|</span> <span className="text-indigo-500 font-black">{tkt.id}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant={tkt.priority === 'Critical' ? 'error' : tkt.priority === 'High' ? 'warning' : 'default'} className="rounded-xl px-4 font-black uppercase text-[9px] tracking-widest italic">{tkt.priority}</Badge>
                                        </td>
                                        <td className="px-6 py-6">
                                            {tkt.assigned === 'Unassigned' ? (
                                                <span className="text-[10px] font-black text-neutral-300 dark:text-neutral-700 uppercase italic">Awaiting Agent</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={tkt.assigned} size="xs" className="rounded-lg h-6 w-6" />
                                                    <span className="text-xs font-black dark:text-white uppercase italic">{tkt.assigned}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-xs font-black tabular-nums dark:text-neutral-400 italic">{tkt.age}</td>
                                        <td className="px-6 py-6">
                                            <Badge variant={tkt.status === 'Closed' ? 'success' : tkt.status === 'Assigned' ? 'info' : 'default'} className="rounded-full px-4 font-black uppercase italic text-[9px]">
                                                {tkt.status}
                                            </Badge>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {tkt.status !== 'Closed' && (
                                                    <>
                                                        {tkt.assigned === 'Unassigned' ? (
                                                            <Button variant="ghost" size="sm" onClick={() => openAssignModal(tkt)} className="h-10 px-6 rounded-2xl glass hover:bg-white dark:hover:bg-neutral-800 text-indigo-500 font-black uppercase italic text-[9px] shadow-xl">Delegate</Button>
                                                        ) : (
                                                            <Button variant="ghost" size="sm" onClick={() => openResolveModal(tkt)} className="h-10 px-6 rounded-2xl glass hover:bg-white dark:hover:bg-neutral-800 text-success-500 font-black uppercase italic text-[9px] shadow-xl">Resolve</Button>
                                                        )}
                                                    </>
                                                )}
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

            {/* Admin Assignment Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Personnel Allocation Protocol"
                size="xl"
                className="bg-transparent border-0 shadow-none p-0 overflow-visible"
            >
                <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden p-0 relative">
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={() => setIsAssignModalOpen(false)} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:bg-error-500 hover:text-white transition-all shadow-inner">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-12 space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-500 shrink-0">
                                <UserPlus className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">Delegate Task Identity</h2>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Assigning <span className="text-indigo-500 font-black">{selectedTicket?.id}</span> to optimized personnel.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-4 italic">Personnel Matrix: Load Balancing</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {employees.map((emp) => (
                                    <button
                                        key={emp.id}
                                        className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 text-left group hover:border-indigo-500/50 hover:bg-indigo-500 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
                                            <UserPlus className="w-24 h-24" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <Avatar name={emp.name} className="h-12 w-12 rounded-2xl group-hover:ring-2 ring-white/20 shadow-xl" />
                                                <Badge variant="default" className="bg-neutral-100 dark:bg-neutral-800 group-hover:bg-white group-hover:text-indigo-600 rounded-xl px-3 font-black text-[8px] italic">{emp.role}</Badge>
                                            </div>
                                            <p className="text-sm font-black dark:text-white group-hover:text-white uppercase italic tracking-tighter">{emp.name}</p>
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-[9px] font-black uppercase group-hover:text-indigo-100">
                                                    <span>Active Load</span>
                                                    <span>{emp.currentTasks} Tasks</span>
                                                </div>
                                                <Progress value={emp.currentTasks * 20} className="h-1.5 bg-neutral-100 dark:bg-neutral-900" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block italic">Delegation Instructions (Secure Note)</label>
                            <textarea
                                placeholder="ENTER TASK COORDINATES..."
                                className="w-full h-32 bg-neutral-50 dark:bg-neutral-800/50 border-0 rounded-[2rem] p-6 text-xs font-bold uppercase italic focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-neutral-500/30"
                            />
                        </div>

                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                            <Button className="h-16 flex-1 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20 font-black uppercase tracking-[0.3em] text-xs italic">Initiate Allocation</Button>
                            <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-0 glass font-black uppercase tracking-widest text-xs text-neutral-500" onClick={() => setIsAssignModalOpen(false)}>Abort</Button>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* Resolution Protocol Modal */}
            <Modal
                isOpen={isResolveModalOpen}
                onClose={() => setIsResolveModalOpen(false)}
                title="Resolution Protocol Initiation"
                size="xl"
                className="bg-transparent border-0 shadow-none p-0 overflow-visible"
            >
                <Card className="glass border-0 shadow-2xl rounded-[3rem] overflow-hidden p-0 relative">
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={() => setIsResolveModalOpen(false)} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:bg-error-500 hover:text-white transition-all shadow-inner">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-12 space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-success-500/10 rounded-[2rem] flex items-center justify-center text-success-500 shrink-0">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">Finalize Task Identity</h2>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Closing <span className="text-success-500 font-black">{selectedTicket?.id}</span> after verified resolution.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-neutral-50 dark:bg-neutral-800/50 border-0 p-6 rounded-[2rem] shadow-inner">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-4 italic">Task Summary</label>
                                <h4 className="text-sm font-black dark:text-white uppercase italic mb-2">{selectedTicket?.title}</h4>
                                <div className="flex items-center gap-2 mt-4">
                                    <Avatar name={selectedTicket?.assigned} size="xs" className="h-6 w-6 rounded-lg" />
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase italic">Assigned to: {selectedTicket?.assigned}</span>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Select
                                    label="Resolution Category"
                                    options={[
                                        { value: 'fix', label: 'PERMANENT FIX' },
                                        { value: 'patch', label: 'TEMPORARY PATCH' },
                                        { value: 'ignore', label: 'BY DESIGN / NO FIX' }
                                    ]}
                                />
                                <div className="p-4 bg-success-500/10 rounded-2xl border border-success-500/20 flex items-center gap-3">
                                    <ShieldAlert className="w-4 h-4 text-success-500" />
                                    <span className="text-[9px] font-black text-success-500 uppercase italic">Verification check passed</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block italic">Resolution Notes (Public Entry)</label>
                            <textarea
                                placeholder="DESCRIBE THE SOLUTION PROTOCOL..."
                                className="w-full h-32 bg-neutral-50 dark:bg-neutral-800/50 border-0 rounded-[2rem] p-6 text-xs font-bold uppercase italic focus:ring-2 focus:ring-success-500 transition-all placeholder:text-neutral-500/30"
                            />
                        </div>

                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                            <Button className="h-16 flex-1 rounded-[2rem] bg-success-600 shadow-2xl shadow-success-500/20 font-black uppercase tracking-[0.3em] text-xs italic" leftIcon={<Check className="w-4 h-4" />}>Commit Closure</Button>
                            <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-0 glass font-black uppercase tracking-widest text-xs text-neutral-500" onClick={() => setIsResolveModalOpen(false)}>Abort</Button>
                        </div>
                    </div>
                </Card>
            </Modal>
        </div>
    );
}
