"use client";

import React from "react";
import { Activity, Terminal, Mail, Plug, Plus, ExternalLink } from "lucide-react";
import { Card, CardBody, Badge, Button } from "@/components";

export default function IntegrationSettings() {
    const integrations = [
        { id: 'mk', name: "MikroTik API", desc: "Core router communication service.", icon: <Activity className="w-6 h-6 text-primary-500" />, status: "Connected" },
        { id: 'slack', name: "Slack", desc: "Send critical network alerts to channels.", icon: <Terminal className="w-6 h-6 text-purple-500" />, status: "Disconnected" },
        { id: 'mail', name: "SMTP Server", desc: "Global email delivery service.", icon: <Mail className="w-6 h-6 text-blue-500" />, status: "Configured" },
        { id: 'hook', name: "Custom Webhooks", desc: "Push events to any external URL.", icon: <Plug className="w-6 h-6 text-teal-500" />, status: "Active" },
    ];

    return (
        <div className="space-y-6 animate-slideUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((svc) => (
                    <Card key={svc.id} className="glass stats-card">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
                                    {svc.icon}
                                </div>
                                <Badge variant={svc.status === 'Connected' || svc.status === 'Active' ? 'success' : 'default'}>
                                    {svc.status}
                                </Badge>
                            </div>
                            <h4 className="text-lg font-bold dark:text-white mb-2">{svc.name}</h4>
                            <p className="text-sm text-neutral-500 mb-6">{svc.desc}</p>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="flex-1">Configure</Button>
                                <Button variant="ghost" size="sm" className="text-primary-500">Test</Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="glass border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-neutral-400" />
                </div>
                <h4 className="font-bold dark:text-white">Discover more integrations</h4>
                <p className="text-sm text-neutral-500 max-w-xs mt-2">Connect your network to hundreds of external tools and services.</p>
                <Button variant="ghost" className="mt-4 text-primary-500" rightIcon={<ExternalLink className="w-4 h-4" />}>Explore Marketplace</Button>
            </Card>
        </div>
    );
}
