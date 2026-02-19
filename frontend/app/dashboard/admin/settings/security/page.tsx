"use client";

import React from "react";
import {
    ShieldAlert, Key, Terminal, ShieldCheck,
    Smartphone, Globe, Fingerprint, History,
    Lock, AlertCircle, Trash2, Eye
} from "lucide-react";
import {
    Card, CardHeader, CardBody,
    Toggle, Button, Badge, Avatar
} from "@/components";
import { cn } from "@/lib/utils";

export default function SecuritySettings() {
    const forensicLogs = [
        { id: 1, user: "Rudra", event: "Login Success", device: "Chrome / Windows 11", ip: "103.44.22.12", time: "2m ago", status: "Verified" },
        { id: 2, user: "Sarah Connor", event: "API Key Created", device: "Safari / macOS", ip: "172.16.0.44", time: "45m ago", status: "Authorized" },
        { id: 3, user: "Unknown", event: "Failed Login", device: "Firefox / Linux", ip: "45.122.33.1", time: "2h ago", status: "Blocked" },
    ];

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Access Governance */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                        <CardHeader
                            title="Access Protocol"
                            subtitle="Administrative hardening."
                        />
                        <CardBody className="space-y-6 p-6">
                            <Toggle label="Global 2FA Enforce" description="Require MFA for ALL admins." defaultChecked />
                            <Toggle label="IP Sticky Sessions" description="Bind sessions to origin IP." />
                            <Toggle label="Secure API Only" description="Disable cleartext API access." defaultChecked />

                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3 block">Auto-Lock Duration</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl border-0 glass font-bold">15 Minutes</Button>
                                    <Button variant="primary" size="sm" className="rounded-xl font-bold shadow-lg shadow-primary-500/20">30 Minutes</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl border-0 glass font-bold">1 Hour</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl border-0 glass font-bold">4 Hours</Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden bg-primary-900 text-white">
                        <CardBody className="p-8 text-center space-y-4">
                            <Fingerprint className="w-12 h-12 mx-auto opacity-20" />
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Biometric Auth</h4>
                            <p className="text-[10px] font-bold opacity-60 leading-relaxed italic uppercase">Enable WebAuthn/Passkey support for physical security hardware.</p>
                            <Button className="w-full bg-white text-primary-900 rounded-xl font-black h-11">Configure Passkey</Button>
                        </CardBody>
                    </Card>
                </div>

                {/* Forensic Audit Log */}
                <div className="lg:col-span-2">
                    <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden h-full">
                        <CardHeader
                            title="Forensic Access Timeline"
                            subtitle="Real-time audit of all administrative entry points."
                            action={<Button variant="ghost" size="sm" className="text-primary-500 font-bold uppercase tracking-widest text-xs">Exfiltrate Logs</Button>}
                        />
                        <CardBody className="p-0">
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {forensicLogs.map((log) => (
                                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl shadow-inner",
                                                log.status === 'Blocked' ? "bg-error-500/10 text-error-600" : "bg-success-500/10 text-success-600"
                                            )}>
                                                {log.status === 'Blocked' ? <AlertCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400">{log.event}</span>
                                                    <Badge variant={log.status === 'Blocked' ? 'error' : 'success'} size="sm" className="text-[8px] font-black uppercase italic rounded-full px-2">{log.status}</Badge>
                                                </div>
                                                <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{log.user}</p>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-neutral-400">
                                                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {log.ip}</span>
                                                    <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {log.device}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black dark:text-neutral-500 tabular-nums uppercase">{log.time}</p>
                                            <Button variant="ghost" size="sm" className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Full Trace</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/10 border-t border-neutral-100 dark:border-neutral-800 text-center">
                                <Button className="rounded-2xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest px-12" leftIcon={<History className="w-4 h-4" />}>View Historical Archives</Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* API Infrastructure */}
            <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader
                    title="API Infrastructure Orchestration"
                    subtitle="Secure headless access vectors and automation tokens."
                    action={<Button className="rounded-xl h-10 px-6 font-black shadow-lg shadow-primary-500/20" leftIcon={<Key className="w-4 h-4" />}>Provision New Token</Button>}
                />
                <CardBody className="p-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/20 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-8 py-4">Token Identity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Capability Tier</th>
                                    <th className="px-6 py-4">Last Utilization</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {[
                                    { id: 1, name: "Reporting-Engine-Node", status: "Active", tier: "Read-Only", last: "4m ago" },
                                    { id: 2, name: "Billing-Orchestrator", status: "Active", tier: "Full-Control", last: "Just now" },
                                    { id: 3, name: "Legacy-Python-Tool", status: "Revoked", tier: "Read-Only", last: "45d ago" },
                                ].map((token) => (
                                    <tr key={token.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                                    <Terminal className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-black dark:text-white uppercase italic tracking-tighter">{token.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant={token.status === 'Active' ? 'success' : 'default'} size="sm" className="rounded-full px-3 font-black uppercase italic text-[9px]">{token.status}</Badge>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-neutral-500 uppercase tracking-widest">{token.tier}</td>
                                        <td className="px-6 py-5 text-xs font-black dark:text-white uppercase italic">{token.last}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm"><Eye className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-error-500 shadow-sm"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
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
