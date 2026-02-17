"use client";

import React from "react";
import { ShieldAlert, Key, Terminal } from "lucide-react";
import { Card, CardHeader, CardBody, Toggle, Button, Badge } from "@/components";

export default function SecuritySettings() {
    return (
        <div className="space-y-6 animate-slideUp">
            <Card className="glass border-error-500/20">
                <CardHeader
                    title="Access Control"
                    subtitle="Tighten down security for administrative access."
                />
                <CardBody className="space-y-6">
                    <Toggle label="Two-Factor Authentication (2FA)" description="Require 2FA for all administrative logins." defaultChecked />
                    <Toggle label="Session IP Binding" description="Restrict active sessions to the IP they were created on." />
                    <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-neutral-300">Auto-Logout Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                            <Button variant="outline" size="sm">15m</Button>
                            <Button variant="primary" size="sm">30m</Button>
                            <Button variant="outline" size="sm">1h</Button>
                            <Button variant="outline" size="sm">4h</Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="glass">
                <CardHeader
                    title="API Infrastructure"
                    subtitle="Manage secure tokens for headless access."
                    action={<Button size="sm" leftIcon={<Key className="w-3 h-3" />}>Generate Token</Button>}
                />
                <CardBody className="p-0">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                        <Terminal className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium dark:text-white">API-KEY-{i}28394</p>
                                        <p className="text-xs text-neutral-500">Last used: 15 minutes ago</p>
                                    </div>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
