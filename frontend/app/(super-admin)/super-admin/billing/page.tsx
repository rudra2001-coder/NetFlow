'use client';

import React, { useState } from 'react';
import { CreditCard, TrendingUp, Wallet, Receipt } from 'lucide-react';
import { Card, CardBody, CardHeader, Badge } from '@/components';

interface BillingRecord {
  id: string;
  isp: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  invoiceId: string;
}

const mockBilling: BillingRecord[] = [
  { id: '1', isp: 'TeleComm Inc', amount: 15000, status: 'paid', dueDate: '2024-01-31', invoiceId: 'INV-2024-001' },
  { id: '2', isp: 'NetWorks Pro', amount: 12500, status: 'pending', dueDate: '2024-02-15', invoiceId: 'INV-2024-002' },
  { id: '3', isp: 'Global Internet', amount: 8750, status: 'overdue', dueDate: '2024-01-20', invoiceId: 'INV-2024-003' },
];

export default function BillingPage() {
  const [billing] = useState<BillingRecord[]>(mockBilling);
  const totalRevenue = billing.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = billing.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Billing & Revenue</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Monitor enterprise billing and revenue streams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Revenue</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CreditCard size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Paid</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">${paidAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Wallet size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">${(totalRevenue - paidAmount).toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Transactions"></CardHeader>
        <CardBody>
          <div className="space-y-3">
            {billing.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-3">
                  <Receipt size={16} className="text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{record.isp}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{record.invoiceId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-white">${record.amount.toLocaleString()}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{record.dueDate}</p>
                  </div>
                  <Badge variant={record.status === 'paid' ? 'success' : record.status === 'pending' ? 'warning' : 'error'}>
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
