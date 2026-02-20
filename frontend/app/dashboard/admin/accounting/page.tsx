'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button } from '@/components';
import { PieChart } from 'lucide-react';

export default function AccountingIndex() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="Accounting" subtitle="Overview of financials" />
        <CardBody>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-neutral-500">This section will centralize invoices, payments, expenses, ledger and reports.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push('/accounting/invoices')}>Invoices</Button>
              <Button size="sm" onClick={() => router.push('/accounting/payments')}>Payments</Button>
              <Button size="sm" onClick={() => router.push('/accounting/reports')}>Reports</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
