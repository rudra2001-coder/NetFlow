'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components';

interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const metrics: AnalyticsMetric[] = [
  { label: 'Total Revenue', value: '$2.4M', change: '+12.5%', icon: <DollarSign size={24} /> },
  { label: 'Active Users', value: '12.5K', change: '+8.2%', icon: <Users size={24} /> },
  { label: 'Growth Rate', value: '23.5%', change: '+4.3%', icon: <TrendingUp size={24} /> },
  { label: 'Network Load', value: '64%', change: '-2.1%', icon: <BarChart3 size={24} /> },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Network Analytics</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Real-time analytics across all ISPs and networks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  {metric.icon}
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{metric.change}</span>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{metric.label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metric.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Network Performance Trend"></CardHeader>
        <CardBody>
          <div className="h-64 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
            Chart visualization would go here
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
