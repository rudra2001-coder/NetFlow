"use client";

import React from "react";
import { Globe, Zap } from "lucide-react";
import { Card, CardBody, CardHeader, Input, Select, Toggle } from "@/components";

export default function GeneralSettings() {
    return (
        <div className="space-y-6 animate-slideUp">
            <Card className="glass">
                <CardHeader
                    title="Organization Identity"
                    subtitle="Define how your brand appears across the platform."
                />
                <CardBody className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Organization Name" defaultValue="NetFlow Solutions" />
                        <Input label="Support Email" defaultValue="support@netflow.local" type="email" />
                        <Input label="Business Phone" placeholder="+1 (555) 000-0000" />
                        <Select
                            label="Primary Timezone"
                            value="UTC+6"
                            options={[
                                { value: "UTC+0", label: "UTC+0 (GMT)" },
                                { value: "UTC+6", label: "UTC+6 (Dhaka)" },
                                { value: "UTC-5", label: "UTC-5 (New York)" },
                            ]}
                        />
                    </div>
                    <Input label="Office Address" placeholder="123 Network Avenue, Tech City" />
                </CardBody>
            </Card>

            <Card className="glass">
                <CardHeader
                    title="Global Toggles"
                    subtitle="Core functionality switches that affect the entire system."
                />
                <CardBody className="space-y-5">
                    <Toggle
                        label="Maintenance Mode"
                        description="Temporarily disable public access and make the dashboard read-only."
                    />
                    <Toggle
                        label="Real-time Synchronization"
                        description="Allow background workers to sync router state every 30 seconds."
                        defaultChecked
                    />
                    <Toggle
                        label="Debug Logging"
                        description="Record detailed system logs for troubleshooting (Increases storage usage)."
                    />
                </CardBody>
            </Card>
        </div>
    );
}
