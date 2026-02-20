'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Code } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Tariff {
  id: string;
  name: string;
  description: string;
  bandwidth: string;
  downloadSpeed: string;
  uploadSpeed: string;
  price: number;
  currency: string;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  validFrom: string;
  validTo?: string;
  status: 'active' | 'inactive' | 'archived';
  appliedToResellers: number;
}

const mockTariffs: Tariff[] = [
  {
    id: '1',
    name: 'Basic Internet',
    description: 'Entry-level broadband package',
    bandwidth: 'Unlimited',
    downloadSpeed: '25 Mbps',
    uploadSpeed: '5 Mbps',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    validFrom: '2024-01-01',
    status: 'active',
    appliedToResellers: 15,
  },
  {
    id: '2',
    name: 'Premium Internet',
    description: 'High-speed broadband for power users',
    bandwidth: 'Unlimited',
    downloadSpeed: '100 Mbps',
    uploadSpeed: '20 Mbps',
    price: 79.99,
    currency: 'USD',
    billingCycle: 'monthly',
    validFrom: '2024-01-01',
    status: 'active',
    appliedToResellers: 8,
  },
];

export default function ResellersPageTariffs() {
  const [tariffs] = useState<Tariff[]>(mockTariffs);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Reseller Tariffs</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage pricing plans and packages offered to resellers
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Add Tariff
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tariffs.map((tariff) => (
          <Card key={tariff.id} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{tariff.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{tariff.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Download Speed</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{tariff.downloadSpeed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Upload Speed</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{tariff.uploadSpeed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Bandwidth</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{tariff.bandwidth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Resellers</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{tariff.appliedToResellers}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Price</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        ${tariff.price}
                        <span className="text-lg text-neutral-600 dark:text-neutral-400 font-normal">/{tariff.billingCycle}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Billing Cycle</p>
                      <p className="text-neutral-900 dark:text-white font-semibold capitalize">{tariff.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Status</p>
                      <Badge variant={tariff.status === 'active' ? 'success' : 'warning'}>
                        {tariff.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" title="Copy Tariff">
                    <Copy size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" title="Edit">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete">
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
