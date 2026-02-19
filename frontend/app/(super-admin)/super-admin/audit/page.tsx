'use client';

import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'Router Configuration Updated', user: 'admin@company.com', target: 'Router-North-01', timestamp: '2024-02-15 14:32:45', status: 'success', ipAddress: '192.168.1.100' },
  { id: '2', action: 'User Role Changed', user: 'superadmin@company.com', target: 'user@company.com', timestamp: '2024-02-15 13:15:20', status: 'success', ipAddress: '10.0.0.1' },
  { id: '3', action: 'Billing Invoice Generated', user: 'system', target: 'Invoice-2024-015', timestamp: '2024-02-15 00:00:00', status: 'failed', ipAddress: 'system' },
];

export default function AuditPage() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Audit Logs</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Track all system activities and changes</p>
        </div>
        <Button><Download size={18} className="mr-2" /> Export</Button>
      </div>

      <Card>
        <CardHeader title="Filters"></CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by user..."
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Search by action..."
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />
          <input
            type="date"
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />
          <Button>Filter</Button>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardBody className="flex items-center justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-white">{log.action}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">User</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{log.user}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Target</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{log.target}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">IP Address</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{log.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Timestamp</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                {log.status}
              </Badge>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
