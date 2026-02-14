"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon, User, Bell, Shield, Palette, Globe,
  Database, Zap, Mail, Key, Trash2, Download, Upload, RefreshCw,
  ChevronRight, CheckCircle, AlertTriangle,
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Input, Select, Toggle, Badge, Tabs, Alert } from "@/components";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", content: <GeneralSettings /> },
    { id: "notifications", label: "Notifications", content: <NotificationSettings /> },
    { id: "security", label: "Security", content: <SecuritySettings /> },
    { id: "integrations", label: "Integrations", content: <IntegrationSettings /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your account and application settings
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs
        tabs={tabs}
        defaultTab="general"
        onChange={setActiveTab}
        variant="pills"
      />
    </div>
  );
}

function GeneralSettings() {
  const [orgName, setOrgName] = useState("My ISP");
  const [timezone, setTimezone] = useState("UTC+6");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Organization */}
      <Card>
        <CardHeader title="Organization" subtitle="Basic organization information" />
        <CardBody className="space-y-4">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your ISP name"
          />
          <Input
            label="Support Email"
            type="email"
            placeholder="support@yourisp.com"
            defaultValue="support@netflow.local"
          />
          <Input
            label="Support Phone"
            type="tel"
            placeholder="+1 234 567 8900"
          />
        </CardBody>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader title="Localization" subtitle="Timezone and language settings" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Timezone"
              value={timezone}
              onChange={setTimezone}
              options={[
                { value: "UTC+0", label: "UTC+0 (GMT)" },
                { value: "UTC+6", label: "UTC+6 (Dhaka)" },
                { value: "UTC+12", label: "UTC+12 (Auckland)" },
                { value: "UTC-5", label: "UTC-5 (New York)" },
                { value: "UTC-8", label: "UTC-8 (Los Angeles)" },
              ]}
            />
            <Select
              label="Language"
              value={language}
              onChange={setLanguage}
              options={[
                { value: "en", label: "English" },
                { value: "bn", label: "বাংলা (Bengali)" },
                { value: "es", label: "Español (Spanish)" },
                { value: "zh", label: "中文 (Chinese)" },
              ]}
            />
          </div>
          <Select
            label="Date Format"
            value={dateFormat}
            onChange={setDateFormat}
            options={[
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
            ]}
          />
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader title="Preferences" subtitle="UI and behavior preferences" />
        <CardBody className="space-y-4">
          <Toggle
            label="Dark Mode"
            description="Switch between light and dark theme"
          />
          <Toggle
            label="Compact View"
            description="Reduce spacing for more content"
          />
          <Toggle
            label="Auto Refresh"
            description="Automatically refresh data"
            defaultChecked
          />
          <Select
            label="Refresh Interval"
            options={[
              { value: "10s", label: "10 seconds" },
              { value: "30s", label: "30 seconds" },
              { value: "1m", label: "1 minute" },
              { value: "5m", label: "5 minutes" },
            ]}
          />
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [infoAlerts, setInfoAlerts] = useState(false);
  const [dailyReport, setDailyReport] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader title="Email Notifications" subtitle="Configure email alert settings" />
        <CardBody className="space-y-4">
          <Toggle
            label="Email Notifications"
            description="Receive notifications via email"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <div className="pl-4 space-y-3 border-l-2 border-neutral-200 dark:border-neutral-700">
            <Input
              label="Notification Email"
              type="email"
              placeholder="alerts@yourisp.com"
              defaultValue="admin@netflow.local"
              disabled={!emailNotifications}
            />
          </div>
        </CardBody>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader title="Push Notifications" subtitle="Browser and mobile push notifications" />
        <CardBody className="space-y-4">
          <Toggle
            label="Push Notifications"
            description="Receive browser push notifications"
            checked={pushNotifications}
            onChange={setPushNotifications}
          />
        </CardBody>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader title="Alert Types" subtitle="Choose which alerts to receive" />
        <CardBody className="space-y-4">
          <Toggle
            label="Critical Alerts"
            description="Router offline, service down, security threats"
            checked={criticalAlerts}
            onChange={setCriticalAlerts}
          />
          <Toggle
            label="Warning Alerts"
            description="High CPU, memory usage, connectivity issues"
            checked={warningAlerts}
            onChange={setWarningAlerts}
          />
          <Toggle
            label="Info Alerts"
            description="Backup complete, user registrations, routine updates"
            checked={infoAlerts}
            onChange={setInfoAlerts}
          />
        </CardBody>
      </Card>

      {/* Reports */}
      <Card>
        <CardHeader title="Reports" subtitle="Scheduled email reports" />
        <CardBody className="space-y-4">
          <Toggle
            label="Daily Summary"
            description="Receive daily network summary at 8:00 AM"
            checked={dailyReport}
            onChange={setDailyReport}
          />
          <Toggle
            label="Weekly Report"
            description="Receive weekly performance report every Monday"
            checked={weeklyReport}
            onChange={setWeeklyReport}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production API", created: "2024-01-15", lastUsed: "2 hours ago" },
    { id: "2", name: "Development", created: "2024-02-01", lastUsed: "Never" },
  ]);

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader title="Authentication" subtitle="Authentication and access security" />
        <CardBody className="space-y-4">
          <Toggle
            label="Two-Factor Authentication (2FA)"
            description="Require 2FA for all admin accounts"
            checked={twoFactor}
            onChange={setTwoFactor}
          />
          <Toggle
            label="Session Timeout"
            description="Auto logout after 30 minutes of inactivity"
            checked={sessionTimeout}
            onChange={setSessionTimeout}
          />
          <Select
            label="Session Timeout Duration"
            options={[
              { value: "15m", label: "15 minutes" },
              { value: "30m", label: "30 minutes" },
              { value: "1h", label: "1 hour" },
              { value: "4h", label: "4 hours" },
            ]}
          />
        </CardBody>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader title="IP Whitelist" subtitle="Restrict access to specific IPs" />
        <CardBody className="space-y-4">
          <Toggle
            label="Enable IP Whitelist"
            description="Only allow access from listed IP addresses"
            checked={ipWhitelist}
            onChange={setIpWhitelist}
          />
          <div className="pl-4 space-y-2 border-l-2 border-neutral-200 dark:border-neutral-700">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Whitelisted IPs
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800"
              rows={4}
              placeholder="Enter IP addresses, one per line..."
              defaultValue="10.0.0.0/8&#10;192.168.1.0/24"
              disabled={!ipWhitelist}
            />
            <p className="text-xs text-neutral-500">
              Use CIDR notation for ranges (e.g., 192.168.1.0/24)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader
          title="API Keys"
          subtitle="Manage API access keys"
          action={<Button variant="outline" size="sm" leftIcon={<Key className="w-4 h-4" />}>Generate New Key</Button>}
        />
        <CardBody className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{key.name}</p>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                    <span>Created: {key.created}</span>
                    <span>Last used: {key.lastUsed}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Active</Badge>
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>Revoke</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const [mikrotikApi, setMikrotikApi] = useState(true);
  const [snmp, setSnmp] = useState(true);
  const [webhook, setWebhook] = useState(false);

  return (
    <div className="space-y-6">
      {/* MikroTik API */}
      <Card>
        <CardHeader title="MikroTik API" subtitle="Router API integration settings" />
        <CardBody className="space-y-4">
          <Toggle
            label="Enable MikroTik API"
            description="Connect to routers via MikroTik API"
            checked={mikrotikApi}
            onChange={setMikrotikApi}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default API Port"
              type="number"
              defaultValue={8728}
              disabled={!mikrotikApi}
            />
            <Input
              label="Connection Timeout (ms)"
              type="number"
              defaultValue={5000}
              disabled={!mikrotikApi}
            />
          </div>
          <Toggle
            label="SSL/TLS Encryption"
            description="Use encrypted API connections"
            defaultChecked
            disabled={!mikrotikApi}
          />
        </CardBody>
      </Card>

      {/* SNMP */}
      <Card>
        <CardHeader title="SNMP" subtitle="Simple Network Management Protocol" />
        <CardBody className="space-y-4">
          <Toggle
            label="Enable SNMP"
            description="Monitor routers via SNMP"
            checked={snmp}
            onChange={setSnmp}
          />
          <Input
            label="SNMP Community String"
            type="password"
            defaultValue="public"
            disabled={!snmp}
          />
          <Select
            label="SNMP Version"
            options={[
              { value: "v2c", label: "SNMP v2c" },
              { value: "v3", label: "SNMP v3" },
            ]}
          />
        </CardBody>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader title="Webhook" subtitle="External system integrations" />
        <CardBody className="space-y-4">
          <Toggle
            label="Enable Webhook"
            description="Send events to external systems"
            checked={webhook}
            onChange={setWebhook}
          />
          <Input
            label="Webhook URL"
            placeholder="https://your-system.com/webhook"
            disabled={!webhook}
          />
          <Select
            label="Events to Send"
            options={[
              { value: "all", label: "All Events" },
              { value: "alerts", label: "Alerts Only" },
              { value: "critical", label: "Critical Alerts Only" },
            ]}
            disabled={!webhook}
          />
          <Button variant="outline" size="sm" disabled={!webhook}>Test Webhook</Button>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
