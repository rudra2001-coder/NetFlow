'use client';

import React, { useState } from 'react';
import { Settings, Plus, Trash2, Edit2, Lock } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Preset {
  id: string;
  name: string;
  category: string;
  description: string;
  createdDate: string;
  isActive: boolean;
}

const mockPresets: Preset[] = [
  { id: '1', name: 'Standard QoS', category: 'QoS', description: 'Default Quality of Service settings', createdDate: '2024-01-10', isActive: true },
  { id: '2', name: 'Premium Bandwidth', category: 'Bandwidth', description: 'High-speed bandwidth configuration', createdDate: '2024-01-15', isActive: true },
  { id: '3', name: 'Limited Access', category: 'Access', description: 'Restricted access tier settings', createdDate: '2024-01-20', isActive: false },
];

export default function PresetsPage() {
  const [presets] = useState<Preset[]>(mockPresets);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Configuration Presets</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Manage reusable network configuration templates</p>
        </div>
        <Button><Plus size={18} className="mr-2" /> New Preset</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {presets.map((preset) => (
          <Card key={preset.id} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings size={20} className="text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{preset.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{preset.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-700 dark:text-neutral-300">
                      {preset.category}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">{preset.createdDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={preset.isActive ? 'success' : 'default'}>
                    {preset.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={16} className="text-red-500" /></Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
