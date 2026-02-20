'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@/components';
import { ScrollText } from 'lucide-react';

export default function AccountingLedger() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <CardHeader title="General Ledger" subtitle="Journal entries and account balances" />
        <CardBody>
          <p className="text-sm text-neutral-500">Placeholder for ledger entries and quick account search.</p>
        </CardBody>
      </Card>
    </div>
  );
}
