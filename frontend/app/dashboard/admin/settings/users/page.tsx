"use client";

import React, { useState } from "react";
import {
    UserPlus, Search, Filter, Edit2, Trash2, ShieldCheck,
    Lock, Globe, ShieldAlert, KeyRound, Clock
} from "lucide-react";
import { Card, CardBody, Button, Avatar, Badge, Input } from "@/components";
import { cn } from "@/lib/utils";

export default function UserManagement() {
    const [searchQuery, setSearchQuery] = useState("");

    const users = [
        {
            id: 1,
            name: "Rudra",
            email: "rudra@netflow.local",
            role: "Super Admin",
            status: "Active",
            avatar: "",
            twoFactor: true,
            lastIp: "192.168.1.1",
            lastSeen: "2m ago"
        },
        {
            id: 2,
            name: "Sarah Connor",
            email: "sarah@netflow.local",
            role: "Operator",
            status: "Active",
            avatar: "",
            twoFactor: true,
            lastIp: "103.44.22.12",
            lastSeen: "4h ago"
        },
        {
            id: 3,
            name: "John Doe",
            email: "john@netflow.local",
            role: "Viewer",
            status: "Inactive",
            avatar: "",
            twoFactor: false,
            lastIp: "172.16.0.44",
            lastSeen: "2d ago"
        },
    ];

    const stats = [
        { label: "Active Staff", value: "12", icon: <ShieldCheck className="w-4 h-4" />, color: "bg-success-500" },
        { label: "Role Groups", value: "4", icon: <Lock className="w-4 h-4" />, color: "bg-primary-500" },
        { label: "2FA Enabled", value: "92%", icon: <KeyRound className="w-4 h-4" />, color: "bg-warning-500" },
        { label: "Security score", value: "High", icon: <ShieldAlert className="w-4 h-4" />, color: "bg-neutral-900" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="glass border-0 shadow-lg group hover:scale-[1.02] transition-transform cursor-pointer">
                        <CardBody className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-xl font-black dark:text-white uppercase italic">{stat.value}</h4>
                            </div>
                            <div className={cn("p-3 rounded-2xl text-white shadow-lg", stat.color)}>
                                {stat.icon}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                        <Globe className="w-6 h-6 text-primary-500" />
                        Staff Directory 2.0
                    </h3>
                    <p className="text-sm font-bold text-neutral-500">Forensic oversight of all administrative identities and access vectors.</p>
                </div>
                <Button className="rounded-2xl h-11 px-8 font-black shadow-xl shadow-primary-500/20" leftIcon={<UserPlus className="w-4 h-4" />}>Provision New Identity</Button>
            </div>

            <Card className="glass border-0 shadow-2xl overflow-hidden rounded-[2rem]">
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-4 items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            className="w-full pl-12 h-11 border-0 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl font-bold"
                            placeholder="Find administrator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-11 rounded-2xl border-0 glass shadow-lg px-6 font-black" leftIcon={<Filter className="w-4 h-4" />}>Advanced Filter</Button>
                    </div>
                </div>
                <CardBody className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-8 py-5">Administrative Identity</th>
                                    <th className="px-6 py-5">Role Tier</th>
                                    <th className="px-6 py-5">Security Ops</th>
                                    <th className="px-6 py-5">Forensic Access</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group/avatar">
                                                    <Avatar name={user.name} size="md" className="rounded-2xl shadow-xl shadow-primary-500/10 border-2 border-white group-hover:border-primary-500 transition-colors" />
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900",
                                                        user.status === 'Active' ? 'bg-success-500' : 'bg-neutral-400'
                                                    )} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black dark:text-white leading-tight uppercase italic tracking-tight">{user.name}</p>
                                                    <p className="text-[11px] font-bold text-neutral-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge
                                                variant={user.role === 'Super Admin' ? 'info' : 'default'}
                                                size="sm"
                                                className="rounded-full px-4 font-black uppercase italic"
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "p-1 rounded-md",
                                                        user.twoFactor ? "bg-success-500/10 text-success-600" : "bg-error-500/10 text-error-600"
                                                    )}>
                                                        {user.twoFactor ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{user.twoFactor ? "MFA Enabled" : "MFA Disabled"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-neutral-400">{user.lastSeen}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black dark:text-white tabular-nums tracking-tighter">{user.lastIp}</span>
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Dhaka, BD (Confirmed)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm"><Edit2 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-white dark:hover:bg-neutral-800 text-error-500 shadow-sm"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
                <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/10 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-4 p-4 glass rounded-2xl">
                        <div className="p-3 bg-warning-500/10 text-warning-600 rounded-xl">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-neutral-400">Security Recommendation</p>
                            <p className="text-sm font-bold dark:text-white leading-tight">1 administrator currently has MFA disabled. It is highly recommended to enforce global MFA policies.</p>
                        </div>
                        <Button variant="ghost" className="ml-auto text-primary-500 font-bold uppercase tracking-widest text-xs">Enforce Global 2FA</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
