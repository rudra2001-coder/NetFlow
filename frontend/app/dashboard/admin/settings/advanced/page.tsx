"use client";

import React from "react";
import {
    AlertTriangle, Database, Download, RefreshCw,
    Trash2, Save, Terminal, HardDrive
} from "lucide-react";
import {
    Alert, Card, CardHeader, CardBody,
    Button, Badge, Progress
} from "@/components";
import { cn } from "@/lib/utils";

export default function AdvancedSettings() {
    return (
        <div className="space-y-8 animate-slideUp">
            <Alert variant="warning" title="Restricted Core Protocol">
                <p className="text-sm font-bold opacity-90 leading-relaxed uppercase tracking-tight italic">
                    You are entering the <b>Low-Level OS Matrix</b>. Modifying these parameters can cause cascading logic failures or permanent data exfiltration.
                </p>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardHeader
                        title="Storage & Persistence"
                        subtitle="Manage raw data structures and system snapshots."
                        action={<div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl"><Database className="w-5 h-5 text-neutral-500" /></div>}
                    />
                    <CardBody className="space-y-6 p-8">
                        <div className="flex items-center justify-between p-5 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                            <div>
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Cold Storage Backup</p>
                                <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter">Current Archive: 1.2 GB</p>
                            </div>
                            <Button className="rounded-xl h-10 px-6 font-black shadow-lg shadow-primary-500/10" variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                            <div>
                                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Volatile Memory</p>
                                <p className="text-sm font-black dark:text-white uppercase italic tracking-tighter">Buffered State: 45 MB</p>
                            </div>
                            <Button variant="ghost" className="rounded-xl h-10 px-6 font-black text-primary-500" leftIcon={<RefreshCw className="w-4 h-4" />}>Purge</Button>
                        </div>
                    </CardBody>
                </Card>

                <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden border-error-500/20 bg-error-500/5">
                    <CardHeader
                        title="Danger Zone"
                        subtitle="Irreversible master orchestration commands."
                    />
                    <CardBody className="p-8 space-y-4">
                        <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-error-600 tracking-widest mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Critical Warning
                            </p>
                            <p className="text-xs font-bold text-error-900 dark:text-error-400 leading-relaxed">
                                Executing these commands will result in immediate termination of all active connections and possible data loss.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Button variant="outline" className="h-12 rounded-2xl border-error-500/20 text-error-600 font-black uppercase tracking-widest text-[10px] hover:bg-error-500 hover:text-white transition-all shadow-xl shadow-error-500/5" leftIcon={<Trash2 className="w-4 h-4" />}>Purge Forensic Logs</Button>
                            <Button className="h-12 rounded-2xl bg-error-600 hover:bg-error-700 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-error-600/20">System Factory Reset</Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
