'use client';

import React, { useState } from 'react';
import { Server, AlertCircle, Clock, Signal } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';
import { cn } from '@/lib/utils';

interface Cluster {
  id: string;
  name: string;
  region: string;
  routerCount: number;
  status: 'operational' | 'degraded' | 'offline';
  latency: number;
  capacity: number;
}

const mockClusters: Cluster[] = [
  { id: '1', name: 'North DC', region: 'North', routerCount: 24, status: 'operational', latency: 2, capacity: 94 },
  { id: '2', name: 'South DC', region: 'South', routerCount: 18, status: 'operational', latency: 3, capacity: 87 },
  { id: '3', name: 'East DC', region: 'East', routerCount: 12, status: 'degraded', latency: 15, capacity: 78 },
];

export default function ClustersPage() {
  const [clusters] = useState<Cluster[]>(mockClusters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Router Clusters</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Manage and monitor router clusters globally</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className="hover:shadow-lg transition-shadow">
            <CardHeader title={cluster.name}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{cluster.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{cluster.region}</p>
                </div>
                <Badge variant={cluster.status === 'operational' ? 'success' : 'warning'}>
                  {cluster.status}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Server size={18} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Routers</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{cluster.routerCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Signal size={18} className="text-green-500" />
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Latency</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{cluster.latency}ms</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Capacity</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{cluster.capacity}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${cluster.capacity}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
