'use client';

import React, { useState } from 'react';
import { Package, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Subscription {
  id: string;
  name: string;
  tier: 'basic' | 'professional' | 'enterprise';
  customers: number;
  monthlyRevenue: number;
  status: 'active' | 'deprecated';
  createdDate: string;
}

const mockSubscriptions: Subscription[] = [
  { id: '1', name: 'Basic ISP', tier: 'basic', customers: 245, monthlyRevenue: 24500, status: 'active', createdDate: '2023-01-15' },
  { id: '2', name: 'Professional ISP', tier: 'professional', customers: 128, monthlyRevenue: 64000, status: 'active', createdDate: '2023-02-20' },
  { id: '3', name: 'Enterprise ISP', tier: 'enterprise', customers: 42, monthlyRevenue: 84000, status: 'active', createdDate: '2023-03-10' },
];

export default function SubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Subscription Plans</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Manage ISP subscription tiers and offerings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader title={subscription.name}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{subscription.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">{subscription.tier}</p>
                </div>
                <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                  {subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Customers</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{subscription.customers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Revenue</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">${subscription.monthlyRevenue / 1000}k</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Calendar size={14} />
                Created {new Date(subscription.createdDate).toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Edit Plan
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
