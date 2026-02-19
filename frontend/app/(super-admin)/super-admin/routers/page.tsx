'use client';

import React, { useState } from 'react';
import { Network, Edit2, Trash2, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Router {
  id: string;
  name: string;
  ipAddress: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline' | 'updating';
  uptime: number;
}

const mockRouters: Router[] = [
  { id: '1', name: 'Router-North-01', ipAddress: '192.168.1.1', model: 'MikroTik RB4011', firmware: '6.48.6', status: 'online', uptime: 99.8 },
  { id: '2', name: 'Router-North-02', ipAddress: '192.168.1.2', model: 'MikroTik RB3011', firmware: '6.48.6', status: 'online', uptime: 99.8 },
];

export default function RoutersPage() {
  const [routers] = useState<Router[]>(mockRouters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Network Routers</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Global router management and configuration</p>
        </div>
        <Button><Plus size={18} className="mr-2" /> Add Router</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">IP Address</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Model</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Firmware</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Uptime</th>
              <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routers.map((router) => (
              <tr key={router.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="py-3 px-4 text-neutral-900 dark:text-white font-medium">{router.name}</td>
                <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{router.ipAddress}</td>
                <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{router.model}</td>
                <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{router.firmware}</td>
                <td className="py-3 px-4">
                  <Badge variant={router.status === 'online' ? 'success' : 'warning'}>{router.status}</Badge>
                </td>
                <td className="py-3 px-4 text-neutral-900 dark:text-white font-medium">{router.uptime}%</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={16} className="text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
