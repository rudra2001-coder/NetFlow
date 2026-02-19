"use client";

import React from "react";
import { Bell, Mail, MessageSquare, Volume2, Calendar, Settings2 } from "lucide-react";
import { Card, CardBody, CardHeader, Toggle, Select, Button, Badge } from "@/components";

export default function NotificationSettings() {
    return (
        <div className="space-y-8 animate-slideUp">
            <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader
                    title="Communication Channels"
                    subtitle="Define high-priority alert propagation vectors."
                    action={<div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600"><Bell className="w-5 h-5" /></div>}
                />
                <CardBody className="space-y-6 p-8">
                    <Toggle label="Email Transmission" description="Propagation of invoices and security logs via SMTP." defaultChecked />
                    <Toggle label="Real-time Web Push" description="Immediate browser notifications for critical logic events." defaultChecked />
                    <Toggle label="Acoustic Alerts" description="Play audible system heartbeats for high-priority incidents." />
                </CardBody>
            </Card>

            <Card className="glass border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader
                    title="Intelligence Scheduling"
                    subtitle="Automate the generation and delivery of system insights."
                    action={<div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl"><Calendar className="w-5 h-5 text-neutral-500" /></div>}
                />
                <CardBody className="space-y-8 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Select
                            label="Daily Insight Time"
                            value="08:00"
                            options={[{ value: "08:00", label: "08:00 (Zulu +6)" }, { value: "20:00", label: "20:00 (Zulu +6)" }]}
                        />
                        <Select
                            label="Weekly Aggregation"
                            value="monday"
                            options={[{ value: "monday", label: "Global Monday" }, { value: "sunday", label: "Global Sunday" }]}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <Button className="w-full md:flex-1 rounded-2xl h-11 border-0 glass shadow-lg font-black uppercase text-xs tracking-widest" leftIcon={<Settings2 className="w-4 h-4" />}>Configure PDF Engine</Button>
                        <Button variant="ghost" className="w-full md:w-auto text-primary-500 font-black uppercase tracking-widest text-xs px-8">Test Scheduler</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
