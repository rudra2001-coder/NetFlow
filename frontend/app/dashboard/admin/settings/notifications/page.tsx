"use client";

import React from "react";
import { Card, CardBody, CardHeader, Toggle, Select, Button } from "@/components";

export default function NotificationSettings() {
    return (
        <div className="space-y-6 animate-slideUp">
            <Card className="glass">
                <CardHeader title="Alert Channels" subtitle="Choose where you want to receive system notifications." />
                <CardBody className="space-y-6">
                    <Toggle label="Email Alerts" description="Receive critical system status via email." defaultChecked />
                    <Toggle label="Push Notifications" description="Show browser notifications when something happens." defaultChecked />
                    <Toggle label="Desktop Sounds" description="Play a subtle alert sound for incoming high-priority events." />
                </CardBody>
            </Card>

            <Card className="glass">
                <CardHeader title="Report Scheduling" subtitle="Automate the delivery of performance and billing reports." />
                <CardBody className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Daily Summary"
                            value="08:00"
                            options={[{ value: "08:00", label: "8:00 AM" }, { value: "20:00", label: "8:00 PM" }]}
                        />
                        <Select
                            label="Weekly digest"
                            value="monday"
                            options={[{ value: "monday", label: "Every Monday" }, { value: "sunday", label: "Every Sunday" }]}
                        />
                    </div>
                    <Button variant="outline" className="w-full">Edit All Scheduled Reports</Button>
                </CardBody>
            </Card>
        </div>
    );
}
