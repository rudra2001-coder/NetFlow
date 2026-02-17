"use client";

import React from "react";
import { AlertTriangle, Database, Download, RefreshCw } from "lucide-react";
import { Alert, Card, CardHeader, CardBody, Button } from "@/components";

export default function AdvancedSettings() {
    return (
        <div className="space-y-6 animate-slideUp">
            <Alert variant="warning" title="Caution: Expert Zone">
                <p className="text-sm opacity-90">Modifying these settings can cause platform instability or connectivity issues. Proceed with care.</p>
            </Alert>

            <Card className="glass">
                <CardHeader title="Database Operations" />
                <CardBody className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <div>
                            <p className="font-medium dark:text-white">Database Backup</p>
                            <p className="text-xs text-neutral-500">Current size: 1.2 GB</p>
                        </div>
                        <Button size="sm" leftIcon={<Download className="w-4 h-4" />}>Download Now</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <div>
                            <p className="font-medium dark:text-white">Cache Management</p>
                            <p className="text-xs text-neutral-500">System cache: 45 MB</p>
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>Clear Cache</Button>
                    </div>
                </CardBody>
            </Card>

            <Card className="glass border-error-500/30">
                <CardHeader title="Danger Zone" />
                <CardBody className="p-6 pt-0 space-y-4">
                    <p className="text-sm text-neutral-500">These actions are permanent and cannot be undone.</p>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="text-error-500 border-error-500/50 hover:bg-error-50 dark:hover:bg-error-900/10">Purge Audit Logs</Button>
                        <Button variant="outline" className="text-error-500 border-error-500/50 hover:bg-error-50 dark:hover:bg-error-900/10">Factory Reset System</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
