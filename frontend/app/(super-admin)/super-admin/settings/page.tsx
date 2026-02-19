'use client';

import React, { useState } from 'react';
import { Sliders, Save, RotateCcw } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Setting {
  key: string;
  label: string;
  category: string;
  value: string | boolean;
  type: 'text' | 'toggle' | 'select';
  options?: string[];
}

const mockSettings: Setting[] = [
  { key: 'maintenance_mode', label: 'Maintenance Mode', category: 'System', value: false, type: 'toggle' },
  { key: 'audit_logging', label: 'Enable Audit Logging', category: 'Security', value: true, type: 'toggle' },
  { key: 'session_timeout', label: 'Session Timeout (minutes)', category: 'Security', value: '30', type: 'text' },
  { key: 'max_login_attempts', label: 'Maximum Login Attempts', category: 'Security', value: '5', type: 'text' },
  { key: 'auto_backup', label: 'Automatic Backup', category: 'Backup', value: true, type: 'toggle' },
  { key: 'backup_frequency', label: 'Backup Frequency', category: 'Backup', value: 'daily', type: 'select', options: ['hourly', 'daily', 'weekly'] },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>(mockSettings);

  const handleChange = (key: string, newValue: string | boolean) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value: newValue } : s));
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">System Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Configure global system parameters and policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RotateCcw size={18} className="mr-2" /> Reset</Button>
          <Button><Save size={18} className="mr-2" /> Save Changes</Button>
        </div>
      </div>

      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader title={`${category} Settings`}></CardHeader>
          <CardBody className="space-y-4">
            {categorySettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{setting.label}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{setting.key}</p>
                </div>
                <div>
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => handleChange(setting.key, !setting.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.value ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={typeof setting.value === 'string' ? setting.value : ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white w-40"
                    />
                  )}
                  {setting.type === 'select' && (
                    <select
                      value={typeof setting.value === 'string' ? setting.value : ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white w-40"
                    >
                      {setting.options?.map((opt) => (
                        <option key={opt} value={opt} className="bg-neutral-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
